from sqlalchemy.orm import Session
from app.models import Document, ExtractedEntity
from app.services.ocr_service import OCRService
from app.services.storage_service import StorageService
from app.services.summary_service import SummaryService
from app.services.extraction_service import ExtractionService
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
        Process a document through the full pipeline.
        """
        try:
            logger.info(f"Processing document: {document.id}")
            
            # Step 1: Extract text
            extracted_text, page_count = self.ocr_service.extract_text(document.file_path)
            
            # Step 2: Classify document
            document_type = self.ocr_service.classify_document(extracted_text)
            
            # Step 3: Generate summary
            summary = self.summary_service.generate_document_summary(extracted_text, document_type)
            
            # Step 4: Extract entities
            entities = self.extraction_service.extract_entities(extracted_text, document_type)
            
            # Update document record
            document.ocr_text = extracted_text
            document.page_count = page_count
            document.document_type = document_type
            document.summary = summary
            document.processed = True
            
            db.commit()
            
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
            db.refresh(document)
            
            logger.info(f"Document processed successfully: {document.id} - {len(entities)} entities extracted")
            return document
            
        except Exception as e:
            logger.error(f"Error processing document {document.id}: {str(e)}")
            document.processed = False
            db.commit()
            raise
