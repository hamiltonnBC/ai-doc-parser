import os
from typing import Optional
from PIL import Image
import PyPDF2
from pdf2image import convert_from_path
import io
import logging

logger = logging.getLogger(__name__)

# Import EasyOCR with fallback
try:
    import easyocr
    EASYOCR_AVAILABLE = True
except ImportError:
    EASYOCR_AVAILABLE = False
    logger.warning("EasyOCR not available. Install with: pip install easyocr")

class OCRService:
    """
    OCR service for extracting text from documents.
    Uses PyPDF2 for digital PDFs and EasyOCR for images and scanned documents.
    Supports handwriting recognition through EasyOCR.
    """
    
    def __init__(self):
        self.supported_formats = ['.pdf', '.jpg', '.jpeg', '.png']
        self.easyocr_reader = None
        
        # Initialize EasyOCR reader if available
        if EASYOCR_AVAILABLE:
            try:
                self.easyocr_reader = easyocr.Reader(['en'], gpu=False)
                logger.info("EasyOCR initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize EasyOCR: {e}")
                self.easyocr_reader = None
    
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
                
                # If no text extracted, it might be a scanned PDF - try OCR
                if not extracted_text.strip():
                    logger.info("No text found in PDF, attempting OCR on scanned pages")
                    extracted_text = self._ocr_scanned_pdf(file_path, page_count)
                
                return extracted_text, page_count
        except Exception as e:
            raise Exception(f"Error extracting text from PDF: {str(e)}")
    
    def _extract_from_image(self, file_path: str) -> tuple[str, int]:
        """
        Extract text from image using EasyOCR.
        Supports handwriting recognition.
        """
        try:
            # Verify image can be opened
            with Image.open(file_path) as img:
                width, height = img.size
            
            if self.easyocr_reader:
                # Use EasyOCR for text extraction
                results = self.easyocr_reader.readtext(file_path)
                
                if results:
                    # Extract text with confidence scores
                    text_parts = []
                    for (bbox, text, confidence) in results:
                        if confidence > 0.3:  # Filter low-confidence results
                            text_parts.append(text)
                    
                    extracted_text = " ".join(text_parts)
                    
                    if extracted_text.strip():
                        logger.info(f"EasyOCR extracted {len(text_parts)} text segments")
                        return extracted_text, 1
                    else:
                        return "[No readable text found in image]", 1
                else:
                    return "[No text detected in image]", 1
            else:
                # Fallback when EasyOCR not available
                extracted_text = f"[EasyOCR not available - Image size: {width}x{height}]"
                return extracted_text, 1
                
        except Exception as e:
            logger.error(f"Error processing image with OCR: {str(e)}")
            raise Exception(f"Error processing image: {str(e)}")
    
    def _ocr_scanned_pdf(self, file_path: str, page_count: int) -> str:
        """
        Extract text from scanned PDF using EasyOCR.
        Converts PDF pages to images and processes with OCR.
        """
        if not self.easyocr_reader:
            return "[Scanned PDF - EasyOCR not available for text extraction]"
        
        try:
            # Convert PDF pages to images
            images = convert_from_path(file_path, dpi=200)
            text_parts = []
            
            for page_num, image in enumerate(images):
                logger.info(f"Processing scanned page {page_num + 1}/{len(images)}")
                
                # Save image temporarily for EasyOCR
                temp_image_path = f"/tmp/temp_page_{page_num}.jpg"
                image.save(temp_image_path, 'JPEG')
                
                try:
                    # Extract text from image
                    results = self.easyocr_reader.readtext(temp_image_path)
                    
                    page_text = []
                    for (bbox, text, confidence) in results:
                        if confidence > 0.3:  # Filter low-confidence results
                            page_text.append(text)
                    
                    if page_text:
                        text_parts.append(f"--- Page {page_num + 1} ---\n" + " ".join(page_text))
                    
                finally:
                    # Clean up temporary file
                    if os.path.exists(temp_image_path):
                        os.remove(temp_image_path)
            
            if text_parts:
                extracted_text = "\n\n".join(text_parts)
                logger.info(f"Successfully extracted text from {len(text_parts)} scanned pages")
                return extracted_text
            else:
                return "[No readable text found in scanned PDF]"
                
        except Exception as e:
            logger.error(f"Error processing scanned PDF: {str(e)}")
            return f"[Error processing scanned PDF: {str(e)}]"
    
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
