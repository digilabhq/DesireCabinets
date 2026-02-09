// Calculator Module - Desire Cabinets LLC

class ClosetCalculator {
    constructor() {
        this.estimate = {
            client: {
                name: '',
                address: '',
                phone: '',
                email: ''
            },
            closet: {
                roomName: '',  // e.g., "Master Bedroom", "Guest Room"
                linearFeet: 0,
                depth: 16,
                height: 96,  // Default height
                material: 'white',
                hardwareFinish: 'black',
                mounting: 'floor'
            },
            addons: {},
            notes: '',
            quoteNumber: this.generateQuoteNumber(),
            date: new Date().toISOString().split('T')[0]
        };
    }

    generateQuoteNumber(clientName = '') {
        const timestamp = Date.now();
        
        // Extract initials from client name
        let initials = '';
        if (clientName) {
            const nameParts = clientName.trim().split(' ').filter(p => p.length > 0);
            initials = nameParts.map(p => p[0].toUpperCase()).join('');
            if (initials.length > 3) initials = initials.slice(0, 3); // Max 3 initials
        }
        
        return initials ? `${timestamp}-${initials}` : `${timestamp}`;
    }

    // Calculate base system cost
    calculateBase() {
        const { linearFeet, depth } = this.estimate.closet;
        const pricePerFoot = PRICING_CONFIG.baseSystem[depth];
        return linearFeet * pricePerFoot;
    }

    // Calculate material upcharge
    calculateMaterialUpcharge() {
        const { linearFeet, material } = this.estimate.closet;
        const materialConfig = PRICING_CONFIG.materials.find(m => m.id === material);
        return linearFeet * (materialConfig?.upcharge || 0);
    }

    // Calculate all add-ons
    calculateAddons() {
        let total = 0;
        for (const [key, value] of Object.entries(this.estimate.addons)) {
            if (value.enabled && value.quantity > 0) {
                const addonConfig = PRICING_CONFIG.addons[key];
                total += value.quantity * addonConfig.price;
            }
        }
        return total;
    }

    // Calculate grand total
    calculateTotal() {
        const base = this.calculateBase();
        const materialUpcharge = this.calculateMaterialUpcharge();
        const addons = this.calculateAddons();

        return {
            base,
            materialUpcharge,
            addons,
            subtotal: base + materialUpcharge + addons,
            tax: 0,  // Can add tax calculation if needed
            total: base + materialUpcharge + addons
        };
    }

    // Get active add-ons for description
    getActiveAddons() {
        const active = [];
        for (const [key, value] of Object.entries(this.estimate.addons)) {
            if (value.enabled && value.quantity > 0) {
                const addonConfig = PRICING_CONFIG.addons[key];
                active.push({
                    key,
                    name: addonConfig.name,
                    quantity: value.quantity,
                    unit: addonConfig.unit,
                    price: addonConfig.price
                });
            }
        }
        return active;
    }

    // Generate quote description (like your actual quotes)
    generateDescription() {
        const { roomName, linearFeet, depth, height, material, hardwareFinish, mounting } = this.estimate.closet;
        const materialName = PRICING_CONFIG.materials.find(m => m.id === material)?.name || 'White';
        const hardwareName = PRICING_CONFIG.hardwareFinishes.find(h => h.id === hardwareFinish)?.name || 'Black';
        const mountingName = PRICING_CONFIG.mounting.find(m => m.id === mounting)?.name || 'Floor Mounted';
        
        const activeAddons = this.getActiveAddons();
        const hasLEDs = activeAddons.some(a => a.key === 'colorChangingLEDs');

        let description = `${roomName ? roomName + ' - ' : ''}Walk-In Closet - ${mountingName.toLowerCase()} (~${linearFeet} LF x ${depth}"D x ${height}"H. 3/4" ${materialName} melamine frameless cabinets, plain doors/drawers, ${hardwareName} exposed hardware, full extension drawer slides`;
        
        if (hasLEDs) {
            description += ', LED lighting';
        }
        
        description += '. Delivery & installation included).';
        
        return description;
    }

    // Update client info
    updateClient(field, value) {
        this.estimate.client[field] = value;
    }

    // Update closet specs
    updateCloset(field, value) {
        this.estimate.closet[field] = value;
    }

    // Update addon
    updateAddon(addonKey, enabled, quantity = 0) {
        this.estimate.addons[addonKey] = { enabled, quantity };
    }

    // Update notes
    updateNotes(notes) {
        this.estimate.notes = notes;
    }

    // Get current estimate data
    getEstimate() {
        return {
            ...this.estimate,
            calculations: this.calculateTotal(),
            description: this.generateDescription()
        };
    }

    // Reset estimate
    reset() {
        this.estimate = {
            client: { name: '', address: '', phone: '', email: '' },
            closet: {
                roomName: '',
                linearFeet: 0,
                depth: 16,
                height: 96,
                material: 'white',
                hardwareFinish: 'black',
                mounting: 'floor'
            },
            addons: {},
            notes: '',
            quoteNumber: this.generateQuoteNumber(),
            date: new Date().toISOString().split('T')[0]
        };
    }

    // Load from localStorage
    loadFromStorage() {
        const saved = localStorage.getItem('desire-estimate');
        if (saved) {
            try {
                this.estimate = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading saved estimate:', e);
            }
        }
    }

    // Save to localStorage
    saveToStorage() {
        localStorage.setItem('desire-estimate', JSON.stringify(this.estimate));
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClosetCalculator;
}
