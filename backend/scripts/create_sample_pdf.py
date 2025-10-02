"""
Create a sample medical document PDF for testing
"""
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
import os

def create_sample_medical_record():
    """Create a sample medical record PDF"""
    os.makedirs("sample_data", exist_ok=True)
    filename = "sample_data/sample_medical_record.pdf"
    
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter
    
    # Header
    c.setFont("Helvetica-Bold", 16)
    c.drawString(1*inch, height - 1*inch, "MEDICAL RECORD")
    
    # Patient Info
    c.setFont("Helvetica-Bold", 12)
    c.drawString(1*inch, height - 1.5*inch, "Patient Information")
    
    c.setFont("Helvetica", 10)
    y = height - 1.8*inch
    c.drawString(1*inch, y, "Patient Name: John Doe")
    y -= 0.3*inch
    c.drawString(1*inch, y, "Date of Birth: 01/15/1980")
    y -= 0.3*inch
    c.drawString(1*inch, y, "Medical Record Number: MRN-123456")
    y -= 0.3*inch
    c.drawString(1*inch, y, "Date of Service: 10/01/2024")
    
    # Visit Details
    y -= 0.5*inch
    c.setFont("Helvetica-Bold", 12)
    c.drawString(1*inch, y, "Visit Details")
    
    y -= 0.3*inch
    c.setFont("Helvetica", 10)
    c.drawString(1*inch, y, "Provider: Dr. Sarah Johnson, MD")
    y -= 0.3*inch
    c.drawString(1*inch, y, "Specialty: Internal Medicine")
    y -= 0.3*inch
    c.drawString(1*inch, y, "Hospital: General Medical Center")
    
    # Chief Complaint
    y -= 0.5*inch
    c.setFont("Helvetica-Bold", 12)
    c.drawString(1*inch, y, "Chief Complaint")
    
    y -= 0.3*inch
    c.setFont("Helvetica", 10)
    c.drawString(1*inch, y, "Patient presents with persistent cough and fever for 5 days.")
    
    # Diagnosis
    y -= 0.5*inch
    c.setFont("Helvetica-Bold", 12)
    c.drawString(1*inch, y, "Diagnosis")
    
    y -= 0.3*inch
    c.setFont("Helvetica", 10)
    c.drawString(1*inch, y, "1. Acute Bronchitis (ICD-10: J20.9)")
    y -= 0.3*inch
    c.drawString(1*inch, y, "2. Fever, unspecified (ICD-10: R50.9)")
    
    # Treatment
    y -= 0.5*inch
    c.setFont("Helvetica-Bold", 12)
    c.drawString(1*inch, y, "Treatment Plan")
    
    y -= 0.3*inch
    c.setFont("Helvetica", 10)
    c.drawString(1*inch, y, "Medications:")
    y -= 0.25*inch
    c.drawString(1.3*inch, y, "- Amoxicillin 500mg, three times daily for 7 days")
    y -= 0.25*inch
    c.drawString(1.3*inch, y, "- Acetaminophen 500mg as needed for fever")
    y -= 0.25*inch
    c.drawString(1.3*inch, y, "- Cough suppressant as needed")
    
    y -= 0.4*inch
    c.drawString(1*inch, y, "Follow-up: Return in 7 days if symptoms persist")
    
    # Footer
    c.setFont("Helvetica", 8)
    c.drawString(1*inch, 0.5*inch, "This is a sample medical document for demonstration purposes only.")
    
    c.save()
    print(f"Created sample medical record: {filename}")

def create_sample_lab_report():
    """Create a sample lab report PDF"""
    os.makedirs("sample_data", exist_ok=True)
    filename = "sample_data/sample_lab_report.pdf"
    
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter
    
    # Header
    c.setFont("Helvetica-Bold", 16)
    c.drawString(1*inch, height - 1*inch, "LABORATORY REPORT")
    
    # Patient Info
    c.setFont("Helvetica-Bold", 12)
    c.drawString(1*inch, height - 1.5*inch, "Patient Information")
    
    c.setFont("Helvetica", 10)
    y = height - 1.8*inch
    c.drawString(1*inch, y, "Patient Name: John Doe")
    y -= 0.3*inch
    c.drawString(1*inch, y, "Date of Birth: 01/15/1980")
    y -= 0.3*inch
    c.drawString(1*inch, y, "Specimen Collection Date: 10/01/2024")
    y -= 0.3*inch
    c.drawString(1*inch, y, "Report Date: 10/02/2024")
    
    # Test Results
    y -= 0.5*inch
    c.setFont("Helvetica-Bold", 12)
    c.drawString(1*inch, y, "Complete Blood Count (CBC)")
    
    y -= 0.4*inch
    c.setFont("Helvetica", 10)
    
    # Table header
    c.drawString(1*inch, y, "Test")
    c.drawString(3.5*inch, y, "Result")
    c.drawString(5*inch, y, "Reference Range")
    
    y -= 0.05*inch
    c.line(1*inch, y, 7*inch, y)
    
    # Results
    y -= 0.3*inch
    c.drawString(1*inch, y, "White Blood Cell Count")
    c.drawString(3.5*inch, y, "7.2 K/uL")
    c.drawString(5*inch, y, "4.5-11.0 K/uL")
    
    y -= 0.3*inch
    c.drawString(1*inch, y, "Red Blood Cell Count")
    c.drawString(3.5*inch, y, "4.8 M/uL")
    c.drawString(5*inch, y, "4.5-5.5 M/uL")
    
    y -= 0.3*inch
    c.drawString(1*inch, y, "Hemoglobin")
    c.drawString(3.5*inch, y, "14.2 g/dL")
    c.drawString(5*inch, y, "13.5-17.5 g/dL")
    
    y -= 0.3*inch
    c.drawString(1*inch, y, "Platelet Count")
    c.drawString(3.5*inch, y, "250 K/uL")
    c.drawString(5*inch, y, "150-400 K/uL")
    
    # Interpretation
    y -= 0.5*inch
    c.setFont("Helvetica-Bold", 12)
    c.drawString(1*inch, y, "Interpretation")
    
    y -= 0.3*inch
    c.setFont("Helvetica", 10)
    c.drawString(1*inch, y, "All values within normal limits.")
    
    # Footer
    c.setFont("Helvetica", 8)
    c.drawString(1*inch, 0.5*inch, "This is a sample laboratory report for demonstration purposes only.")
    
    c.save()
    print(f"Created sample lab report: {filename}")

if __name__ == "__main__":
    create_sample_medical_record()
    create_sample_lab_report()
    print("\nSample PDFs created successfully!")
    print("You can find them in the sample_data/ directory")
