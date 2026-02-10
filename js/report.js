// PDF Report Generator - Matching Quote #0018 Format

class ReportGenerator {
    constructor(calculator) {
        this.calculator = calculator;
    }

    async generate() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const estimate = this.calculator.getEstimate();
        const calculations = estimate.calculations;

        // Colors from Desire Cabinets logo
        const gold = [184, 134, 11];
        const black = [0, 0, 0];
        const darkGray = [44, 44, 44];
        
        let y = 20;

        // Header with logo
        try {
            const logoImg = document.getElementById('logo-img');
            if (logoImg && logoImg.complete) {
                doc.addImage(logoImg, 'JPEG', 15, y, 60, 15);
            }
        } catch (e) {
            console.log('Logo not added to PDF');
        }

        // "QUOTE" title on right
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...black);
        doc.text('QUOTE', 160, y + 10);

        y += 30;

        // Quote # and Date box (top right)
        doc.setFillColor(240, 240, 240);
        doc.rect(130, y, 65, 20, 'F');
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('QUOTE #', 135, y + 6);
        doc.text('DATE', 135, y + 13);
        
        doc.setFont(undefined, 'normal');
        doc.text(estimate.quoteNumber, 170, y + 6);
        doc.text(new Date(estimate.date).toLocaleDateString(), 170, y + 13);

        y += 30;

        // Bill To section (left)
        doc.setFillColor(240, 240, 240);
        doc.rect(15, y, 70, 35, 'F');
        
        doc.setFont(undefined, 'bold');
        doc.text('BILL TO', 18, y + 6);
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        if (estimate.client.name) doc.text(estimate.client.name, 18, y + 12);
        if (estimate.client.address) doc.text(estimate.client.address, 18, y + 17);
        if (estimate.client.phone) doc.text(estimate.client.phone, 18, y + 22);

        // Terms section (right)
        doc.setFillColor(240, 240, 240);
        doc.rect(130, y, 65, 10, 'F');
        
        doc.setFont(undefined, 'bold');
        doc.setFontSize(10);
        doc.text('TERMS', 135, y + 6);
        
        doc.setFont(undefined, 'italic');
        doc.text('Valid for 30 days', 170, y + 6);

        y += 50;

        // Table Header
        doc.setFillColor(...gold);
        doc.rect(15, y, 180, 8, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');
        doc.setFontSize(9);
        doc.text('DESCRIPTION', 18, y + 5);
        doc.text('QTY', 140, y + 5);
        doc.text('UNIT PRICE', 155, y + 5);
        doc.text('AMOUNT', 180, y + 5);

        y += 8;

        // Loop through each room and add to PDF
        doc.setTextColor(...darkGray);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(8.5);
        
        estimate.rooms.forEach((room, index) => {
            const roomCalc = calculations.rooms[index];
            const description = this.calculator.generateRoomDescription(room);
            const splitDesc = doc.splitTextToSize(description, 120);
            
            const descHeight = splitDesc.length * 4;
            
            // Check if we need a new page
            if (y + descHeight + 4 > 270) {
                doc.addPage();
                y = 20;
            }
            
            doc.rect(15, y, 180, descHeight + 4, 'S');
            
            doc.text(splitDesc, 18, y + 4);
            doc.text('1', 140, y + 4);
            doc.text(roomCalc.total.toFixed(2), 155, y + 4);
            doc.text(roomCalc.total.toFixed(2), 175, y + 4);

            y += descHeight + 4;
        });

        y += 5;

        // Empty rows (professional spacing)
        for (let i = 0; i < 2; i++) {
            if (y + 6 > 270) {
                doc.addPage();
                y = 20;
            }
            doc.rect(15, y, 180, 6, 'S');
            y += 6;
        }

        y += 5;

        // Check if we need new page for totals
        if (y + 30 > 270) {
            doc.addPage();
            y = 20;
        }

        // Footer totals
        doc.setFont(undefined, 'italic');
        doc.setFontSize(10);
        doc.text('Thank you for your business!', 18, y);

        doc.setFont(undefined, 'bold');
        doc.text('SUBTOTAL', 140, y);
        doc.text(calculations.subtotal.toFixed(2), 175, y);
        y += 6;

        doc.text('TAX RATE', 140, y);
        doc.text('0.00%', 175, y);
        y += 6;

        doc.text('TAX', 140, y);
        doc.text('-', 175, y);
        y += 8;

        // Total line
        doc.setDrawColor(...gold);
        doc.setLineWidth(0.5);
        doc.line(140, y - 2, 195, y - 2);

        doc.setFontSize(14);
        doc.text('TOTAL', 140, y + 3);
        doc.text(`$  ${calculations.total.toFixed(2)}`, 165, y + 3);

        // Bottom contact info
        const pageHeight = doc.internal.pageSize.height;
        y = pageHeight - 10;
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('If you have any questions, please contact', 105, y, { align: 'center' });
        doc.text('Rangel Pineda, 678-709-3790, rangelp@desirecabinets.com', 105, y + 4, { align: 'center' });

        // Save the PDF
        const filename = `DesireCabinets_Quote_${estimate.quoteNumber}_${estimate.client.name || 'Estimate'}.pdf`;
        doc.save(filename);
    }

    // Generate alternate quote (e.g., without LEDs)
    async generateAlternate(removeAddonKey = 'colorChangingLEDs') {
        // Save current state
        const originalAddons = { ...this.calculator.estimate.addons };
        
        // Remove specified addon
        if (this.calculator.estimate.addons[removeAddonKey]) {
            this.calculator.estimate.addons[removeAddonKey].enabled = false;
        }

        // Update quote number for alternate
        const originalQuoteNum = this.calculator.estimate.quoteNumber;
        this.calculator.estimate.quoteNumber = originalQuoteNum + '-b';

        // Generate PDF
        await this.generate();

        // Restore original state
        this.calculator.estimate.addons = originalAddons;
        this.calculator.estimate.quoteNumber = originalQuoteNum;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReportGenerator;
}
