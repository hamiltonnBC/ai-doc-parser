from app.config import settings
import logging

logger = logging.getLogger(__name__)

class SummaryService:
    """
    Service for generating AI-powered summaries using OpenAI.
    """
    
    def __init__(self):
        if settings.openai_api_key and settings.openai_api_key != "your_openai_api_key_here":
            try:
                from openai import OpenAI
                self.client = OpenAI(api_key=settings.openai_api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI client: {e}")
                self.client = None
        else:
            self.client = None
    
    def generate_document_summary(self, text: str, document_type: str = "general") -> str:
        """
        Generate a concise summary of a document.
        """
        if not self.client:
            return "[OpenAI API key not configured - summary generation disabled]"
        
        try:
            prompt = self._build_summary_prompt(text, document_type)
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",  # Using mini for cost efficiency
                messages=[
                    {"role": "system", "content": "You are a medical document summarization assistant. Provide clear, concise summaries that highlight key medical information."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )
            
            summary = response.choices[0].message.content
            return summary.strip()
            
        except Exception as e:
            logger.error(f"Error generating summary: {str(e)}")
            return f"[Error generating summary: {str(e)}]"
    
    def _build_summary_prompt(self, text: str, document_type: str) -> str:
        """Build the prompt for summarization based on document type."""
        
        base_prompt = f"Summarize the following {document_type.replace('_', ' ')} in 3-5 concise bullet points. Focus on:\n"
        
        if document_type == "medical_record":
            base_prompt += "- Patient information\n- Chief complaint\n- Diagnosis\n- Treatment plan\n- Follow-up instructions\n\n"
        elif document_type == "lab_report":
            base_prompt += "- Test type\n- Key results\n- Abnormal findings\n- Clinical significance\n\n"
        elif document_type == "imaging_report":
            base_prompt += "- Imaging modality\n- Findings\n- Impressions\n- Recommendations\n\n"
        else:
            base_prompt += "- Main purpose\n- Key findings\n- Important dates\n- Action items\n\n"
        
        base_prompt += f"Document text:\n{text[:3000]}"  # Limit to avoid token limits
        
        return base_prompt
    
    def generate_case_summary(self, documents_text: list[tuple[str, str]]) -> str:
        """
        Generate a comprehensive case summary from multiple documents.
        documents_text: list of (document_type, text) tuples
        """
        if not self.client:
            return "[OpenAI API key not configured - summary generation disabled]"
        
        try:
            # Combine document summaries
            combined_text = "\n\n".join([
                f"Document Type: {doc_type}\n{text[:1000]}" 
                for doc_type, text in documents_text
            ])
            
            prompt = f"""Create a comprehensive medical case summary from the following documents. 
            
Organize the summary with these sections:
1. Patient Overview
2. Medical History
3. Diagnoses
4. Treatments and Medications
5. Test Results
6. Timeline of Events

Documents:
{combined_text[:4000]}"""
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a medical case summarization expert. Create clear, organized summaries for legal and medical professionals."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Error generating case summary: {str(e)}")
            return f"[Error generating case summary: {str(e)}]"
