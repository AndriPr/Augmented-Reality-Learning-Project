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
        
        this.infoPanel = document.getElementById('info-panel');
        this.infoTitle = document.getElementById('info-title');
        this.infoFunction = document.getElementById('info-function');
        this.infoDesc = document.getElementById('info-desc');
        this.buttonsContainer = document.getElementById('buttons-container');

        this.modalMarker = document.getElementById('modal-marker');
        
        this.initEvents();
    }

    initEvents() {
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
        this.buildButtons(targetId);
    }

    onTargetLost() {
        this.statusText.textContent = 'Mencari Marker...';
        this.pulseDot.classList.remove('active');
        this.hideInfoPanel();
    }

    buildButtons(targetId) {
        this.buttonsContainer.innerHTML = ''; // clear
        const db = modelDatabase[targetId];
        if(!db) return;

        Object.keys(db.parts).forEach(partKey => {
            const btn = document.createElement('button');
            btn.className = 'btn-part';
            btn.textContent = db.parts[partKey].title;
            btn.addEventListener('click', () => this.showInfoPanel(targetId, partKey));
            this.buttonsContainer.appendChild(btn);
        });
    }

    showInfoPanel(targetId, partKey) {
        const data = modelDatabase[targetId]?.parts[partKey];
        if (data) {
            this.infoTitle.textContent = data.title;
            this.infoFunction.textContent = data.function;
            this.infoDesc.textContent = data.desc;
            this.infoPanel.classList.add('visible');

            // Highlight active button
            const buttons = this.buttonsContainer.querySelectorAll('.btn-part');
            buttons.forEach(btn => {
                if(btn.textContent === data.title) btn.classList.add('active');
                else btn.classList.remove('active');
            });
        }
    }

    hideInfoPanel() {
        this.infoPanel.classList.remove('visible');
        this.buttonsContainer.innerHTML = '';
    }
}
