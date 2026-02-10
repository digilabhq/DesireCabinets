// Calculator Module - Desire Cabinets LLC
// Multi-Room Support

class ClosetCalculator {
    constructor() {
        this.estimate = {
            client: {
                name: '',
                address: '',
                phone: '',
                email: ''
            },
            rooms: [
                this.createNewRoom()  // Start with one room
            ],
            notes: '',
            quoteNumber: this.generateQuoteNumber(),
            date: new Date().toISOString().split('T')[0]
        };
        this.currentRoomIndex = 0;  // Track which room we're editing
    }

    createNewRoom() {
        return {
            name: '',  // e.g., "Master Bedroom", "Walk-in Closet", etc.
            closet: {
                linearFeet: 0,
                depth: 16,
                height: 96,
                material: 'white',
                hardwareFinish: 'black',
                mounting: 'floor'
            },
            addons: {}
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

    // Get current room being edited
    getCurrentRoom() {
        return this.estimate.rooms[this.currentRoomIndex];
    }

    // Get all rooms
    getRooms() {
        return this.estimate.rooms;
    }

    // Add a new room
    addRoom() {
        this.estimate.rooms.push(this.createNewRoom());
        this.currentRoomIndex = this.estimate.rooms.length - 1;
        return this.currentRoomIndex;
    }

    // Remove a room
    removeRoom(index) {
        if (this.estimate.rooms.length > 1) {
            this.estimate.rooms.splice(index, 1);
            if (this.currentRoomIndex >= this.estimate.rooms.length) {
                this.currentRoomIndex = this.estimate.rooms.length - 1;
            }
            return true;
        }
        return false;
    }

    // Switch to different room
    switchRoom(index) {
        if (index >= 0 && index < this.estimate.rooms.length) {
            this.currentRoomIndex = index;
            return true;
        }
        return false;
    }

    // Calculate base system cost for a specific room
    calculateRoomBase(room) {
        const { linearFeet, depth } = room.closet;
        const pricePerFoot = PRICING_CONFIG.baseSystem[depth];
        return linearFeet * pricePerFoot;
    }

    // Calculate material upcharge for a specific room
    calculateRoomMaterialUpcharge(room) {
        const { linearFeet, material } = room.closet;
        const materialConfig = PRICING_CONFIG.materials.find(m => m.id === material);
        return linearFeet * (materialConfig?.upcharge || 0);
    }

    // Calculate all add-ons for a specific room
    calculateRoomAddons(room) {
        let total = 0;
        for (const [key, value] of Object.entries(room.addons)) {
            if (value.enabled && value.quantity > 0) {
                const addonConfig = PRICING_CONFIG.addons[key];
                total += value.quantity * addonConfig.price;
            }
        }
        return total;
    }

    // Calculate total for a specific room
    calculateRoomTotal(room) {
        const base = this.calculateRoomBase(room);
        const materialUpcharge = this.calculateRoomMaterialUpcharge(room);
        const addons = this.calculateRoomAddons(room);

        return {
            base,
            materialUpcharge,
            addons,
            total: base + materialUpcharge + addons
        };
    }

    // Calculate grand total across all rooms
    calculateTotal() {
        let totalBase = 0;
        let totalMaterialUpcharge = 0;
        let totalAddons = 0;

        const roomTotals = this.estimate.rooms.map(room => {
            const roomCalc = this.calculateRoomTotal(room);
            totalBase += roomCalc.base;
            totalMaterialUpcharge += roomCalc.materialUpcharge;
            totalAddons += roomCalc.addons;
            return roomCalc;
        });

        return {
            base: totalBase,
            materialUpcharge: totalMaterialUpcharge,
            addons: totalAddons,
            subtotal: totalBase + totalMaterialUpcharge + totalAddons,
            tax: 0,
            total: totalBase + totalMaterialUpcharge + totalAddons,
            rooms: roomTotals
        };
    }

    // Get active add-ons for a specific room
    getActiveAddons(room) {
        const active = [];
        for (const [key, value] of Object.entries(room.addons)) {
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

    // Generate description for a specific room
    generateRoomDescription(room) {
        const { linearFeet, depth, height, material, hardwareFinish, mounting } = room.closet;
        const materialName = PRICING_CONFIG.materials.find(m => m.id === material)?.name || 'White';
        const hardwareName = PRICING_CONFIG.hardwareFinishes.find(h => h.id === hardwareFinish)?.name || 'Black';
        const mountingName = PRICING_CONFIG.mounting.find(m => m.id === mounting)?.name || 'Floor Mounted';
        
        const activeAddons = this.getActiveAddons(room);
        const hasLEDs = activeAddons.some(a => a.key === 'colorChangingLEDs');

        let description = `${room.name ? room.name + ' - ' : ''}Walk-In Closet - ${mountingName.toLowerCase()} (~${linearFeet} LF x ${depth}"D x ${height}"H. 3/4" ${materialName} melamine frameless cabinets, plain doors/drawers, ${hardwareName} exposed hardware, full extension drawer slides`;
        
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

    // Update current room's closet specs
    updateCloset(field, value) {
        this.getCurrentRoom().closet[field] = value;
    }

    // Update current room's name
    updateRoomName(name) {
        this.getCurrentRoom().name = name;
    }

    // Update addon for current room
    updateAddon(addonKey, enabled, quantity = 0) {
        this.getCurrentRoom().addons[addonKey] = { enabled, quantity };
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
            currentRoom: this.getCurrentRoom(),
            currentRoomIndex: this.currentRoomIndex
        };
    }

    // Reset estimate
    reset() {
        this.estimate = {
            client: { name: '', address: '', phone: '', email: '' },
            rooms: [this.createNewRoom()],
            notes: '',
            quoteNumber: this.generateQuoteNumber(),
            date: new Date().toISOString().split('T')[0]
        };
        this.currentRoomIndex = 0;
    }

    // Load from localStorage
    loadFromStorage() {
        const saved = localStorage.getItem('desire-estimate');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.estimate = data;
                // Ensure we have at least one room
                if (!this.estimate.rooms || this.estimate.rooms.length === 0) {
                    this.estimate.rooms = [this.createNewRoom()];
                }
                this.currentRoomIndex = 0;
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
