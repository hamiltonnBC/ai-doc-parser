from sqlalchemy.orm import Session
from app.models import Document, ExtractedEntity
from app.services.ocr_service import OCRService
from app.services.storage_service import StorageService
from app.services.summary_service import SummaryService
from app.services.extraction_service import ExtractionService
from app.services.rag_service import rag_service
import logging

logger = logging.getLogger(__name__)

class DocumentProcessor:
    """
    Orchestrates document processing pipeline:
    1. OCR/Text extraction
    2. Document classification
    3. AI summarization
    4. Entity extraction
    5. Update database
    """
    
    def __init__(self):
        self.ocr_service = OCRService()
        self.storage_service = StorageService()
        self.summary_service = SummaryService()
        self.extraction_service = ExtractionService()
    
    def process_document(self, document: Document, db: Session) -> Document:
        """
        Process a document through the full pipeline with progress tracking.
        """
        try:
            logger.info(f"Processing document: {document.id}")
            
            # Initialize processing
            document.processing_status = "processing"
            document.processing_progress = 0
            document.processing_step = "Starting document processing..."
            db.commit()
            
            # Step 1: Extract text (20% progress)
            document.processing_step = "Extracting text from document..."
            document.processing_progress = 10
            db.commit()
            
            extracted_text, page_count = self.ocr_service.extract_text(document.file_path)
            
            document.processing_progress = 20
            db.commit()
            
            # Step 2: Classify document (40% progress)
            document.processing_step = "Classifying document type..."
            document.processing_progress = 30
            db.commit()
            
            document_type = self.ocr_service.classify_document(extracted_text)
            
            document.processing_progress = 40
            db.commit()
            
            # Step 3: Generate summary (60% progress)
            document.processing_step = "Generating AI summary..."
            document.processing_progress = 50
            db.commit()
            
            summary = self.summary_service.generate_document_summary(extracted_text, document_type)
            
            document.processing_progress = 60
            db.commit()
            
            # Step 4: Extract entities (80% progress)
            document.processing_step = "Extracting medical entities..."
            document.processing_progress = 70
            db.commit()
            
            entities = self.extraction_service.extract_entities(extracted_text, document_type)
            
            document.processing_progress = 80
            db.commit()
            
            # Update document record
            document.ocr_text = extracted_text
            document.page_count = page_count
            document.document_type = document_type
            document.summary = summary
            
            # Save extracted entities
            for entity_data in entities:
                entity = ExtractedEntity(
                    document_id=document.id,
                    entity_type=entity_data["entity_type"],
                    entity_value=entity_data["entity_value"],
                    confidence=entity_data["confidence"],
                    source_location=entity_data.get("source_location")
                )
                db.add(entity)
            
            db.commit()
            
            # Step 5: Generate embeddings for RAG (100% progress)
            document.processing_step = "Generating embeddings for AI search..."
            document.processing_progress = 90
            db.commit()
            
            try:
                embedding_success = rag_service.add_document_to_vectorstore(document.id, extracted_text, db)
                if embedding_success:
                    logger.info(f"Embeddings generated successfully for document: {document.id}")
                else:
                    logger.warning(f"Failed to generate embeddings for document: {document.id}")
            except Exception as e:
                logger.error(f"Error generating embeddings for document {document.id}: {str(e)}")
                # Don't fail the entire process if embedding generation fails
            
            # Mark as completed
            document.processed = True
            document.processing_status = "completed"
            document.processing_progress = 100
            document.processing_step = "Processing completed successfully"
            db.commit()
            db.refresh(document)
            
            logger.info(f"Document processed successfully: {document.id} - {len(entities)} entities extracted")
            return document
            
        except Exception as e:
            logger.error(f"Error processing document {document.id}: {str(e)}")
            document.processed = False
            document.processing_status = "failed"
            document.processing_step = f"Processing failed: {str(e)}"
            db.commit()
            raise
