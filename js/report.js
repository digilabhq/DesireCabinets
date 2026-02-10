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

        // Logo Colors
        const gold = [184, 134, 11];
        const black = [0, 0, 0];
        const darkGray = [60, 60, 60];
        const lightGray = [140, 140, 140];
        
        let y = 15;  // Reduced from 20

        // Header with logo
        try {
            const logoImg = document.getElementById('logo-img');
            if (logoImg && logoImg.complete) {
                doc.addImage(logoImg, 'JPEG', 15, y, 45, 11);  // Slightly smaller
            }
        } catch (e) {
            console.log('Logo not added to PDF');
        }

        // "QUOTE" title
        doc.setFontSize(24);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(...lightGray);
        doc.text('QUOTE', 195, y + 8, { align: 'right' });

        y += 20;  // Reduced from 25

        // Quote # and Date - compact
        doc.setFillColor(250, 250, 250);
        doc.rect(145, y, 50, 14, 'F');  // Smaller box
        
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...darkGray);
        doc.text('QUOTE #', 148, y + 5);
        doc.text('DATE', 148, y + 10);
        
        doc.setFont(undefined, 'normal');
        doc.setTextColor(...lightGray);
        const quoteNum = estimate.revision > 0 ? `${estimate.quoteNumber} (Rev. ${estimate.revision})` : estimate.quoteNumber;
        doc.text(quoteNum, 188, y + 5, { align: 'right' });
        doc.text(new Date(estimate.date).toLocaleDateString(), 188, y + 10, { align: 'right' });

        y += 20;  // Reduced from 28

        // Bill To section - compact
        doc.setFont(undefined, 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...darkGray);
        doc.text('BILL TO:', 15, y);
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        y += 4;
        if (estimate.client.name) {
            doc.text(estimate.client.name, 15, y);
            y += 4;
        }
        if (estimate.client.address) {
            doc.text(estimate.client.address, 15, y);
            y += 4;
        }
        if (estimate.client.phone) {
            doc.text(estimate.client.phone, 15, y);
            y += 4;
        }
        if (estimate.client.email) {
            doc.text(estimate.client.email, 15, y);
            y += 4;
        }

        y += 6;  // Reduced from 10

        // Table Header
        doc.setFontSize(7);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...lightGray);
        doc.text('ITEM DESCRIPTION', 15, y);
        doc.text('QTY', 130, y, { align: 'right' });
        doc.text('UNIT PRICE', 160, y, { align: 'right' });
        doc.text('AMOUNT', 195, y, { align: 'right' });
        
        y += 1;
        doc.setDrawColor(...lightGray);
        doc.setLineWidth(0.3);
        doc.line(15, y, 195, y);
        
        y += 6;  // Reduced from 8

        // Loop through rooms - COMPACT
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...darkGray);
        
        estimate.rooms.forEach((room, index) => {
            const roomCalc = calculations.rooms[index];
            const description = this.calculator.generateRoomDescription(room);
            
            // Room title
            doc.setFont(undefined, 'bold');
            doc.text(description.title, 15, y);
            
            // Details as bullet points - compact
            doc.setFont(undefined, 'normal');
            doc.setFontSize(8);
            doc.setTextColor(...lightGray);
            
            y += 3.5;  // Reduced spacing
            description.details.forEach(detail => {
                if (y > 260) {
                    doc.addPage();
                    y = 15;
                }
                doc.text(`- ${detail}`, 15, y);
                y += 3.5;  // Reduced from 4
            });
            
            // Add project notes if present
            if (estimate.notes && estimate.notes.trim()) {
                doc.setFont(undefined, 'italic');
                doc.setFontSize(8);
                const notes = doc.splitTextToSize(`Note: ${estimate.notes}`, 115);
                notes.forEach(line => {
                    if (y > 260) {
                        doc.addPage();
                        y = 15;
                    }
                    doc.text(`- ${line}`, 15, y);
                    y += 3.5;
                });
                doc.setFont(undefined, 'normal');
            }
            
            // Price columns
            const priceY = y - (3.5 * (description.details.length + (estimate.notes ? 1 : 0))) - 3.5;
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(...darkGray);
            doc.text('1', 130, priceY + 3.5, { align: 'right' });
            doc.text(`$${roomCalc.total.toFixed(2)}`, 160, priceY + 3.5, { align: 'right' });
            doc.setFont(undefined, 'bold');
            doc.text(`$${roomCalc.total.toFixed(2)}`, 195, priceY + 3.5, { align: 'right' });
            
            y += 5;  // Reduced from 8
        });

        // Check for new page
        if (y > 235) {
            doc.addPage();
            y = 15;
        }

        y += 3;

        // Totals - compact
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...darkGray);
        
        doc.text('SUBTOTAL', 130, y);
        doc.text(`$${calculations.subtotal.toFixed(2)}`, 195, y, { align: 'right' });
        y += 5;

        // Discount
        if (calculations.discount > 0) {
            const discountLabel = estimate.discountType === 'percent' 
                ? `DISCOUNT (${estimate.discountValue}%)`
                : 'DISCOUNT';
            doc.setTextColor(...gold);
            doc.text(discountLabel, 130, y);
            doc.text(`-$${calculations.discount.toFixed(2)}`, 195, y, { align: 'right' });
            doc.setTextColor(...darkGray);
            y += 5;
        }

        // Tax
        if (estimate.taxRate > 0) {
            doc.text(`TAX (${estimate.taxRate}%)`, 130, y);
            doc.text(`$${calculations.tax.toFixed(2)}`, 195, y, { align: 'right' });
            y += 6;
        } else {
            y += 2;
        }

        // Total line
        doc.setDrawColor(...lightGray);
        doc.setLineWidth(0.5);
        doc.line(130, y, 195, y);
        y += 6;

        doc.setFont(undefined, 'bold');
        doc.setFontSize(13);
        doc.text('TOTAL', 130, y);
        doc.setTextColor(...gold);
        doc.text(`$${calculations.total.toFixed(2)}`, 195, y, { align: 'right' });

        y += 10;

        // Terms - compact
        doc.setFont(undefined, 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...lightGray);
        doc.text('Terms: 50% deposit required. Balance due upon completion. Valid for 30 days.', 15, y);

        // Bottom contact - compact
        const pageHeight = doc.internal.pageSize.height;
        y = pageHeight - 12;
        doc.setFontSize(7);
        doc.text('If you have any questions, please contact', 105, y, { align: 'center' });
        y += 3;
        doc.text('Rangel Pineda  •  678-709-3790  •  rangelp@desirecabinets.com', 105, y, { align: 'center' });

        // Save
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
