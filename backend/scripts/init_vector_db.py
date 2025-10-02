#!/usr/bin/env python3
"""
Initialize vector database with pgvector extension and proper indexing
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import psycopg2
from app.config import settings
import logging

logger = logging.getLogger(__name__)

def init_vector_database():
    """Initialize pgvector extension and create necessary indexes"""
    try:
        # Parse database URL
        db_url = settings.database_url
        # Convert SQLAlchemy URL to psycopg2 format
        if db_url.startswith("postgresql://"):
            db_url = db_url.replace("postgresql://", "")
        
        # Extract connection parameters
        # Format: user:password@host:port/database
        auth_part, host_part = db_url.split("@")
        user, password = auth_part.split(":")
        host_port, database = host_part.split("/")
        host, port = host_port.split(":")
        
        # Connect to database
        conn = psycopg2.connect(
            host=host,
            port=port,
            database=database,
            user=user,
            password=password
        )
        
        cursor = conn.cursor()
        
        # Enable pgvector extension
        logger.info("Enabling pgvector extension...")
        cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        
        # Verify extension is installed
        cursor.execute("SELECT extname FROM pg_extension WHERE extname = 'vector';")
        result = cursor.fetchone()
        if result:
            logger.info("pgvector extension is installed and enabled")
        else:
            logger.error("Failed to enable pgvector extension")
            return False
        
        # Create indexes for LangChain tables (they will be created automatically)
        # But we can prepare the index creation for when they exist
        index_queries = [
            """
            CREATE INDEX IF NOT EXISTS langchain_pg_embedding_embedding_idx 
            ON langchain_pg_embedding USING ivfflat (embedding vector_cosine_ops) 
            WITH (lists = 100);
            """,
            """
            CREATE INDEX IF NOT EXISTS langchain_pg_collection_name_idx 
            ON langchain_pg_collection (name);
            """
        ]
        
        for query in index_queries:
            try:
                cursor.execute(query)
                logger.info("Index creation query executed (will create when table exists)")
            except psycopg2.Error as e:
                # This is expected if tables don't exist yet
                logger.info(f"Index creation skipped (table may not exist yet): {e}")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        logger.info("Vector database initialization completed successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error initializing vector database: {e}")
        return False

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    init_vector_database()