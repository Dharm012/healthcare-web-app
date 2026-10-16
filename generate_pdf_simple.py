import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak
)

def create_simple_pdf(filename="HealthConnect_Simple_Overview.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=72,
        rightMargin=72,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        spaceAfter=15,
        textColor=colors.black,
        alignment=1 # Center
    )
    
    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=16,
        spaceBefore=10,
        spaceAfter=10,
        textColor=colors.black
    )
    
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10.5,
        leading=14,
        spaceAfter=5,
        textColor=colors.black
    )
    
    bullet_style = ParagraphStyle(
        'BulletStyle',
        parent=body_style,
        leftIndent=20,
        firstLineIndent=-20,
        spaceAfter=10 
    )

    story = []
    
    # PAGE 1
    story.append(Paragraph("HealthConnect System Concept", title_style))
    story.append(Spacer(1, 10))
    
    bullet_char = "➢ "
    
    concept_points = [
        "A smart platform connecting video calls with medicine prescriptions. The system is built to bridge the gap between virtual consultations and medical treatment by allowing doctors to write and finalize a complete digital prescription without ever leaving the live video screen. This seamless integration means the doctor can maintain eye contact and conversation with the patient while preparing their treatment plan, providing a much more personal and effective care experience.",
        "Designed to solve the problem of patients forgetting their daily medicine. Medication non-adherence is a major issue in healthcare, often leading to relapses and hospital readmissions. By linking the doctor's prescription directly to the patient's digital dashboard, our system ensures patients are reminded exactly when to take their pills, what dosage is required, and any specific meal instructions they need to follow.",
        "Integrates prescription writing directly into the doctor's workflow. Instead of forcing healthcare professionals to use separate applications, complex medical software, or physical paper pads, doctors can quickly select medicine names, timings, and durations right next to the patient's video feed. The system also features a continuous autosave function, ensuring that no draft data is lost if the connection drops."
    ]
    
    for pt in concept_points:
        story.append(Paragraph(bullet_char + pt, bullet_style))
        
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("Objectives", h1_style))
    
    objective_points = [
        "To reduce the number of patients missing their medicine doses and thus improve recovery rates. A clear, automatically generated daily schedule helps patients stay on track with their treatment plan, reducing confusion and increasing the likelihood of a full and speedy recovery without complications.",
        "To reduce the time doctors spend writing prescriptions outside of video calls. The in-call prescribing tool features quick medicine selections, intuitive time chips (such as Morning, Afternoon, and Night), and immediate digital signing. This drastically cuts down the administrative burden on doctors, allowing them to see more patients efficiently.",
        "To fix video call errors and stop chat messages from appearing twice. We completely overhauled the underlying connection technology to ensure that video feeds load instantly without frustrating black screens. We also implemented message deduplication to ensure the chat remains clean, reliable, and perfectly synchronized for both users.",
        "To automatically create a daily reminder schedule for patients. Once the doctor finishes the call, the backend system automatically calculates the exact dates and times for every single dose across the entire duration of the treatment, completely removing the need for the patient to manually calculate when to take their next pill."
    ]
    
    for pt in objective_points:
        story.append(Paragraph(bullet_char + pt, bullet_style))
        
    # PAGE BREAK
    story.append(PageBreak())
    
    # PAGE 2
    story.append(Paragraph("How it Works", h1_style))
    
    how_points = [
        "The doctor and patient join a secure video call. Both individuals enter an encrypted, high-definition video room where they can see and hear each other clearly. They also have access to a real-time live chat box for sharing additional information, symptoms, or clarifying questions during the consultation.",
        "The doctor types the medicine details into a panel during the call. Using a specialized sidebar, the doctor specifies the diagnosis and selects medications. They can precisely assign whether each medicine should be taken in the morning, afternoon, or night, and specify exactly how many days the treatment should last.",
        "The system automatically saves the draft and shares the final prescription. Before the call ends, the doctor reviews the drafted list and clicks to finalize the prescription. This action instantly locks the document and shares an official, digitally verifiable copy directly into the chat for the patient to review and download immediately.",
        "After the call, the system builds a day-by-day reminder schedule. Our automated backend engine processes the finalized prescription and generates individual database records for every single dose the patient needs to take, mapping them to specific days and times for the entire duration of the prescribed treatment.",
        "The patient logs in daily to mark medicines as taken or skipped. The patient's interactive dashboard clearly displays today's pending medicines. With a single click, they can confirm they took the medication, or provide a recorded reason if they had to skip it, which is saved for the doctor to review later."
    ]
    
    for pt in how_points:
        story.append(Paragraph(bullet_char + pt, bullet_style))
        
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("Key Benefits", h1_style))
    
    benefit_points = [
        "Patients never miss a dose because they get clear daily reminders. The personalized dashboard removes all guesswork and confusion about what pill to take and at what time of the day, acting as a virtual nurse that guides them through their entire recovery journey.",
        "Doctors can write prescriptions in seconds without switching screens. This streamlined approach makes the consultation much more efficient, greatly reduces the chance of making medical errors, and allows the doctor to focus entirely on the patient's well-being rather than navigating clunky software.",
        "Both patients and doctors get a smooth, reliable video call experience. By resolving WebRTC synchronization issues and optimizing the connection pipeline, our recent system upgrades ensure that the video connection remains highly stable, even on weaker networks, and the chat system is completely error-free.",
        "High medicine adherence leads to faster and better health recovery. When patients are provided with simple, accessible tools that encourage them to take their medicines exactly as prescribed, they experience better health outcomes, recover faster, and avoid the complications that lead to returning to the hospital."
    ]
    
    for pt in benefit_points:
        story.append(Paragraph(bullet_char + pt, bullet_style))
        
    doc.build(story)
    print(f"PDF generated successfully at: {os.path.abspath(filename)}")

if __name__ == "__main__":
    create_simple_pdf()
