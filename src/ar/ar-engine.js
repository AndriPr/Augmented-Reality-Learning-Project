import { modelDatabase } from '../data/database.js';

export class AREngine {
    constructor(uiController) {
        this.ui = uiController;
        this.currentActiveTarget = null;
        this.setupScene();
    }

    setupScene() {
        this.ui.updateLoadingProgress(10, "Menyiapkan Sistem AR...");

        const container = document.getElementById('ar-container');
        
        // Build the A-Frame scene dynamically to ensure clean state
        const sceneHTML = `
            <a-scene 
                mindar-image="imageTargetSrc: /assets/targets/targets.mind; autoStart: true; filterMinCF: 0.001; filterBeta: 1000; missTolerance: 2;" 
                color-space="sRGB" 
                renderer="colorManagement: true, physicallyCorrectLights, antialias: true" 
                vr-mode-ui="enabled: false" 
                device-orientation-permission-ui="enabled: false"
                cursor="rayOrigin: mouse"
                raycaster="objects: .clickable">
                
                <a-assets id="ar-assets">
                    <!-- Assets will be injected here -->
                </a-assets>

                <!-- Pencahayaan Maksimal agar model tidak gelap/hitam -->
                <a-light type="ambient" color="#FFFFFF" intensity="2.5"></a-light>
                <a-light type="directional" color="#FFFFFF" intensity="1.5" position="-1 2 1"></a-light>

                <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

                <!-- TARGET 0: Model Utama -->
                <a-entity id="target0" mindar-image-target="targetIndex: 0">
                    <a-entity position="0 0 0" scale="1 1 1">
                        <!-- Objek Primitif yang DIJAMIN MUNCUL (Kubus Kuning) -->
                        <a-box id="part1" color="#FFC000" position="0 0.5 0" scale="0.8 0.8 0.8" opacity="0.8"
                            animation="property: rotation; to: 0 360 0; loop: true; dur: 3000; easing: linear"
                            class="clickable" clickable-model>
                        </a-box>
                        
                        <!-- Model GLB Asli (Gearbox/Lainnya) -->
                        <a-entity 
                            gltf-model="#model-gearbox" 
                            position="0 0 0" scale="0.5 0.5 0.5" rotation="0 0 0" 
                            class="clickable" clickable-model>
                        </a-entity>
                    </a-entity>
                </a-entity>

                <!-- TARGET 1: Model Trafo -->
                <a-entity id="target1" mindar-image-target="targetIndex: 1">
                    <a-entity position="0 0 0" scale="0.5 0.5 0.5" rotation="0 0 0">
                        <!-- Placeholder primitives until Trafo GLB is uploaded -->
                        <a-box id="Bushing" color="#FFC000" position="-0.7 0.5 0" scale="0.5 1 0.5" class="clickable" clickable-model></a-box>
                        <a-cylinder id="Radiator" color="#00A2E9" position="0.7 0.5 0" radius="0.3" height="0.8" class="clickable" clickable-model></a-cylinder>
                    </a-entity>
                </a-entity>

            </a-scene>
        `;
        
        container.innerHTML = sceneHTML;
        this.ui.updateLoadingProgress(30, "Memuat Aset 3D (Bisa memakan waktu)...");

        // Inject large assets dynamically to track loading
        const assetsEl = document.getElementById('ar-assets');
        const gearboxAsset = document.createElement('a-asset-item');
        gearboxAsset.setAttribute('id', 'model-gearbox');
        gearboxAsset.setAttribute('src', '/assets/models/GearboxAssy.glb');
        
        // Track asset loading
        gearboxAsset.addEventListener('loaded', () => {
            this.ui.updateLoadingProgress(80, "Memulai Kamera...");
        });
        gearboxAsset.addEventListener('error', () => {
            console.error("Gagal memuat model gearbox");
            this.ui.updateLoadingProgress(100, "Error memuat aset");
        });

        assetsEl.appendChild(gearboxAsset);

        // Register custom A-Frame component for clicking BEFORE scene loaded fully
        this.registerClickComponent();

        // Listen for A-Frame scene loaded
        const sceneEl = container.querySelector('a-scene');
        sceneEl.addEventListener('loaded', () => {
            this.ui.updateLoadingProgress(100, "Selesai!");
            this.bindTargetEvents();
        });
    }

    bindTargetEvents() {
        const targets = document.querySelectorAll('[mindar-image-target]');
        targets.forEach((targetEl) => {
            const targetId = targetEl.getAttribute('id');
            
            targetEl.addEventListener("targetFound", () => {
                this.currentActiveTarget = targetId;
                this.ui.onTargetFound(targetId);
            });

            targetEl.addEventListener("targetLost", () => {
                if (this.currentActiveTarget === targetId) {
                    this.currentActiveTarget = null;
                    this.ui.onTargetLost();
                }
            });
        });
    }

    registerClickComponent() {
        if(AFRAME.components['clickable-model']) return; // Prevent double registration

        const self = this;
        AFRAME.registerComponent('clickable-model', {
            init: function () {
                this.el.addEventListener('click', (evt) => {
                    if (!evt.detail.intersection || !self.currentActiveTarget) return;

                    let partName = evt.detail.intersection.object.name;
                    const db = modelDatabase[self.currentActiveTarget];
                    
                    if (!partName || !db.parts[partName]) {
                        const el = evt.detail.intersection.object.el;
                        if (el) {
                            partName = el.getAttribute('id') || el.getAttribute('data-part');
                        }
                    }

                    if (partName && db.parts[partName]) {
                        self.ui.showInfoPanel(self.currentActiveTarget, partName);
                    }
                });
            }
        });
    }
}
