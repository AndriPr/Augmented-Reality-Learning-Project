import { modelDatabase } from '../data/database.js';

export class UIController {
    constructor() {
        // Elements
        this.loadingScreen = document.getElementById('loading-screen');
        this.progressBar = document.getElementById('progress-bar');
        this.loadingText = document.getElementById('loading-text');
        this.uiLayer = document.getElementById('ui-layer');
        
        this.statusText = document.getElementById('status-text');
        this.pulseDot = document.querySelector('.pulse-dot');
        
        this.actionBar = document.getElementById('action-bar');
        this.infoPanel = document.getElementById('info-panel');
        this.infoTitle = document.getElementById('info-title');
        this.infoFunction = document.getElementById('info-function');
        this.infoDesc = document.getElementById('info-desc');
        this.buttonsContainer = document.getElementById('buttons-container');
        this.btnDownload = document.getElementById('btn-download-marker');
        this.btnToggleMode = document.getElementById('btn-toggle-mode');
        this.virtualBg = document.getElementById('virtual-bg');

        // State UI
        this.is2DMode = false;

        this.modalMarker = document.getElementById('modal-marker');
        
        this.initEvents();
    }

    initEvents() {
        // Binding Actions
        this.btnDownload.addEventListener('click', () => {
            window.open('/assets/targets/card.png', '_blank');
        });

        if (this.btnToggleMode) {
            this.btnToggleMode.addEventListener('click', () => {
                this.is2DMode = !this.is2DMode;
                
                // Update Button UI
                this.btnToggleMode.textContent = this.is2DMode ? 'Mode: 2D' : 'Mode: AR';
                
                // Update Virtual BG
                if (this.is2DMode) {
                    this.virtualBg.classList.remove('hidden');
                } else {
                    this.virtualBg.classList.add('hidden');
                }

                // Beritahu sistem AR untuk beralih mode
                window.dispatchEvent(new CustomEvent('toggleARMode', { detail: this.is2DMode }));
            });
        }
        
        document.getElementById('btn-download-marker').addEventListener('click', () => {
            this.modalMarker.classList.remove('hidden');
        });
        document.getElementById('btn-close-modal').addEventListener('click', () => {
            this.modalMarker.classList.add('hidden');
        });
    }

    updateLoadingProgress(percent, text) {
        this.progressBar.style.width = `${percent}%`;
        if(text) this.loadingText.textContent = text;
        
        if (percent >= 100) {
            setTimeout(() => {
                this.loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    this.loadingScreen.classList.add('hidden');
                    this.uiLayer.classList.remove('hidden');
                }, 500);
            }, 500);
        }
    }

    onTargetFound(targetId) {
        this.statusText.textContent = `Melacak: ${modelDatabase[targetId]?.name || 'Objek'}`;
        this.pulseDot.classList.add('active');
        this.actionBar.classList.remove('hidden');
        this.buildButtons(targetId);
    }

    onTargetLost() {
        this.statusText.textContent = 'Mencari Marker...';
        this.pulseDot.classList.remove('active');
        this.actionBar.classList.add('hidden');
        this.hideInfoPanel();
    }

    buildButtons(targetId) {
        this.buttonsContainer.innerHTML = ''; // clear
        const db = modelDatabase[targetId];
        if(!db) return;

        // Tambahkan tombol Keseluruhan (Reset) di awal
        const btnAll = document.createElement('button');
        btnAll.className = 'btn-part active';
        btnAll.textContent = 'Semua (Keseluruhan)';
        btnAll.addEventListener('click', () => {
            window.dispatchEvent(new Event('resetModelIsolation'));
            this.hideInfoPanel();
            
            // Highlight button ini
            const buttons = this.buttonsContainer.querySelectorAll('.btn-part');
            buttons.forEach(b => b.classList.remove('active'));
            btnAll.classList.add('active');
        });
        this.buttonsContainer.appendChild(btnAll);

        Object.keys(db.parts).forEach(partKey => {
            const btn = document.createElement('button');
            btn.className = 'btn-part';
            btn.textContent = db.parts[partKey].title;
            btn.addEventListener('click', () => {
                this.showInfoPanel(targetId, partKey);
                window.dispatchEvent(new CustomEvent('isolatePart', { detail: partKey }));
                
                // Highlight active button (Reset All disilang)
                const buttons = this.buttonsContainer.querySelectorAll('.btn-part');
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
            this.buttonsContainer.appendChild(btn);
        });
    }

    showInfoPanel(targetId, partKey) {
        const data = modelDatabase[targetId]?.parts[partKey];
        if (data) {
            this.infoTitle.textContent = data.title;
            this.infoFunction.textContent = data.function;
            this.infoDesc.textContent = data.desc;
        }

        // Tampilkan tombol reset isolasi jika belum ada
        let resetBtn = document.getElementById('btn-reset-isolation');
        if (!resetBtn) {
            resetBtn = document.createElement('button');
            resetBtn.id = 'btn-reset-isolation';
            resetBtn.className = 'btn-outline';
            resetBtn.style.marginTop = '15px';
            resetBtn.style.width = '100%';
            resetBtn.textContent = 'Kembalikan Tampilan Penuh';
            resetBtn.addEventListener('click', () => {
                this.hideInfoPanel();
            });
            this.infoPanel.appendChild(resetBtn);
        }

        this.infoPanel.classList.add('visible');

        // Highlight active button (if exists)
        if (data) {
            const buttons = this.buttonsContainer.querySelectorAll('.btn-part');
            buttons.forEach(btn => {
                if(btn.textContent === data.title) btn.classList.add('active');
                else btn.classList.remove('active');
            });
        }
    }

    hideInfoPanel() {
        this.infoPanel.classList.remove('visible');
        
        // Reset isolasi 3D model
        window.dispatchEvent(new Event('resetModelIsolation'));
    }
}
