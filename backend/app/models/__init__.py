from sqlalchemy import Column, String, Text, Boolean, Integer, Float, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database import Base

class Case(Base):
    __tablename__ = "cases"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    documents = relationship("Document", back_populates="case")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"))
    filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_type = Column(String(50))
    document_type = Column(String(100))
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    processed = Column(Boolean, default=False)
    ocr_text = Column(Text)
    summary = Column(Text)
    page_count = Column(Integer)
    
    case = relationship("Case", back_populates="documents")
    entities = relationship("ExtractedEntity", back_populates="document")

class ExtractedEntity(Base):
    __tablename__ = "extracted_entities"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"))
    entity_type = Column(String(100))
    entity_value = Column(Text)
    confidence = Column(Float)
    source_location = Column(JSON)
    extracted_at = Column(DateTime, default=datetime.utcnow)
    
    document = relationship("Document", back_populates="entities")

class Summary(Base):
    __tablename__ = "summaries"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"))
    summary_type = Column(String(50))
    content = Column(Text, nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)
