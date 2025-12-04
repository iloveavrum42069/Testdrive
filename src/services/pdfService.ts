import { jsPDF } from 'jspdf';
import { RegistrationData } from '../App';
import { PageSettings } from '../components/PageEditor';

export class PdfService {

    async generateWaiverPdf(registration: RegistrationData, settings: PageSettings): Promise<Blob> {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pageWidth - (margin * 2);
        let y = margin;

        // Tighter line height multiplier
        const lineHeight = 0.35;

        // Helper: Add text compactly
        const addText = (text: string, size: number = 9, bold: boolean = false) => {
            doc.setFontSize(size);
            doc.setFont('helvetica', bold ? 'bold' : 'normal');
            const lines = doc.splitTextToSize(text || '', contentWidth);
            doc.text(lines, margin, y);
            y += (lines.length * size * lineHeight) + 2;
        };

        // Helper: Add inline label:value
        const addField = (label: string, value: string, size: number = 9) => {
            doc.setFontSize(size);
            doc.setFont('helvetica', 'bold');
            doc.text(label, margin, y);
            const labelWidth = doc.getTextWidth(label);
            doc.setFont('helvetica', 'normal');
            doc.text(value || 'N/A', margin + labelWidth + 2, y);
            y += size * lineHeight + 3;
        };

        // Helper: Thin separator line
        const addLine = () => {
            doc.setDrawColor(180);
            doc.setLineWidth(0.3);
            doc.line(margin, y, pageWidth - margin, y);
            y += 3;
        };

        // ========== HEADER ==========
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(settings.heroTitle || 'Test Drive Registration', margin, y);
        y += 5;
        doc.setFontSize(10);
        doc.text('Liability Waiver', margin, y);
        y += 4;
        addLine();

        // ========== REGISTRATION INFO (compact grid) ==========
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('ID:', margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(registration.registrationId || 'N/A', margin + 8, y);

        doc.setFont('helvetica', 'bold');
        doc.text('Date:', margin + 50, y);
        doc.setFont('helvetica', 'normal');
        doc.text(registration.date || 'N/A', margin + 62, y);

        doc.setFont('helvetica', 'bold');
        doc.text('Time:', margin + 100, y);
        doc.setFont('helvetica', 'normal');
        doc.text(registration.timeSlot || 'N/A', margin + 112, y);
        y += 5;

        doc.setFont('helvetica', 'bold');
        doc.text('Vehicle:', margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${registration.car?.year || ''} ${registration.car?.name || ''} ${registration.car?.model || ''}`, margin + 18, y);
        y += 6;
        addLine();

        // ========== DRIVER INFO ==========
        addText('Driver Information', 10, true);
        addField('Name:', `${registration.firstName} ${registration.lastName}`, 9);
        addField('Email:', registration.email || '', 9);
        addField('Phone:', registration.phone || '', 9);
        y += 2;
        addLine();

        // ========== WAIVER TEXT ==========
        addText('Waiver Agreement', 10, true);
        addText(settings.waiverText || 'No waiver text.', 8);
        y += 3;

        // ========== DRIVER SIGNATURE ==========
        // Check if we need a new page before signature section
        if (y > pageHeight - 45) {
            doc.addPage();
            y = margin;
        }

        addText('Driver Signature:', 9, true);
        y += 2; // Add spacing before signature image
        if (registration.signature) {
            try {
                doc.addImage(registration.signature, 'PNG', margin, y, 45, 18);
                y += 22;
            } catch (e) {
                addText('[Signature error]', 8);
            }
        } else {
            addText('[No signature]', 8);
        }
        doc.setFontSize(7);
        doc.text(`${registration.firstName} ${registration.lastName} - ${new Date().toLocaleDateString()}`, margin, y);
        y += 6;
        addLine();

        // ========== PASSENGERS ==========
        if (registration.additionalPassengers && registration.additionalPassengers.length > 0) {
            y += 2;
            addText('Additional Passengers', 10, true);

            for (let i = 0; i < registration.additionalPassengers.length; i++) {
                const p = registration.additionalPassengers[i];

                // Check if we need a new page (need space for name + signature)
                if (y > pageHeight - 55) {
                    doc.addPage();
                    y = margin;
                }

                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.text(`${i + 1}. ${p.name}`, margin, y);
                doc.setFont('helvetica', 'normal');
                doc.text(p.isOver18 ? '(Adult)' : '(Minor)', margin + doc.getTextWidth(`${i + 1}. ${p.name}`) + 3, y);
                y += 5;

                if (!p.isOver18) {
                    doc.setFontSize(8);
                    doc.text(`Guardian: ${p.guardianName || 'N/A'} (${p.guardianRelationship || 'N/A'})`, margin + 5, y);
                    y += 5;
                }

                // Passenger signature (small) - add spacing before
                y += 2;
                if (p.signature) {
                    try {
                        doc.addImage(p.signature, 'PNG', margin + 5, y, 35, 14);
                        y += 18;
                    } catch (e) {
                        y += 4;
                    }
                }
                y += 3;
            }

            // ========== PARENTAL CONSENT ==========
            const minors = registration.additionalPassengers.filter(p => !p.isOver18);
            if (minors.length > 0) {
                if (y > pageHeight - 60) {
                    doc.addPage();
                    y = margin;
                }

                y += 3;
                addLine();
                addText('Parental/Guardian Consent', 10, true);
                addText(settings.parentalConsentText || 'I consent to my minor child participating.', 8);
                y += 3;

                for (const minor of minors) {
                    if (y > pageHeight - 45) {
                        doc.addPage();
                        y = margin;
                    }

                    doc.setFontSize(8);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`${minor.name}`, margin, y);
                    doc.setFont('helvetica', 'normal');
                    doc.text(`- Guardian: ${minor.guardianName || 'N/A'}`, margin + doc.getTextWidth(minor.name) + 3, y);
                    y += 5;

                    // Add spacing before signature image
                    y += 2;
                    if (minor.parentalConsentSignature) {
                        try {
                            doc.addImage(minor.parentalConsentSignature, 'PNG', margin, y, 35, 14);
                            y += 18;
                        } catch (e) {
                            doc.text('[Sig error]', margin, y);
                            y += 5;
                        }
                    } else {
                        doc.text('[No consent signature]', margin, y);
                        y += 5;
                    }
                    y += 3;
                }
            }
        }

        // ========== FOOTER ==========
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(7);
            doc.setTextColor(120);
            doc.text(`Page ${i}/${totalPages}`, margin, pageHeight - 8);
            doc.text(settings.footerText || '', pageWidth - margin, pageHeight - 8, { align: 'right' });
            doc.setTextColor(0);
        }

        return doc.output('blob');
    }
}

export const pdfService = new PdfService();
