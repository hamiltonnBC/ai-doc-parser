import os
import asyncio
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from app.config import settings
from app.database import get_db
from app.models import Document, ChatMessage
import logging

logger = logging.getLogger(__name__)

class UsageService:
    
    @staticmethod
    def check_file_size(file_size_bytes: int) -> bool:
        """Check if file size is within limits"""
        max_size_bytes = settings.max_file_size_mb * 1024 * 1024
        if file_size_bytes > max_size_bytes:
            raise ValueError(f"File size ({file_size_bytes / 1024 / 1024:.1f}MB) exceeds maximum allowed size ({settings.max_file_size_mb}MB)")
        return True
    
    @staticmethod
    def check_total_storage(db: Session) -> bool:
        """Check if total storage is within limits"""
        if not settings.demo_mode:
            return True
            
        # Calculate total storage used
        upload_dir = settings.upload_dir
        total_size = 0
        
        if os.path.exists(upload_dir):
            for root, dirs, files in os.walk(upload_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    if os.path.exists(file_path):
                        total_size += os.path.getsize(file_path)
        
        total_size_mb = total_size / (1024 * 1024)
        
        if total_size_mb > settings.max_storage_mb:
            raise ValueError(f"Storage limit exceeded. Current: {total_size_mb:.1f}MB, Maximum: {settings.max_storage_mb}MB")
        
        return True
    
    @staticmethod
    def check_document_count(db: Session, case_id: str = None) -> bool:
        """Check document count limits"""
        if not settings.demo_mode:
            return True
        
        # Check total documents in system
        total_docs = db.query(Document).count()
        if total_docs >= settings.max_total_files:
            raise ValueError(f"Maximum total documents ({settings.max_total_files}) reached")
        
        # Check documents per case if case_id provided
        if case_id:
            case_docs = db.query(Document).filter(Document.case_id == case_id).count()
            if case_docs >= settings.max_files_per_case:
                raise ValueError(f"Maximum documents per case ({settings.max_files_per_case}) reached")
        
        return True
    
    @staticmethod
    def check_document_complexity(text_content: str, page_count: int = None) -> bool:
        """Check if document is within processing limits"""
        if not settings.demo_mode:
            return True
        
        # Check text length
        if len(text_content) > settings.max_text_length:
            raise ValueError(f"Document text too long ({len(text_content)} chars). Maximum: {settings.max_text_length} chars")
        
        # Check page count
        if page_count and page_count > settings.max_document_pages:
            raise ValueError(f"Document has too many pages ({page_count}). Maximum: {settings.max_document_pages} pages")
        
        return True
    
    @staticmethod
    def get_usage_stats(db: Session) -> dict:
        """Get current usage statistics"""
        try:
            # Document stats
            total_docs = db.query(Document).count()
            processed_docs = db.query(Document).filter(Document.processed == True).count()
            
            # Chat stats (last 24 hours)
            yesterday = datetime.utcnow() - timedelta(days=1)
            recent_chats = db.query(ChatMessage).filter(
                ChatMessage.created_at >= yesterday
            ).count()
            
            # Storage stats
            upload_dir = settings.upload_dir
            total_storage_bytes = 0
            
            if os.path.exists(upload_dir):
                for root, dirs, files in os.walk(upload_dir):
                    for file in files:
                        file_path = os.path.join(root, file)
                        if os.path.exists(file_path):
                            total_storage_bytes += os.path.getsize(file_path)
            
            total_storage_mb = total_storage_bytes / (1024 * 1024)
            
            return {
                "documents": {
                    "total": total_docs,
                    "processed": processed_docs,
                    "limit": settings.max_total_files
                },
                "storage": {
                    "used_mb": round(total_storage_mb, 2),
                    "limit_mb": settings.max_storage_mb,
                    "percentage": round((total_storage_mb / settings.max_storage_mb) * 100, 1)
                },
                "chat": {
                    "requests_24h": recent_chats,
                    "hourly_limit": settings.max_chat_requests_per_hour,
                    "daily_limit": settings.max_chat_requests_per_day
                },
                "limits": {
                    "max_file_size_mb": settings.max_file_size_mb,
                    "max_files_per_case": settings.max_files_per_case,
                    "max_document_pages": settings.max_document_pages,
                    "demo_mode": settings.demo_mode
                }
            }
        except Exception as e:
            logger.error(f"Error getting usage stats: {e}")
            return {"error": "Could not retrieve usage statistics"}
    
    @staticmethod
    async def cleanup_old_files(db: Session):
        """Clean up old files if cleanup is enabled"""
        if not settings.demo_mode or settings.cleanup_after_days <= 0:
            return
        
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=settings.cleanup_after_days)
            
            # Find old documents
            old_docs = db.query(Document).filter(
                Document.uploaded_at < cutoff_date
            ).all()
            
            cleaned_count = 0
            for doc in old_docs:
                try:
                    # Delete file from filesystem
                    if os.path.exists(doc.file_path):
                        os.remove(doc.file_path)
                    
                    # Delete from database
                    db.delete(doc)
                    cleaned_count += 1
                    
                except Exception as e:
                    logger.error(f"Error cleaning up document {doc.id}: {e}")
            
            if cleaned_count > 0:
                db.commit()
                logger.info(f"Cleaned up {cleaned_count} old documents")
                
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")
            db.rollback()

usage_service = UsageService()