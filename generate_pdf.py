import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        print(f"Total pages generated: {num_pages}")
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        
        # Header banner line
        self.setStrokeColor(colors.HexColor("#0D9488")) # Teal accent
        self.setLineWidth(1.5)
        self.line(36, 756, 576, 756)
        
        # Header text
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#0F766E"))
        self.drawString(36, 762, "HEALTHCONNECT TELEHEALTH PLATFORM")
        
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawRightString(576, 762, "Project Solution & Benefits Overview")
        
        # Footer line
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.75)
        self.line(36, 40, 576, 40)
        
        # Footer text
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(36, 28, "Confidential • Prepared for Healthcare Telemedicine Operations")
        self.drawRightString(576, 28, f"Page {self._pageNumber} of {page_count}")
        
        self.restoreState()


def create_overview_pdf(filename="HealthConnect_Project_Overview.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=46,
        bottomMargin=50
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Palette
    primary = colors.HexColor("#0F766E")   # Deep Teal
    secondary = colors.HexColor("#0284C7") # Ocean Blue
    dark_text = colors.HexColor("#0F172A") # Slate Dark
    body_text = colors.HexColor("#334155") # Slate 700
    card_bg = colors.HexColor("#F8FAFC")   # Light Slate
    border_col = colors.HexColor("#E2E8F0")# Light Border
    accent_green = colors.HexColor("#059669")
    accent_red = colors.HexColor("#DC2626")
    
    # Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=primary,
        spaceAfter=2
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#475569"),
        spaceAfter=10
    )
    
    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=primary,
        spaceBefore=6,
        spaceAfter=4
    )
    
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=body_text
    )

    body_bold = ParagraphStyle(
        'BodyDarkBold',
        parent=body_style,
        fontName='Helvetica-Bold',
        textColor=dark_text
    )

    card_title = ParagraphStyle(
        'CardTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=dark_text
    )
    
    bullet_style = ParagraphStyle(
        'BulletStyle',
        parent=body_style,
        leftIndent=10,
        firstLineIndent=-10,
        spaceAfter=3
    )

    story = []
    
    # ==========================================
    # PAGE 1: TITLE, PROBLEM STATEMENT, SOLUTION
    # ==========================================
    story.append(Paragraph("HealthConnect: Smart Telehealth & Medicine Prescription System", title_style))
    story.append(Paragraph("Solving Telemedicine Gaps with Real-Time Video Prescribing, Auto-Schedules & Daily Reminders", subtitle_style))
    
    # Overview Banner Box
    banner_data = [[
        Paragraph(
            "<b>Executive Summary:</b> HealthConnect is a modern digital health platform that combines encrypted HD video consultations with an in-call medicine prescription builder and an automated daily reminder system. It ensures patients never miss their medicine doses while allowing doctors to issue digitally signed prescriptions in seconds.",
            body_style
        )
    ]]
    banner_table = Table(banner_data, colWidths=[540])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F0FDFA")), # Teal tint
        ('BORDER', (0,0), (-1,-1), 1, colors.HexColor("#99F6E4")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 8))
    
    # SECTION 1: PROBLEM STATEMENT
    story.append(Paragraph("1. The Problem Statement (What Was Wrong Before?)", h1_style))
    story.append(Paragraph(
        "Online doctor consultations have grown rapidly, but traditional telemedicine tools suffer from critical disconnects between the live video call, prescription writing, and actual patient recovery:",
        body_style
    ))
    story.append(Spacer(1, 4))
    
    prob_col1 = [
        Paragraph("<b>1. Disconnected Prescriptions:</b>", card_title),
        Paragraph("Doctors usually have to leave the video call or use separate paper notes to write prescriptions. This wastes time, leads to errors, and delays treatment.", body_style),
        Spacer(1, 4),
        Paragraph("<b>2. High Medication Non-Adherence:</b>", card_title),
        Paragraph("Over <b>50% of patients forget their dosage timings</b> or stop taking medications early once symptoms fade, causing health relapses and hospital readmissions.", body_style)
    ]
    
    prob_col2 = [
        Paragraph("<b>3. Zero Tracking for Doctors:</b>", card_title),
        Paragraph("Doctors had no visibility into whether patients took their medicines on time, skipped doses, or experienced side effects after the call ended.", body_style),
        Spacer(1, 4),
        Paragraph("<b>4. Technical Call & Chat Glitches:</b>", card_title),
        Paragraph("Common video consultation tools suffer from black video screens during connection, dropped candidates, and duplicate chat message bugs that confuse patients.", body_style)
    ]
    
    prob_table_data = [[prob_col1, prob_col2]]
    prob_table = Table(prob_table_data, colWidths=[265, 265])
    prob_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor("#FEF2F2")), # Light Red
        ('BACKGROUND', (1,0), (1,0), colors.HexColor("#FEF2F2")),
        ('BORDER', (0,0), (-1,-1), 1, colors.HexColor("#FECACA")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(prob_table)
    story.append(Spacer(1, 8))
    
    # SECTION 2: OUR SOLUTION
    story.append(Paragraph("2. Our Solution (What We Built to Solve These Problems)", h1_style))
    story.append(Paragraph(
        "We built an integrated end-to-end medical solution directly into the video consultation room and portal dashboards:",
        body_style
    ))
    story.append(Spacer(1, 4))
    
    sol_cards = [
        [
            Paragraph("<b>💊 In-Call Live Medicine Prescribing</b>", card_title),
            Paragraph("<b>📅 Automated Reminder Schedule Engine</b>", card_title)
        ],
        [
            Paragraph("Doctors prescribe medicines directly inside the video room without leaving the patient. Includes quick medicine autocomplete, dosage presets, multi-time chips (Morning, Afternoon, Night), duration counters, and continuous autosave.", body_style),
            Paragraph("When the call finishes, our background engine automatically calculates Start Date + Duration and creates daily scheduled dose entries in the database for every single time slot across all days.", body_style)
        ],
        [
            Paragraph("<b>✅ Interactive Patient Adherence Tracker</b>", card_title),
            Paragraph("<b>🔒 Ultra-Reliable HD Video & Single-Instance Chat</b>", card_title)
        ],
        [
            Paragraph("Patients see today's pending medicines on their dashboard with exact timings, food instructions, and day progress ('Day 1 of 5'). They can click <b>'Mark as Taken'</b> or <b>'Skip with Reason'</b> with 1 tap.", body_style),
            Paragraph("Fixed WebRTC ICE candidate dropping for instant video feeds with zero black screens, plus message deduplication so in-call chats and shared prescriptions never appear twice.", body_style)
        ]
    ]
    
    sol_table = Table(sol_cards, colWidths=[265, 265])
    sol_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor("#F0FDFA")),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor("#F0FDFA")),
        ('BACKGROUND', (0,2), (0,2), colors.HexColor("#F0FDFA")),
        ('BACKGROUND', (1,2), (1,2), colors.HexColor("#F0FDFA")),
        ('BACKGROUND', (0,1), (0,1), card_bg),
        ('BACKGROUND', (1,1), (1,1), card_bg),
        ('BACKGROUND', (0,3), (0,3), card_bg),
        ('BACKGROUND', (1,3), (1,3), card_bg),
        ('BORDER', (0,0), (0,1), 1, colors.HexColor("#CCFBF1")),
        ('BORDER', (1,0), (1,1), 1, colors.HexColor("#CCFBF1")),
        ('BORDER', (0,2), (0,3), 1, colors.HexColor("#CCFBF1")),
        ('BORDER', (1,2), (1,3), 1, colors.HexColor("#CCFBF1")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(sol_table)
    
    # ==========================================
    # PAGE BREAK TO PAGE 2
    # ==========================================
    story.append(PageBreak())
    
    # PAGE 2: HOW IT WORKS, BENEFITS & IMPACT
    story.append(Paragraph("3. How It Works (Step-by-Step Patient & Doctor Journey)", h1_style))
    
    steps_data = [
        [
            Paragraph("<b>Step 1</b>", body_bold),
            Paragraph("<b>Secure Video Consultation:</b> Doctor and patient join the encrypted video room with synchronized audio/video and in-call messaging.", body_style)
        ],
        [
            Paragraph("<b>Step 2</b>", body_bold),
            Paragraph("<b>Real-Time Medicine Drafting:</b> Doctor switches to 'Medicines' tab, types diagnosis, selects medications, picks daily time chips (e.g., 08:00 AM & 08:00 PM), and sets 5 days duration. Draft autosaves instantly.", body_style)
        ],
        [
            Paragraph("<b>Step 3</b>", body_bold),
            Paragraph("<b>Review & Finalize Rx:</b> Doctor clicks 'Finalize Prescription'. The prescription locks, and can be shared directly into the chat for live patient confirmation.", body_style)
        ],
        [
            Paragraph("<b>Step 4</b>", body_bold),
            Paragraph("<b>Automatic Schedule Generation:</b> When consultation ends, our backend automatically generates individual daily dose records in the database for all 5 days.", body_style)
        ],
        [
            Paragraph("<b>Step 5</b>", body_bold),
            Paragraph("<b>Daily Reminders & Compliance:</b> Patient logs into dashboard, sees today's doses, marks 'Taken' (logs timestamp) or 'Skipped' (records reason), and prints official Rx.", body_style)
        ]
    ]
    
    steps_table = Table(steps_data, colWidths=[55, 485])
    steps_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), card_bg),
        ('GRID', (0,0), (-1,-1), 0.5, border_col),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TEXTCOLOR', (0,0), (0,-1), primary),
    ]))
    story.append(steps_table)
    story.append(Spacer(1, 8))
    
    # SECTION 4: WHY IT IS BENEFICIAL
    story.append(Paragraph("4. Why It Is Beneficial (Impact & Real-World Value)", h1_style))
    
    ben_p1 = [
        Paragraph("<b>👤 Benefits for Patients</b>", card_title),
        Paragraph("• <b>Never Miss a Dose:</b> Clear daily schedule shows exactly what pill to take at what time.", bullet_style),
        Paragraph("• <b>Zero Confusion:</b> Includes clear meal instructions (e.g., 'Take after food with warm water').", bullet_style),
        Paragraph("• <b>100% Digital & Paperless:</b> Access official printable prescriptions anytime from any device.", bullet_style),
        Paragraph("• <b>Better Health Outcomes:</b> High medication adherence ensures fast and complete recovery.", bullet_style),
    ]
    
    ben_p2 = [
        Paragraph("<b>👨‍⚕️ Benefits for Doctors</b>", card_title),
        Paragraph("• <b>Speed & Efficiency:</b> Create complete prescriptions in under 30 seconds inside video call.", bullet_style),
        Paragraph("• <b>Safety Safeguards:</b> Unfinished draft modal alerts doctor before closing call accidentally.", bullet_style),
        Paragraph("• <b>Patient Adherence History:</b> View full logs of taken and skipped doses during follow-ups.", bullet_style),
        Paragraph("• <b>Standardized Digital Records:</b> Auto-formatted with MCI registration license & hospital headers.", bullet_style),
    ]
    
    ben_table_data = [[ben_p1, ben_p2]]
    ben_table = Table(ben_table_data, colWidths=[265, 265])
    ben_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor("#F0FDF4")), # Emerald tint
        ('BACKGROUND', (1,0), (1,0), colors.HexColor("#EFF6FF")), # Blue tint
        ('BORDER', (0,0), (0,0), 1, colors.HexColor("#BBF7D0")),
        ('BORDER', (1,0), (1,0), 1, colors.HexColor("#BFDBFE")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(ben_table)
    story.append(Spacer(1, 8))
    
    # SECTION 5: PLATFORM IMPACT & CONCLUSION
    story.append(Paragraph("5. Platform Impact & Key Takeaways", h1_style))
    
    impact_data = [
        [
            Paragraph("<b>Metric / Area</b>", body_bold),
            Paragraph("<b>Before HealthConnect</b>", body_bold),
            Paragraph("<b>With HealthConnect System</b>", body_bold)
        ],
        [
            Paragraph("Prescription Process", body_style),
            Paragraph("Manual, slow, outside video call", body_style),
            Paragraph("<b>Instant in-call digital Rx with autosave</b>", body_style)
        ],
        [
            Paragraph("Medication Adherence", body_style),
            Paragraph("~50% patients forget or drop doses", body_style),
            Paragraph("<b>Automated daily schedule & compliance tracking</b>", body_style)
        ],
        [
            Paragraph("Telehealth Reliability", body_style),
            Paragraph("Video black screens & duplicate chat", body_style),
            Paragraph("<b>Seamless WebRTC STUN/ICE & deduped chat</b>", body_style)
        ]
    ]
    
    impact_table = Table(impact_data, colWidths=[120, 195, 225])
    impact_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
        ('GRID', (0,0), (-1,-1), 0.5, border_col),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(impact_table)
    story.append(Spacer(1, 6))
    
    # Final Callout Box
    summary_box_data = [[
        Paragraph(
            "<b>Conclusion:</b> By eliminating the barrier between remote medical consultation and medication compliance, HealthConnect delivers a connected, paperless, and life-saving telemedicine experience for both patients and healthcare providers.",
            body_style
        )
    ]]
    summary_box = Table(summary_box_data, colWidths=[540])
    summary_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BORDER', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(summary_box)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF generated successfully at: {os.path.abspath(filename)}")

if __name__ == "__main__":
    create_overview_pdf("HealthConnect_Problem_Solution_Benefits.pdf")
