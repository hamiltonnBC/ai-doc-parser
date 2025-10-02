import os
from typing import Optional
from PIL import Image
import PyPDF2
from pdf2image import convert_from_path
import io

class OCRService:
    """
    OCR service for extracting text from documents.
    Uses PyPDF2 for digital PDFs and falls back to basic text extraction.
    For production, this would integrate with Textract or EasyOCR.
    """
    
    def __init__(self):
        self.supported_formats = ['.pdf', '.jpg', '.jpeg', '.png']
    
    def extract_text(self, file_path: str) -> tuple[str, int]:
        """
        Extract text from a document.
        Returns: (extracted_text, page_count)
        """
        file_ext = os.path.splitext(file_path)[1].lower()
        
        if file_ext == '.pdf':
            return self._extract_from_pdf(file_path)
        elif file_ext in ['.jpg', '.jpeg', '.png']:
            return self._extract_from_image(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_ext}")
    
    def _extract_from_pdf(self, file_path: str) -> tuple[str, int]:
        """Extract text from PDF using PyPDF2"""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                page_count = len(pdf_reader.pages)
                
                text_parts = []
                for page_num, page in enumerate(pdf_reader.pages):
                    text = page.extract_text()
                    if text.strip():
                        text_parts.append(f"--- Page {page_num + 1} ---\n{text}")
                
                extracted_text = "\n\n".join(text_parts)
                
                # If no text extracted, it might be a scanned PDF
                if not extracted_text.strip():
                    extracted_text = "[Scanned PDF - OCR processing would be applied here]"
                
                return extracted_text, page_count
        except Exception as e:
            raise Exception(f"Error extracting text from PDF: {str(e)}")
    
    def _extract_from_image(self, file_path: str) -> tuple[str, int]:
        """
        Extract text from image.
        For demo purposes, returns placeholder.
        In production, would use EasyOCR or Textract.
        """
        try:
            # Verify image can be opened
            with Image.open(file_path) as img:
                width, height = img.size
            
            # Placeholder for OCR
            extracted_text = f"[Image document - OCR would extract text here]\nImage size: {width}x{height}"
            return extracted_text, 1
        except Exception as e:
            raise Exception(f"Error processing image: {str(e)}")
    
    def classify_document(self, text: str) -> str:
        """
        Simple keyword-based document classification.
        In production, would use ML model or LLM.
        """
        text_lower = text.lower()
        
        # Medical document keywords
        if any(keyword in text_lower for keyword in ['diagnosis', 'patient', 'medical', 'doctor', 'hospital', 'treatment']):
            return 'medical_record'
        elif any(keyword in text_lower for keyword in ['lab', 'test result', 'blood', 'specimen', 'laboratory']):
            return 'lab_report'
        elif any(keyword in text_lower for keyword in ['x-ray', 'mri', 'ct scan', 'imaging', 'radiology']):
            return 'imaging_report'
        elif any(keyword in text_lower for keyword in ['prescription', 'medication', 'pharmacy', 'dosage']):
            return 'prescription'
        else:
            return 'general_document'
