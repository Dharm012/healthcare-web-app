import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
)

def create_essay_pdf(filename="HealthConnect_Essay.pdf"):
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
        fontSize=16,
        leading=18,
        spaceAfter=10,
        textColor=colors.black,
        alignment=1 # Center
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=11,
        leading=14,
        spaceAfter=10,
        textColor=colors.darkgrey,
        alignment=1 # Center
    )
    
    intro_style = ParagraphStyle(
        'IntroStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10.5,
        leading=14,
        spaceAfter=10,
        textColor=colors.black
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
    
    subhead_style = ParagraphStyle(
        'Subhead',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=14,
        spaceBefore=10,
        spaceAfter=5,
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
        spaceAfter=8 
    )

    story = []
    
    # PAGE 1
    story.append(Paragraph("HealthConnect: Smart Telehealth Solution Essay", title_style))
    story.append(Paragraph("Introducing live doctor visits, digital prescriptions, and medicine reminders in one convenient solution", subtitle_style))
    story.append(Paragraph("HealthConnect makes online healthcare services more convenient to use for both sides by combining video consultations, prescription tools, and reminders in one application that helps patients adhere to their treatment while saving doctors' time and reducing administrative work.", intro_style))
    
    story.append(Paragraph("Topic 1: Telehealth Challenges And Our 4-Step Solution", h1_style))
    story.append(Paragraph("Regular medical appointments are often limited by technological and interpersonal barriers that disrupt the flow of communication between patients and doctors. HealthConnect addresses these barriers directly by introducing a 4-step algorithm that makes telehealth consultations as productive as regular ones:", intro_style))
    
    story.append(Paragraph("Challenges We Address", subhead_style))
    
    bullet_char = "➢ "
    
    challenges = [
        "<b>Interrupted Communication During Consultation:</b> Doctor needs to constantly switch between the video call and paper/paper-based notes to write down instructions or prescriptions.",
        "<b>Technical Difficulties During A Call:</b> Zoom or Skype video chats often freeze, disconnect, or repeat the same messenger chat text line when trying to send a message.",
        "<b>Missed Dosage Deadlines:</b> Patients find it hard to remind themselves of the exact time they need to take a dose, forget to take pills, or decide to stop the treatment prematurely.",
        "<b>Lack Of Regular Control:</b> Doctors have no easy way of knowing if the patient followed the prescribed treatment regimen correctly at home."
    ]
    
    for pt in challenges:
        story.append(Paragraph(bullet_char + pt, bullet_style))
        
    story.append(Paragraph("Our 4-Step Solution", subhead_style))
    
    solutions = [
        "<b>Step 1 – Secure Video Chat:</b> The doctor and the patient open the application and launch a video consultation.",
        "<b>Step 2 – Integrated Prescription Writing:</b> Doctor writes down the necessary prescriptions in a separate tab that opens directly in the video chat interface while consulting the patient.",
        "<b>Step 3 – Automatic Schedule Set-Up:</b> When the consultation is over, the written prescriptions are automatically converted into a daily schedule with dosage reminders.",
        "<b>Step 4 – Daily Pill Reminder:</b> The patient gets daily alerts about the medicine schedule and can mark each dose as taken or missed with one click per day. Reminder Interface Example"
    ]
    
    for pt in solutions:
        story.append(Paragraph(bullet_char + pt, bullet_style))
        
    # PAGE BREAK
    story.append(PageBreak())
    
    # PAGE 2
    story.append(Paragraph("Topic 2: Benefits Summary + Impact On The System", h1_style))
    story.append(Paragraph("HealthConnect benefits both patients and doctors by providing an integrated view of treatment schedules and prescriptions while reducing administrative work for medical professionals:", intro_style))
    
    story.append(Paragraph("Benefits For Patients", subhead_style))
    benefits_patients = [
        "<b>Ability To See The Exact Schedule:</b> Being able to see the daily schedule and specific instructions for taking medication.",
        "<b>Elimination Of Ambiguity:</b> Having daily reminders makes it easier for patients to follow the treatment until it is completed.",
        "<b>Connected Ecosystem:</b> The ability to consult doctors via video calls and set up medication schedules in one application reduces confusion for both sides.",
        "<b>Better Health Outcomes:</b> Patients heal faster when they have a reliable way of following healthcare providers' recommendations while being able to track their progress with medication schedules."
    ]
    for pt in benefits_patients:
        story.append(Paragraph(bullet_char + pt, bullet_style))
        
    story.append(Paragraph("Benefits For Doctors", subhead_style))
    benefits_doctors = [
        "<b>Less Paperwork:</b> Doctors can write electronic prescriptions directly in the app during a video call.",
        "<b>Faster Consultations:</b> Writing prescriptions directly in the app is much faster than printing, signing, and scanning them or writing them by hand.",
        "<b>Transparent Dose Tracking:</b> Doctors can easily tell which doses were taken and which were missed during the follow-up consultations based on the electronic records.",
        "<b>Connected Record Keeping:</b> Having access to the patient's medical history and electronic records reduces the possibility of errors during a consultation.",
        "<b>Regular Treatment Insights:</b> Being able to see a patient's treatment progress on a daily basis helps the doctor determine the most effective course of action."
    ]
    for pt in benefits_doctors:
        story.append(Paragraph(bullet_char + pt, bullet_style))
        
    story.append(Paragraph("Impact On The System", subhead_style))
    impact_system = [
        "<b>Reduced Administrative Burden:</b> Electronic notes, prescriptions, and reminder tracking reduce overall paperwork in clinics and at home.",
        "<b>Paperless Healthcare System:</b> The entire appointment, prescription writing, and medication tracking can be done digitally without the need for any paperwork."
    ]
    for pt in impact_system:
        story.append(Paragraph(bullet_char + pt, bullet_style))
        
    story.append(Spacer(1, 20))
    story.append(Paragraph("<font color='gray'>HealthConnect Overview | Page 2 of 2</font>", ParagraphStyle('Footer2', parent=body_style, alignment=1)))
    
    doc.build(story)
    print(f"PDF generated successfully at: {os.path.abspath(filename)}")

if __name__ == "__main__":
    create_essay_pdf()
