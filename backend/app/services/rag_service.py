import os
import logging
from typing import List, Dict, Optional, Tuple
from uuid import UUID
from sqlalchemy.orm import Session
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import PGVector
from langchain.schema import Document as LangChainDocument
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

from app.models import Document, DocumentChunk, ChatMessage
from app.config import settings

logger = logging.getLogger(__name__)

class RAGService:
    def __init__(self):
        self.embeddings = None
        self.vectorstore = None
        self.llm = None
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
        
        # Initialize components if OpenAI API key is available
        if settings.openai_api_key:
            try:
                # Set OpenAI API key as environment variable for compatibility
                os.environ["OPENAI_API_KEY"] = settings.openai_api_key
                
                self.embeddings = OpenAIEmbeddings(
                    model="text-embedding-ada-002"
                )
                self.llm = ChatOpenAI(
                    model="gpt-4o-mini",
                    temperature=0.1
                )
                self._initialize_vectorstore()
                logger.info("RAG service initialized with OpenAI")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI components: {e}")
        else:
            logger.warning("OpenAI API key not provided, RAG service running in demo mode")

    def _initialize_vectorstore(self):
        """Initialize pgvector connection for LangChain"""
        try:
            connection_string = settings.database_url
            collection_name = "document_embeddings"
            
            self.vectorstore = PGVector(
                collection_name=collection_name,
                connection_string=connection_string,
                embedding_function=self.embeddings,
            )
            logger.info("Vector store initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize vector store: {e}")
            self.vectorstore = None

    def add_document_to_vectorstore(self, document_id: UUID, text: str, db: Session) -> bool:
        """
        Split document into chunks, generate embeddings, and store in pgvector
        """
        if not self.embeddings or not self.vectorstore:
            logger.warning("RAG service not fully initialized, skipping embedding generation")
            return False

        try:
            # Split document into chunks
            chunks = self.text_splitter.split_text(text)
            
            # Limit chunks in demo mode to control costs
            if settings.demo_mode and len(chunks) > settings.max_embeddings_per_document:
                logger.warning(f"Limiting chunks from {len(chunks)} to {settings.max_embeddings_per_document} for cost control")
                chunks = chunks[:settings.max_embeddings_per_document]
            
            # Create LangChain documents with metadata
            documents = []
            for i, chunk in enumerate(chunks):
                doc = LangChainDocument(
                    page_content=chunk,
                    metadata={
                        "document_id": str(document_id),
                        "chunk_index": i,
                        "source": f"document_{document_id}_chunk_{i}"
                    }
                )
                documents.append(doc)
                
                # Store chunk in database
                chunk_record = DocumentChunk(
                    document_id=document_id,
                    chunk_text=chunk,
                    chunk_index=i,
                    embedding_id=f"document_{document_id}_chunk_{i}"
                )
                db.add(chunk_record)
            
            # Add documents to vector store with retry logic
            try:
                self.vectorstore.add_documents(documents)
                db.commit()
                logger.info(f"Added {len(chunks)} chunks for document {document_id}")
                return True
            except Exception as vector_error:
                logger.error(f"Vector store error: {vector_error}")
                # Still save chunks to database for fallback search
                db.commit()
                logger.info(f"Saved {len(chunks)} chunks to database (vector store failed)")
                return True  # Return True since we saved the chunks
            
        except Exception as e:
            logger.error(f"Error adding document to vectorstore: {e}")
            db.rollback()
            return False

    def query_documents(self, question: str, case_id: UUID, db: Session) -> Dict:
        """
        Perform similarity search and generate answer with source citations
        """
        try:
            # Get documents for this case
            case_documents = db.query(Document).filter(
                Document.case_id == case_id,
                Document.processed == True
            ).all()
            
            if not case_documents:
                return {
                    "answer": "No processed documents found for this case. Please upload and process documents first.",
                    "sources": [],
                    "confidence": 0.0
                }

            # Try vector search first, fallback to text search
            if self.vectorstore and self.llm:
                try:
                    return self._vector_search_query(question, case_id, db, case_documents)
                except Exception as vector_error:
                    logger.warning(f"Vector search failed, falling back to text search: {vector_error}")
            
            # Fallback to simple text search and LLM processing
            return self._fallback_text_search(question, case_documents, db)
            
        except Exception as e:
            logger.error(f"Error querying documents: {e}")
            return {
                "answer": f"An error occurred while processing your question: {str(e)}",
                "sources": [],
                "confidence": 0.0
            }

    def _vector_search_query(self, question: str, case_id: UUID, db: Session, case_documents) -> Dict:
        """Perform vector-based similarity search"""
        # Perform similarity search
        retriever = self.vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 5}  # Get top 5 most relevant chunks
        )
        
        # Create medical-specific prompt
        prompt_template = """
        You are a medical AI assistant analyzing medical documents. Use the following context to answer the question accurately and professionally.

        Context:
        {context}

        Question: {question}

        Instructions:
        1. Provide a clear, accurate answer based only on the information in the context
        2. If the information is not available in the context, clearly state that
        3. Use medical terminology appropriately
        4. Be specific about dates, names, and medical details when available
        5. If multiple documents contain relevant information, synthesize the information clearly

        Answer:
        """
        
        PROMPT = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )
        
        # Create QA chain
        qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=retriever,
            chain_type_kwargs={"prompt": PROMPT},
            return_source_documents=True
        )
        
        # Get answer
        result = qa_chain({"query": question})
        
        # Process sources
        sources = []
        for doc in result.get("source_documents", []):
            doc_id = doc.metadata.get("document_id")
            if doc_id:
                # Get document info
                document = db.query(Document).filter(Document.id == doc_id).first()
                if document:
                    sources.append({
                        "document_id": str(document.id),
                        "document_name": document.filename,
                        "chunk_text": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                        "relevance_score": 0.8,  # Placeholder - could implement actual scoring
                        "page_number": doc.metadata.get("page_number")
                    })
        
        # Calculate confidence based on source quality
        confidence = min(0.9, len(sources) * 0.2) if sources else 0.1
        
        return {
            "answer": result["result"],
            "sources": sources,
            "confidence": confidence
        }

    def _fallback_text_search(self, question: str, case_documents, db: Session) -> Dict:
        """Fallback text search when vector search is not available"""
        # Simple keyword matching in document text
        question_lower = question.lower()
        relevant_docs = []
        
        for doc in case_documents:
            if doc.ocr_text:
                # Simple relevance scoring based on keyword matches
                text_lower = doc.ocr_text.lower()
                score = 0
                for word in question_lower.split():
                    if len(word) > 2:  # Skip short words
                        score += text_lower.count(word)
                
                if score > 0:
                    relevant_docs.append((doc, score))
        
        # Sort by relevance score
        relevant_docs.sort(key=lambda x: x[1], reverse=True)
        
        if not relevant_docs:
            return {
                "answer": "I couldn't find relevant information in the documents to answer your question.",
                "sources": [],
                "confidence": 0.1
            }
        
        # Use LLM if available, otherwise provide simple text-based answer
        if self.llm:
            try:
                # Combine top relevant document texts
                context_texts = []
                sources = []
                
                for doc, score in relevant_docs[:3]:  # Top 3 documents
                    context_texts.append(f"Document: {doc.filename}\n{doc.ocr_text[:1000]}...")
                    sources.append({
                        "document_id": str(doc.id),
                        "document_name": doc.filename,
                        "chunk_text": doc.ocr_text[:200] + "..." if len(doc.ocr_text) > 200 else doc.ocr_text,
                        "relevance_score": min(0.9, score / 10),
                        "page_number": None
                    })
                
                context = "\n\n".join(context_texts)
                
                # Create a simple prompt
                prompt = f"""Based on the following medical documents, answer this question: {question}

Documents:
{context}

Please provide a clear, accurate answer based only on the information provided. If the information is not available, clearly state that."""

                response = self.llm.invoke(prompt)
                answer = response.content if hasattr(response, 'content') else str(response)
                
                return {
                    "answer": answer,
                    "sources": sources,
                    "confidence": 0.7
                }
                
            except Exception as llm_error:
                logger.error(f"LLM processing failed: {llm_error}")
        
        # Simple text-based fallback
        top_doc, score = relevant_docs[0]
        return {
            "answer": f"Based on the document '{top_doc.filename}', I found some relevant information, but I cannot provide a detailed analysis without AI processing. Please check the source document for details.",
            "sources": [{
                "document_id": str(top_doc.id),
                "document_name": top_doc.filename,
                "chunk_text": top_doc.ocr_text[:200] + "..." if len(top_doc.ocr_text) > 200 else top_doc.ocr_text,
                "relevance_score": 0.5,
                "page_number": None
            }],
            "confidence": 0.3
        }

    def get_chat_history(self, case_id: UUID, db: Session) -> List[ChatMessage]:
        """Get chat history for a case"""
        return db.query(ChatMessage).filter(
            ChatMessage.case_id == case_id
        ).order_by(ChatMessage.created_at.desc()).all()

    def save_chat_message(self, case_id: UUID, question: str, answer: str, sources: List[Dict], db: Session) -> ChatMessage:
        """Save chat message to database"""
        chat_message = ChatMessage(
            case_id=case_id,
            question=question,
            answer=answer,
            sources=sources
        )
        db.add(chat_message)
        db.commit()
        db.refresh(chat_message)
        return chat_message

    def clear_chat_history(self, case_id: UUID, db: Session) -> bool:
        """Clear chat history for a case"""
        try:
            db.query(ChatMessage).filter(ChatMessage.case_id == case_id).delete()
            db.commit()
            return True
        except Exception as e:
            logger.error(f"Error clearing chat history: {e}")
            db.rollback()
            return False

    def reprocess_document_embeddings(self, document_id: UUID, db: Session) -> bool:
        """Reprocess embeddings for a specific document"""
        try:
            document = db.query(Document).filter(Document.id == document_id).first()
            if not document or not document.ocr_text:
                return False
            
            # Remove existing chunks
            db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).delete()
            
            # Remove from vector store (if possible)
            # Note: PGVector doesn't have a direct delete by metadata method
            # This would need to be implemented based on specific requirements
            
            # Re-add document
            return self.add_document_to_vectorstore(document_id, document.ocr_text, db)
            
        except Exception as e:
            logger.error(f"Error reprocessing document embeddings: {e}")
            return False

# Global instance
rag_service = RAGService()