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
        this.btnToggleMode = document.getElementById('btn-toggle-mode');
        this.virtualBg = document.getElementById('virtual-bg');

        // State UI
        this.is2DMode = false;

        this.modalMarker = document.getElementById('modal-marker');
        
        this.initEvents();
    }

    initEvents() {
        // Binding Actions
        
        this.btnDownload2D = document.getElementById('btn-download-2d');

        if (this.btnDownload2D) {
            this.btnDownload2D.addEventListener('click', () => {
                const modal2D = document.getElementById('modal-download-2d');
                const progress2D = document.getElementById('progress-bar-2d');
                const text2D = document.getElementById('download-2d-text');
                modal2D.classList.remove('hidden');
                
                let progress = 0;
                const interval = setInterval(() => {
                    progress += Math.floor(Math.random() * 20) + 10; // Cepat
                    if (progress > 100) progress = 100;
                    progress2D.style.width = progress + '%';
                    text2D.textContent = progress + '%';
                    
                    if (progress === 100) {
                        clearInterval(interval);
                        setTimeout(() => {
                            modal2D.classList.add('hidden');
                            this.btnDownload2D.classList.add('hidden'); // Sembunyikan tombol unduh
                            this.btnToggleMode.classList.remove('hidden'); // Munculkan tombol beralih mode
                            
                            // Langsung alihkan ke mode 2D
                            this.toggleARMode(true);
                        }, 500);
                    }
                }, 300);
            });
        }

        if (this.btnToggleMode) {
            this.btnToggleMode.addEventListener('click', () => {
                this.toggleARMode(!this.is2DMode);
            });
        }
        
        const btnToggleUI = document.getElementById('btn-toggle-ui');
        if (btnToggleUI) {
            btnToggleUI.addEventListener('click', () => {
                const actionBar = document.getElementById('action-bar');
                // Header is already partially visible, let's toggle visibility of action bar
                if (actionBar) {
                    actionBar.classList.toggle('hidden');
                }
                
                // Toggle opacity of header to make it semi-transparent or hidden
                const header = document.querySelector('.glass-header');
                if (header) {
                    if (header.style.opacity === '0.2') {
                        header.style.opacity = '1';
                    } else {
                        header.style.opacity = '0.2'; // Make it very transparent but still clickable to bring it back
                    }
                }
            });
        }
        
        const btnResetView = document.getElementById('btn-reset-view');
        if (btnResetView) {
            btnResetView.addEventListener('click', () => {
                window.dispatchEvent(new Event('resetView'));
            });
        }
        
        const btnStartApp = document.getElementById('btn-start-app');
        if (btnStartApp) {
            btnStartApp.addEventListener('click', () => {
                document.getElementById('onboarding-overlay').style.display = 'none';
            });
        }
    }

    toggleARMode(is2D) {
        this.is2DMode = is2D;
        
        // Update Button UI
        this.btnToggleMode.textContent = this.is2DMode ? 'Beralih ke AR' : 'Beralih ke 2D';
        
        // Update Virtual BG
        if (this.is2DMode) {
            this.virtualBg.classList.remove('hidden');
        } else {
            this.virtualBg.classList.add('hidden');
        }

        // Beritahu sistem AR untuk beralih mode
        window.dispatchEvent(new CustomEvent('toggleARMode', { detail: this.is2DMode }));
    }

    updateLoadingProgress(percent, text) {
        this.progressBar.style.width = `${percent}%`;
        if(text) this.loadingText.textContent = text;
        
        if (percent >= 100) {
            setTimeout(() => {
                this.loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    this.loadingScreen.classList.add('hidden');
                    // Onboarding will be visible by default since it's not hidden
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
        let resetIsAnimating = false;
        btnAll.addEventListener('click', () => {
            if (resetIsAnimating) return;
            resetIsAnimating = true;
            setTimeout(() => { resetIsAnimating = false; }, 1000);

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
            
            // Spam-click protection (debounce)
            let isAnimating = false;
            
            btn.addEventListener('click', () => {
                if (isAnimating) return;
                
                // Block clicks for 1 second (animation duration + buffer)
                isAnimating = true;
                setTimeout(() => { isAnimating = false; }, 1000);
                
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
            
            let isResetAnimating = false;
            resetBtn.addEventListener('click', () => {
                if (isResetAnimating) return;
                isResetAnimating = true;
                setTimeout(() => { isResetAnimating = false; }, 1000);
                
                this.hideInfoPanel();
            });
            this.infoPanel.appendChild(resetBtn);
        }

        this.infoPanel.classList.remove('hidden');
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
        setTimeout(() => {
            if (!this.infoPanel.classList.contains('visible')) {
                this.infoPanel.classList.add('hidden');
            }
        }, 400); // match CSS transition duration
        
        // Reset isolasi 3D model
        window.dispatchEvent(new Event('resetModelIsolation'));
    }
}
