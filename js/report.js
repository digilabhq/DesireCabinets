// PDF Report Generator - California Closets Inspired Style

class ReportGenerator {
    constructor(calculator) {
        this.calculator = calculator;
    }

    async generate() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const estimate = this.calculator.getEstimate();
        const calculations = estimate.calculations;

        // Colors - softer, more elegant
        const gold = [184, 134, 11];
        const darkGray = [60, 60, 60];
        const lightGray = [140, 140, 140];
        
        let y = 20;

        // Header with logo
        try {
            const logoImg = document.getElementById('logo-img');
            if (logoImg && logoImg.complete) {
                doc.addImage(logoImg, 'JPEG', 15, y, 50, 12);
            }
        } catch (e) {
            console.log('Logo not added to PDF');
        }

        // "QUOTE" title on right - lighter, more elegant
        doc.setFontSize(28);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(...lightGray);
        doc.text('QUOTE', 195, y + 8, { align: 'right' });

        y += 25;

        // Quote # and Date - clean boxes
        doc.setFillColor(250, 250, 250);
        doc.rect(140, y, 55, 18, 'F');
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...darkGray);
        doc.text('QUOTE #', 143, y + 6);
        doc.text('DATE', 143, y + 13);
        
        doc.setFont(undefined, 'normal');
        doc.setTextColor(...lightGray);
        doc.text(estimate.quoteNumber, 175, y + 6, { align: 'right' });
        doc.text(new Date(estimate.date).toLocaleDateString(), 175, y + 13, { align: 'right' });

        y += 28;

        // Bill To section
        doc.setFont(undefined, 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...darkGray);
        doc.text('BILL TO:', 15, y);
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...darkGray);
        y += 6;
        if (estimate.client.name) {
            doc.text(estimate.client.name, 15, y);
            y += 5;
        }
        if (estimate.client.address) {
            doc.text(estimate.client.address, 15, y);
            y += 5;
        }
        if (estimate.client.phone) {
            doc.text(estimate.client.phone, 15, y);
            y += 5;
        }

        y += 10;

        // Table Header - minimal, elegant
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...lightGray);
        doc.text('ITEM DESCRIPTION', 15, y);
        doc.text('QTY', 130, y, { align: 'right' });
        doc.text('UNIT PRICE', 160, y, { align: 'right' });
        doc.text('AMOUNT', 195, y, { align: 'right' });
        
        y += 2;
        doc.setDrawColor(...lightGray);
        doc.setLineWidth(0.3);
        doc.line(15, y, 195, y);
        
        y += 8;

        // Loop through each room
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...darkGray);
        
        estimate.rooms.forEach((room, index) => {
            const roomCalc = calculations.rooms[index];
            const description = this.calculator.generateRoomDescription(room);
            
            // Room title
            doc.setFont(undefined, 'bold');
            doc.text(description.title, 15, y);
            
            // Details as bullet points
            doc.setFont(undefined, 'normal');
            doc.setFontSize(9);
            doc.setTextColor(...lightGray);
            
            y += 5;
            description.details.forEach(detail => {
                if (y > 260) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(`- ${detail}`, 15, y);
                y += 4;
            });
            
            // Price columns for this room
            y -= 4 + (description.details.length * 4) - 5;
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(...darkGray);
            doc.text('1', 130, y, { align: 'right' });
            doc.text(`$${roomCalc.total.toFixed(2)}`, 160, y, { align: 'right' });
            doc.setFont(undefined, 'bold');
            doc.text(`$${roomCalc.total.toFixed(2)}`, 195, y, { align: 'right' });
            
            y += 4 + (description.details.length * 4) + 8;
        });

        // Check if we need new page for totals
        if (y > 240) {
            doc.addPage();
            y = 20;
        }

        y += 5;

        // Totals section - elegant and clean
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...darkGray);
        
        doc.text('SUBTOTAL', 130, y);
        doc.text(`$${calculations.subtotal.toFixed(2)}`, 195, y, { align: 'right' });
        y += 6;

        // Discount if applicable
        if (calculations.discount > 0) {
            const discountLabel = estimate.discountType === 'percent' 
                ? `DISCOUNT (${estimate.discountValue}%)`
                : 'DISCOUNT';
            doc.setTextColor(...gold);
            doc.text(discountLabel, 130, y);
            doc.text(`-$${calculations.discount.toFixed(2)}`, 195, y, { align: 'right' });
            doc.setTextColor(...darkGray);
            y += 6;
        }

        // Tax if applicable
        if (estimate.taxRate > 0) {
            doc.text(`TAX (${estimate.taxRate}%)`, 130, y);
            doc.text(`$${calculations.tax.toFixed(2)}`, 195, y, { align: 'right' });
            y += 8;
        } else {
            y += 2;
        }

        // Total line
        doc.setDrawColor(...lightGray);
        doc.setLineWidth(0.5);
        doc.line(130, y, 195, y);
        y += 7;

        doc.setFont(undefined, 'bold');
        doc.setFontSize(14);
        doc.text('TOTAL', 130, y);
        doc.setTextColor(...gold);
        doc.text(`$${calculations.total.toFixed(2)}`, 195, y, { align: 'right' });

        y += 15;

        // Terms
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...lightGray);
        doc.text('Terms: 50% deposit required. Balance due upon completion.', 15, y);
        y += 4;
        doc.text('Valid for 30 days.', 15, y);

        // Project Notes if applicable
        if (estimate.notes && estimate.notes.trim()) {
            y += 10;
            doc.setFont(undefined, 'bold');
            doc.setFontSize(9);
            doc.setTextColor(...darkGray);
            doc.text('PROJECT NOTES:', 15, y);
            y += 5;
            
            doc.setFont(undefined, 'normal');
            doc.setTextColor(...lightGray);
            const notes = doc.splitTextToSize(estimate.notes, 180);
            doc.text(notes, 15, y);
        }

        // Bottom contact info
        const pageHeight = doc.internal.pageSize.height;
        y = pageHeight - 15;
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(...lightGray);
        doc.text('If you have any questions, please contact', 105, y, { align: 'center' });
        y += 4;
        doc.text('Rangel Pineda  •  678-709-3790  •  rangelp@desirecabinets.com', 105, y, { align: 'center' });

        // Save the PDF
        const filename = `DesireCabinets_Quote_${estimate.quoteNumber}_${estimate.client.name || 'Estimate'}.pdf`;
        doc.save(filename);
    }

    // Generate alternate quote (e.g., without LEDs)
    async generateAlternate(removeAddonKey = 'colorChangingLEDs') {
        // Save current state
        const originalAddons = this.calculator.getCurrentRoom().addons;
        
        // Remove specified addon from current room
        if (originalAddons[removeAddonKey]) {
            originalAddons[removeAddonKey].enabled = false;
        }

        // Update quote number for alternate
        const originalQuoteNum = this.calculator.estimate.quoteNumber;
        this.calculator.estimate.quoteNumber = originalQuoteNum + '-ALT';

        // Generate PDF
        await this.generate();

        // Restore original state
        this.calculator.getCurrentRoom().addons = originalAddons;
        this.calculator.estimate.quoteNumber = originalQuoteNum;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReportGenerator;
}
