// Main App Controller - Desire Cabinets Estimator
// Multi-Room Support

class ClosetEstimatorApp {
    constructor() {
        this.calculator = new ClosetCalculator();
        this.reportGenerator = new ReportGenerator(this.calculator);
        this.init();
    }

    init() {
        // Load saved estimate if exists
        this.calculator.loadFromStorage();
        
        // Render room tabs
        this.renderRoomTabs();
        
        // Render all UI components
        this.renderDepthSelector();
        this.renderMaterialSelector();
        this.renderHardwareSelector();
        this.renderMountingSelector();
        this.renderAddonList();
        
        // Load saved values into form
        this.loadFormValues();
        
        // Update quote info
        this.updateQuoteInfo();
        
        // Initial calculation
        this.calculate();

        // Auto-save on changes
        this.setupAutoSave();
    }

    renderRoomTabs() {
        const container = document.getElementById('roomTabs');
        const rooms = this.calculator.getRooms();
        
        container.innerHTML = rooms.map((room, index) => `
            <button class="room-tab ${index === this.calculator.currentRoomIndex ? 'active' : ''}" 
                    onclick="app.switchToRoom(${index})">
                <span class="room-tab-name">${room.name || `Room ${index + 1}`}</span>
                ${rooms.length > 1 ? `<span class="room-tab-remove" onclick="event.stopPropagation(); app.deleteRoom(${index})">×</span>` : ''}
            </button>
        `).join('') + `
            <button class="room-tab-add" onclick="app.addNewRoom()">
                + Add Room
            </button>
        `;
    }

    renderDepthSelector() {
        const container = document.getElementById('depthSelector');
        const depths = [14, 16, 19, 24];
        const currentRoom = this.calculator.getCurrentRoom();
        
        container.innerHTML = depths.map(depth => `
            <div class="depth-option ${currentRoom.closet.depth === depth ? 'selected' : ''}" 
                 onclick="app.selectDepth(${depth})">
                <input type="radio" name="depth" value="${depth}" id="depth${depth}" 
                       ${currentRoom.closet.depth === depth ? 'checked' : ''}>
                <div class="depth-label">${depth}"</div>
            </div>
        `).join('');
    }

    renderMaterialSelector() {
        const container = document.getElementById('materialSelector');
        const currentRoom = this.calculator.getCurrentRoom();
        
        container.innerHTML = PRICING_CONFIG.materials.map(material => `
            <button class="selection-btn ${currentRoom.closet.material === material.id ? 'selected' : ''}" 
                 onclick="app.selectMaterial('${material.id}')">
                ${material.name}${material.upcharge > 0 ? ` (+$${material.upcharge}/ft)` : ''}
            </button>
        `).join('');
    }

    renderHardwareSelector() {
        const container = document.getElementById('hardwareSelector');
        const currentRoom = this.calculator.getCurrentRoom();
        
        container.innerHTML = PRICING_CONFIG.hardwareFinishes.map(hardware => `
            <button class="selection-btn ${currentRoom.closet.hardwareFinish === hardware.id ? 'selected' : ''}" 
                 onclick="app.selectHardware('${hardware.id}')">
                ${hardware.name}
            </button>
        `).join('');
    }

    renderMountingSelector() {
        const container = document.getElementById('mountingSelector');
        const currentRoom = this.calculator.getCurrentRoom();
        
        container.innerHTML = PRICING_CONFIG.mounting.map(mount => `
            <button class="selection-btn ${currentRoom.closet.mounting === mount.id ? 'selected' : ''}" 
                 onclick="app.selectMounting('${mount.id}')">
                ${mount.name}
            </button>
        `).join('');
    }

    renderAddonList() {
        const container = document.getElementById('addonList');
        const currentRoom = this.calculator.getCurrentRoom();
        
        container.innerHTML = Object.entries(PRICING_CONFIG.addons).map(([key, addon]) => {
            const savedAddon = currentRoom.addons[key] || { enabled: false, quantity: 0 };
            return `
                <div class="addon-item">
                    <input type="checkbox" id="addon-${key}" 
                           ${savedAddon.enabled ? 'checked' : ''}
                           onchange="app.toggleAddon('${key}', this.checked)">
                    <div class="addon-details">
                        <div class="addon-name">${addon.name}</div>
                        <div class="addon-unit">$${addon.price.toFixed(2)} per ${addon.unit}</div>
                    </div>
                    <input type="number" class="addon-quantity" id="qty-${key}" 
                           min="0" step="${addon.unit.includes('linear') ? '0.5' : '1'}" 
                           value="${savedAddon.quantity}"
                           placeholder="Qty"
                           onchange="app.updateAddonQty('${key}', parseFloat(this.value) || 0)">
                    <div class="addon-price">$${addon.price.toFixed(2)}</div>
                </div>
            `;
        }).join('');
    }

    loadFormValues() {
        const estimate = this.calculator.estimate;
        const currentRoom = this.calculator.getCurrentRoom();
        
        // Client info
        document.getElementById('clientName').value = estimate.client.name || '';
        document.getElementById('clientPhone').value = estimate.client.phone || '';
        document.getElementById('clientAddress').value = estimate.client.address || '';
        document.getElementById('clientEmail').value = estimate.client.email || '';
        
        // Current room specs
        document.getElementById('roomName').value = currentRoom.name || '';
        document.getElementById('linearFeet').value = currentRoom.closet.linearFeet || 0;
        document.getElementById('height').value = currentRoom.closet.height || 96;
        
        // Notes
        document.getElementById('projectNotes').value = estimate.notes || '';
    }

    updateQuoteInfo() {
        document.getElementById('quoteNumber').textContent = this.calculator.estimate.quoteNumber;
        document.getElementById('quoteDate').textContent = new Date(this.calculator.estimate.date).toLocaleDateString();
    }

    // Room management
    addNewRoom() {
        this.calculator.addRoom();
        this.renderRoomTabs();
        this.switchToRoom(this.calculator.currentRoomIndex);
    }

    deleteRoom(index) {
        if (confirm('Are you sure you want to delete this room?')) {
            if (this.calculator.removeRoom(index)) {
                this.renderRoomTabs();
                this.switchToRoom(this.calculator.currentRoomIndex);
            }
        }
    }

    switchToRoom(index) {
        this.calculator.switchRoom(index);
        
        // Re-render all selectors for new room
        this.renderRoomTabs();
        this.renderDepthSelector();
        this.renderMaterialSelector();
        this.renderHardwareSelector();
        this.renderMountingSelector();
        this.renderAddonList();
        this.loadFormValues();
        this.calculate();
    }

    selectDepth(depth) {
        this.calculator.updateCloset('depth', depth);
        this.renderDepthSelector();
        this.calculate();
    }

    selectMaterial(materialId) {
        this.calculator.updateCloset('material', materialId);
        this.renderMaterialSelector();
        this.calculate();
    }

    selectHardware(hardwareId) {
        this.calculator.updateCloset('hardwareFinish', hardwareId);
        this.renderHardwareSelector();
        this.save();
    }

    selectMounting(mountingId) {
        this.calculator.updateCloset('mounting', mountingId);
        this.renderMountingSelector();
        this.save();
    }

    toggleAddon(addonKey, enabled) {
        const qty = parseFloat(document.getElementById(`qty-${addonKey}`).value) || 0;
        this.calculator.updateAddon(addonKey, enabled, qty);
        this.calculate();
    }

    updateAddonQty(addonKey, qty) {
        const checkbox = document.getElementById(`addon-${addonKey}`);
        this.calculator.updateAddon(addonKey, checkbox.checked, qty);
        this.calculate();
    }

    updateClient(field, value) {
        this.calculator.updateClient(field, value);
        
        // Regenerate quote number when client name changes
        if (field === 'name' && value) {
            this.calculator.estimate.quoteNumber = this.calculator.generateQuoteNumber(value);
            this.updateQuoteInfo();
        }
        
        this.save();
    }

    updateCloset(field, value) {
        if (field === 'roomName') {
            this.calculator.updateRoomName(value);
            this.renderRoomTabs(); // Update tab name
        } else {
            this.calculator.updateCloset(field, value);
        }
        this.calculate();
    }

    updateNotes(notes) {
        this.calculator.updateNotes(notes);
        this.save();
    }

    calculate() {
        const calculations = this.calculator.calculateTotal();
        
        // Update summary display
        document.getElementById('summaryBase').textContent = `$${calculations.base.toFixed(2)}`;
        document.getElementById('summaryTotal').textContent = `$${calculations.total.toFixed(2)}`;
        
        // Show/hide material upcharge line
        const materialLine = document.getElementById('materialUpchargeLine');
        const materialValue = document.getElementById('summaryMaterial');
        
        if (calculations.materialUpcharge > 0) {
            materialLine.style.display = 'flex';
            materialValue.textContent = `$${calculations.materialUpcharge.toFixed(2)}`;
        } else {
            materialLine.style.display = 'none';
        }
        
        // Show/hide add-ons line
        const addonsLine = document.getElementById('addonsLine');
        const addonsValue = document.getElementById('summaryAddons');
        
        if (calculations.addons > 0) {
            addonsLine.style.display = 'flex';
            addonsValue.textContent = `$${calculations.addons.toFixed(2)}`;
        } else {
            addonsLine.style.display = 'none';
        }

        // Update room count display
        const roomCount = this.calculator.getRooms().length;
        document.getElementById('roomCount').textContent = roomCount > 1 ? `${roomCount} Rooms` : '1 Room';
        
        this.save();
    }

    save() {
        this.calculator.saveToStorage();
    }

    setupAutoSave() {
        // Auto-save every 30 seconds
        setInterval(() => this.save(), 30000);
    }

    async generatePDF() {
        const totalLF = this.calculator.getRooms().reduce((sum, room) => sum + room.closet.linearFeet, 0);
        
        if (totalLF === 0) {
            alert('Please enter linear feet for at least one room before generating quote.');
            return;
        }
        await this.reportGenerator.generate();
    }

    reset() {
        if (confirm('Are you sure you want to start a new quote? Current data will be cleared.')) {
            this.calculator.reset();
            this.calculator.saveToStorage();
            location.reload();
        }
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ClosetEstimatorApp();
});
