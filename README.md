# InQuery Demo - AI-Powered Medical Document Processing Platform

> **⚠️ Demonstration Project**: This is a technical demonstration built for a job application to showcase full-stack AI development capabilities. It is not a finished product and is intended to demonstrate competency with modern AI/ML technologies and software engineering practices.

## 🎯 Project Overview

This application demonstrates an intelligent medical document processing system that combines OCR, natural language processing, and retrieval-augmented generation (RAG) to transform unstructured medical documents into searchable, queryable knowledge bases.

**Key Capabilities:**
- 📄 **Multi-format Document Processing** - PDF, images, scanned documents
- 🔍 **Advanced OCR** - Extract text from complex medical documents
- 🤖 **AI-Powered Entity Extraction** - Identify medications, diagnoses, providers, dates
- 💬 **Intelligent Document Chat** - Ask questions and get answers with source citations
- 📊 **Automated Summarization** - Generate concise document summaries
- 🔗 **RAG Implementation** - LangChain + pgvector for accurate, grounded responses
- 📱 **Modern UI** - React + TypeScript with Atomic Design principles

## 🏗️ Tech Stack

This project replicates a modern AI company's technology stack to demonstrate proficiency with industry-standard tools:

### **Frontend**
- **React 18** with **TypeScript** - Type-safe component development
- **Vite** - Fast development and build tooling
- **Tailwind CSS** - Utility-first styling
- **Atomic Design** - Scalable component architecture (atoms → molecules → organisms → templates → pages)

### **Backend**
- **FastAPI** - High-performance Python web framework
- **SQLAlchemy** - Database ORM with async support
- **Pydantic** - Data validation and serialization

### **AI/ML Stack**
- **OpenAI GPT-4o-mini** - Text generation and summarization
- **OpenAI Embeddings** - Vector representations for semantic search
- **LangChain** - AI application framework and RAG orchestration
- **LangExtract** - Structured entity extraction from unstructured text

### **Data & Storage**
- **PostgreSQL** - Primary database
- **pgvector** - Vector similarity search for RAG
- **Docker & Docker Compose** - Containerized development and deployment

### **Document Processing**
- **PyPDF2** - PDF text extraction
- **pdf2image** - PDF to image conversion
- **EasyOCR** - Optical character recognition
- **Pillow** - Image processing and enhancement

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- OpenAI API key

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-doc-parser
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Sample Usage

1. **Upload Documents** - Drag and drop PDF files or images
2. **Wait for Processing** - OCR and AI extraction happens automatically
3. **View Results** - See extracted entities, summaries, and structured data
4. **Ask Questions** - Use the chat interface to query your documents
5. **Export Data** - Download conversation history and summaries

## 🏛️ Architecture

### System Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Frontend │    │   FastAPI Backend │    │   PostgreSQL    │
│                 │    │                  │    │   + pgvector    │
│ • Document UI   │◄──►│ • REST API       │◄──►│                 │
│ • Chat Interface│    │ • Document Proc. │    │ • Documents     │
│ • File Upload   │    │ • AI Services    │    │ • Entities      │
└─────────────────┘    └──────────────────┘    │ • Embeddings    │
                                │               │ • Chat History  │
                                ▼               └─────────────────┘
                       ┌──────────────────┐
                       │   AI Services    │
                       │                  │
                       │ • OpenAI GPT-4   │
                       │ • OpenAI Embed.  │
                       │ • LangChain RAG  │
                       │ • EasyOCR        │
                       └──────────────────┘
```

### Document Processing Pipeline
```
PDF/Image Upload → OCR Extraction → Text Cleaning → Entity Extraction → Embedding Generation → Vector Storage → RAG Ready
```

### Component Architecture (Atomic Design)
```
Pages (Dashboard, DocumentDetail, ChatHistory)
    ↓
Templates (DashboardLayout)
    ↓
Organisms (ChatInterface, DocumentList, EntityList)
    ↓
Molecules (ChatMessage, DocumentCard, FileUploader)
    ↓
Atoms (Button, Input, Badge, Spinner)
```

## 🔧 Key Features

### 📄 Document Processing
- **Multi-format Support**: PDF, JPEG, PNG, scanned documents
- **Intelligent OCR**: Handles complex layouts, tables, and handwritten text
- **Document Classification**: Automatically categorizes document types
- **Quality Assessment**: Flags low-quality scans for reprocessing

### 🤖 AI-Powered Extraction
- **Entity Recognition**: Extracts medications, diagnoses, providers, dates, procedures
- **Confidence Scoring**: Provides reliability metrics for extracted data
- **Source Grounding**: Links every extraction back to original document location
- **Medical Terminology**: Optimized for healthcare document processing

### 💬 Intelligent Chat Interface
- **RAG Implementation**: Questions answered using document content, not hallucinations
- **Source Citations**: Every answer includes references to source documents
- **Conversation Memory**: Maintains context using LangChain memory
- **Multi-document Queries**: Ask questions across entire document collections

### 📊 Data Management
- **Case Organization**: Group related documents into cases
- **Search & Filter**: Full-text search across all processed documents
- **Export Capabilities**: Download chat history, summaries, and extracted data
- **Version Control**: Track document processing history and updates

## 🎨 User Interface

### Design Principles
- **Clinical Clarity**: Clean, professional interface suitable for healthcare professionals
- **Information Density**: Display comprehensive data without overwhelming users
- **Quick Actions**: Common tasks accessible within 1-2 clicks
- **Trust Indicators**: Confidence scores and source citations build user trust
- **Accessibility**: WCAG 2.1 AA compliant design

### Key UI Components
- **Document Cards**: Preview, status indicators, and quick actions
- **Split View**: Original document alongside extracted data
- **Chat Interface**: Conversational AI with source highlighting
- **Timeline View**: Chronological organization of medical events
- **Entity Tables**: Structured display of extracted information

## 🔍 Technical Deep Dive

### RAG Implementation
```python
# LangChain + pgvector RAG pipeline
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores.pgvector import PGVector
from langchain.chains import RetrievalQA

# Vector store with PostgreSQL + pgvector
vectorstore = PGVector.from_documents(
    documents=chunks,
    embedding=OpenAIEmbeddings(),
    connection_string=DATABASE_URL,
    collection_name="document_embeddings"
)

# Retrieval-augmented generation
qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4o-mini"),
    retriever=vectorstore.as_retriever(search_kwargs={"k": 4}),
    return_source_documents=True
)
```

### Entity Extraction
```python
# LangExtract for structured data extraction
from langextract import LangExtract

extraction_config = {
    "entities": [
        {"name": "medication", "description": "Medications prescribed or mentioned"},
        {"name": "diagnosis", "description": "Medical diagnoses and conditions"},
        {"name": "provider", "description": "Healthcare provider names and specialties"},
        {"name": "date_of_service", "description": "Dates of medical services"}
    ]
}

extractor = LangExtract(config=extraction_config)
structured_data = extractor.extract(ocr_text)
```

### Database Schema
```sql
-- Core tables with pgvector support
CREATE EXTENSION vector;

CREATE TABLE cases (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE documents (
    id UUID PRIMARY KEY,
    case_id UUID REFERENCES cases(id),
    filename VARCHAR(255) NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    ocr_text TEXT,
    summary TEXT
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY,
    case_id UUID REFERENCES cases(id),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sources JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Vector embeddings for RAG
CREATE TABLE langchain_pg_embedding (
    id UUID PRIMARY KEY,
    embedding vector(1536),
    document TEXT,
    cmetadata JSONB
);
```

## 📈 Performance & Scalability

### Current Capabilities
- **Document Processing**: ~30 seconds for multi-page PDFs
- **Chat Response Time**: <3 seconds for complex queries
- **Concurrent Users**: Designed for development/demo use
- **Storage**: Local file system + PostgreSQL

### Production Considerations
- **Async Processing**: Background job queues for document processing
- **Caching**: Redis for frequently accessed summaries and embeddings
- **CDN**: Static asset delivery for document previews
- **Horizontal Scaling**: Microservices architecture for high-volume processing
- **Monitoring**: Logging, metrics, and health checks

## 🔒 Security & Compliance

### Current Implementation
- **Data Privacy**: Uses mock/anonymized medical data
- **Input Validation**: Pydantic schemas for API request validation
- **Error Handling**: Graceful failure modes with user-friendly messages
- **Rate Limiting**: Basic protection against API abuse

### Production Requirements
- **HIPAA Compliance**: Encryption at rest and in transit
- **Authentication**: JWT-based user authentication and authorization
- **Audit Logging**: Complete audit trail for document access and AI operations
- **Data Retention**: Configurable retention policies for sensitive data

## 🧪 Testing & Quality

### Included Tests
- **Unit Tests**: Core business logic and AI service functions
- **Integration Tests**: API endpoints and database operations
- **Component Tests**: React component behavior and rendering

### Quality Assurance
- **TypeScript**: Compile-time type checking
- **ESLint**: Code style and quality enforcement
- **Prettier**: Consistent code formatting
- **Docker**: Consistent development and deployment environments

## 📚 Documentation

### API Documentation
- **Interactive Docs**: Available at `/docs` (Swagger UI)
- **OpenAPI Spec**: Machine-readable API specification
- **Code Comments**: Comprehensive inline documentation

### Architecture Documentation
- **System Design**: High-level architecture diagrams
- **Database Schema**: Entity relationship diagrams
- **Component Library**: Storybook documentation (planned)

## 🚀 Deployment

### Development
```bash
# Local development with hot reload
docker-compose up --build

# Run tests
docker-compose exec backend pytest
docker-compose exec frontend npm test
```

### Production Deployment
- **Cloud Platforms**: AWS, GCP, Azure compatible
- **Container Orchestration**: Kubernetes ready
- **Database**: Managed PostgreSQL with pgvector support
- **Monitoring**: Application performance monitoring integration

## 🎯 Demonstration Scenarios

### Medical Records Processing
1. Upload a multi-page medical record PDF
2. Watch automatic OCR and entity extraction
3. Review extracted medications, diagnoses, and dates
4. Ask questions like "What medications is the patient taking?"
5. Export conversation history and summaries

### Document Intelligence
1. Upload multiple related documents
2. Ask cross-document questions
3. Receive answers with source citations
4. Navigate to source documents via clickable references

## 🔮 Future Enhancements

### Planned Features
- **Advanced OCR**: AWS Textract integration for superior accuracy
- **Document Classification**: ML-based automatic document type detection
- **Timeline Generation**: Automatic chronological medical history
- **Redaction Tools**: PII identification and masking
- **Analytics Dashboard**: Processing metrics and usage analytics

### Scalability Improvements
- **Microservices**: Service decomposition for independent scaling
- **Event Streaming**: Apache Kafka for real-time document processing
- **Caching Layer**: Redis for improved response times
- **Load Balancing**: Multi-instance deployment support

## 🤝 Contributing

This is a demonstration project, but feedback and suggestions are welcome:

1. **Code Review**: Examine implementation patterns and architectural decisions
2. **Feature Suggestions**: Ideas for additional AI/ML capabilities
3. **Performance Optimization**: Suggestions for scalability improvements
4. **UI/UX Feedback**: User experience enhancement ideas

## 📄 License

This project is created for demonstration purposes. Please respect the educational nature of this codebase.

## 🙏 Acknowledgments

- **OpenAI** - GPT-4 and embedding models
- **LangChain** - RAG framework and AI orchestration
- **pgvector** - PostgreSQL vector similarity search
- **FastAPI** - High-performance Python web framework
- **React Team** - Modern frontend development framework

---

**Built with ❤️ to demonstrate full-stack AI development capabilities**

*This project showcases modern AI/ML engineering practices, scalable software architecture, and production-ready development workflows. It represents a commitment to technical excellence and innovative problem-solving in the healthcare technology space.*
