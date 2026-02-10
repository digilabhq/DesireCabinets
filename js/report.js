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

        // Colors - Updated to match logo
        const gold = [171, 137, 0];  // #AB8900
        const black = [0, 0, 0];     // #000000
        const lightGray = [140, 140, 140];
        
        let y = 15;

        // Header with 50% BIGGER logo
        try {
            const logoImg = document.getElementById('logo-img');
            if (logoImg && logoImg.complete) {
                doc.addImage(logoImg, 'JPEG', 15, y, 82, 21);
            }
        } catch (e) {
            console.log('Logo not added to PDF');
        }

        // "QUOTE" title - small, BLACK
        doc.setFontSize(7);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...black);  // BLACK
        doc.text('QUOTE', 195, y + 10, { align: 'right' });

        y += 26;

        // Quote # and Date - NO GRAY BOX, wider area for longer format
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...black);
        doc.text('QUOTE #', 135, y + 5);  // Moved left for more space
        doc.text('DATE', 135, y + 10);
        
        doc.setFont(undefined, 'normal');
        doc.setTextColor(...black);
        const quoteNum = estimate.revision > 0 ? `${estimate.quoteNumber} (Rev. ${estimate.revision})` : estimate.quoteNumber;
        doc.text(quoteNum, 193, y + 5, { align: 'right' });  // More space for longer quote #
        doc.text(new Date(estimate.date).toLocaleDateString(), 193, y + 10, { align: 'right' });

        // Bill To section - aligned
        doc.setFont(undefined, 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...black);
        doc.text('BILL TO:', 15, y + 5);
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...black);
        y += 9;
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

        y += 8;

        // Table Header - BLACK BOLD
        doc.setFontSize(7);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...black);
        doc.text('ITEM DESCRIPTION', 15, y);
        doc.text('QTY', 130, y, { align: 'right' });
        doc.text('UNIT PRICE', 160, y, { align: 'right' });
        doc.text('AMOUNT', 195, y, { align: 'right' });
        
        y += 1;
        doc.setDrawColor(...gold);  // GOLD line
        doc.setLineWidth(0.5);
        doc.line(15, y, 195, y);
        
        y += 6;

        // Loop through rooms
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...black);
        
        estimate.rooms.forEach((room, index) => {
            const roomCalc = calculations.rooms[index];
            const description = this.calculator.generateRoomDescription(room);
            
            // Room title - BLACK BOLD
            doc.setFont(undefined, 'bold');
            doc.setTextColor(...black);
            doc.text(description.title, 15, y);
            
            // Details as bullets - BLACK
            doc.setFont(undefined, 'normal');
            doc.setFontSize(8);
            doc.setTextColor(...black);
            
            y += 3.5;
            description.details.forEach(detail => {
                if (y > 260) {
                    doc.addPage();
                    y = 15;
                }
                doc.text(`- ${detail}`, 15, y);
                y += 3.5;
            });
            
            // Room notes - BLACK italic
            if (room.notes && room.notes.trim()) {
                doc.setFont(undefined, 'italic');
                doc.setFontSize(8);
                doc.setTextColor(...black);  // BLACK instead of light gray
                const notes = doc.splitTextToSize(`Note: ${room.notes}`, 115);
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
            
            // Price columns - BLACK for unit price, GOLD for amount
            const noteLines = room.notes ? Math.ceil(room.notes.length / 60) : 0;
            const priceY = y - (3.5 * (description.details.length + noteLines)) - 3.5;
            doc.setFontSize(9);
            doc.setTextColor(...black);
            doc.text('1', 130, priceY + 3.5, { align: 'right' });
            doc.text(`$${roomCalc.total.toFixed(2)}`, 160, priceY + 3.5, { align: 'right' });
            doc.setFont(undefined, 'bold');
            doc.setTextColor(...gold);  // GOLD for amount
            doc.text(`$${roomCalc.total.toFixed(2)}`, 195, priceY + 3.5, { align: 'right' });
            doc.setTextColor(...black);
            doc.setFont(undefined, 'normal');
            
            y += 5;
        });

        if (y > 235) {
            doc.addPage();
            y = 15;
        }

        y += 3;

        // Thank you message - GOLD
        doc.setFont(undefined, 'italic');
        doc.setFontSize(9);
        doc.setTextColor(...gold);
        doc.text('Thank you for your business!', 15, y);
        y += 8;

        // Totals - BLACK
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...black);
        
        doc.text('SUBTOTAL', 130, y);
        doc.text(`$${calculations.subtotal.toFixed(2)}`, 195, y, { align: 'right' });
        y += 5;

        // Discount - GOLD
        if (calculations.discount > 0) {
            const discountLabel = estimate.discountType === 'percent' 
                ? `DISCOUNT (${estimate.discountValue}%)`
                : 'DISCOUNT';
            doc.setTextColor(...gold);
            doc.text(discountLabel, 130, y);
            doc.text(`-$${calculations.discount.toFixed(2)}`, 195, y, { align: 'right' });
            doc.setTextColor(...black);
            y += 5;
        }

        // Tax - BLACK
        if (estimate.taxRate > 0) {
            doc.setTextColor(...black);
            doc.text(`TAX (${estimate.taxRate}%)`, 130, y);
            doc.text(`$${calculations.tax.toFixed(2)}`, 195, y, { align: 'right' });
            y += 6;
        } else {
            y += 2;
        }

        // Total line - GOLD
        doc.setDrawColor(...gold);
        doc.setLineWidth(0.5);
        doc.line(130, y, 195, y);
        y += 6;

        doc.setFont(undefined, 'bold');
        doc.setFontSize(13);
        doc.setTextColor(...black);
        doc.text('TOTAL', 130, y);
        doc.setTextColor(...gold);  // GOLD for total amount
        doc.text(`$${calculations.total.toFixed(2)}`, 195, y, { align: 'right' });

        y += 10;

        // Terms - BLACK
        doc.setFont(undefined, 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...black);
        doc.text('Terms: 50% deposit required. Balance due upon completion. Valid for 30 days.', 15, y);

        // Bottom contact - BLACK
        const pageHeight = doc.internal.pageSize.height;
        y = pageHeight - 12;
        doc.setFontSize(7);
        doc.setTextColor(...black);
        doc.text('If you have any questions, please contact', 105, y, { align: 'center' });
        y += 3;
        doc.text('Rangel Pineda  •  678-709-3790  •  rangelp@desirecabinets.com', 105, y, { align: 'center' });

        // Save - open in new tab for iOS compatibility
        const pdfBlob = doc.output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);
        window.open(blobUrl, '_blank');
        
        // Clean up after a delay
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
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
