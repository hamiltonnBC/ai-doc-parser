from app.config import settings
import json
import logging

logger = logging.getLogger(__name__)

class ExtractionService:
    """
    Service for extracting structured entities from medical documents.
    Uses OpenAI for structured extraction (similar to LangExtract approach).
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
    
    def extract_entities(self, text: str, document_type: str = "medical_record") -> list[dict]:
        """
        Extract structured entities from document text.
        Returns list of entities with type, value, and confidence.
        """
        if not self.client:
            return []
        
        try:
            schema = self._get_extraction_schema(document_type)
            prompt = self._build_extraction_prompt(text, schema)
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a medical information extraction assistant. Extract structured data accurately from medical documents."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            entities = self._format_entities(result)
            
            return entities
            
        except Exception as e:
            logger.error(f"Error extracting entities: {str(e)}")
            return []
    
    def _get_extraction_schema(self, document_type: str) -> dict:
        """Define extraction schema based on document type."""
        
        base_schema = {
            "provider": "Healthcare provider name and specialty",
            "date_of_service": "Date of medical service",
            "patient_name": "Patient name (if present)",
        }
        
        if document_type == "medical_record":
            base_schema.update({
                "diagnosis": "Medical diagnoses with ICD codes if present",
                "procedure": "Medical procedures performed",
                "medication": "Medications prescribed with dosage",
                "chief_complaint": "Patient's main complaint or reason for visit"
            })
        elif document_type == "lab_report":
            base_schema.update({
                "test_type": "Type of laboratory test",
                "test_results": "Key test results with values",
                "abnormal_findings": "Any abnormal or out-of-range results"
            })
        elif document_type == "imaging_report":
            base_schema.update({
                "imaging_type": "Type of imaging (X-ray, MRI, CT, etc.)",
                "findings": "Key imaging findings",
                "impression": "Radiologist's impression"
            })
        
        return base_schema
    
    def _build_extraction_prompt(self, text: str, schema: dict) -> str:
        """Build extraction prompt with schema."""
        
        schema_desc = "\n".join([f"- {key}: {desc}" for key, desc in schema.items()])
        
        prompt = f"""Extract the following information from the medical document. 
Return a JSON object with the extracted entities. For each entity type, provide a list of findings.
If an entity is not found, use an empty list.

Schema:
{schema_desc}

Format your response as JSON:
{{
  "entity_type": [
    {{"value": "extracted value", "confidence": 0.95, "context": "surrounding text"}}
  ]
}}

Document text:
{text[:3000]}

Return only valid JSON."""
        
        return prompt
    
    def _format_entities(self, raw_result: dict) -> list[dict]:
        """Format extracted entities into standard structure."""
        
        entities = []
        
        for entity_type, findings in raw_result.items():
            if not isinstance(findings, list):
                findings = [findings]
            
            for finding in findings:
                if isinstance(finding, dict):
                    entities.append({
                        "entity_type": entity_type,
                        "entity_value": finding.get("value", str(finding)),
                        "confidence": finding.get("confidence", 0.8),
                        "source_location": {"context": finding.get("context", "")}
                    })
                elif finding:  # Simple string value
                    entities.append({
                        "entity_type": entity_type,
                        "entity_value": str(finding),
                        "confidence": 0.8,
                        "source_location": {}
                    })
        
        return entities
