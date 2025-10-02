from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@postgres:5432/demo"
    openai_api_key: str = ""
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    upload_dir: str = "uploads"
    
    # Cost Protection Settings
    max_file_size_mb: int = 10  # Maximum file size in MB
    max_files_per_case: int = 5  # Maximum files per case
    max_total_files: int = 20  # Maximum total files in system
    max_chat_requests_per_hour: int = 30  # Chat requests per hour per IP
    max_chat_requests_per_day: int = 100  # Chat requests per day per IP
    max_document_pages: int = 50  # Maximum pages per document
    max_text_length: int = 100000  # Maximum characters for processing
    
    # Storage Protection
    max_storage_mb: int = 500  # Maximum total storage in MB
    cleanup_after_days: int = 7  # Auto-cleanup files after N days
    
    # Demo Mode Settings
    demo_mode: bool = True  # Enable demo protections
    max_embeddings_per_document: int = 100  # Limit vector embeddings
    
    class Config:
        env_file = ".env"

settings = Settings()
