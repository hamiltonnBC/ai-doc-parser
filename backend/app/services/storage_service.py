import os
import shutil
from typing import Optional

class StorageService:
    """
    Local file storage service.
    For production, this would integrate with S3 or similar.
    """
    
    def __init__(self, base_path: str = "uploads"):
        self.base_path = base_path
        os.makedirs(base_path, exist_ok=True)
    
    def save_file(self, file_path: str, destination: str) -> str:
        """
        Save file to storage.
        Returns the storage path.
        """
        dest_path = os.path.join(self.base_path, destination)
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        
        shutil.copy2(file_path, dest_path)
        return dest_path
    
    def get_file_path(self, file_id: str) -> Optional[str]:
        """Get the full path to a stored file"""
        file_path = os.path.join(self.base_path, file_id)
        if os.path.exists(file_path):
            return file_path
        return None
    
    def delete_file(self, file_path: str) -> bool:
        """Delete a file from storage"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception:
            return False
