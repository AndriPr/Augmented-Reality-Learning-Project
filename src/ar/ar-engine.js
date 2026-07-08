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
        
        const sceneHTML = `
            <a-scene 
                mindar-image="imageTargetSrc: /assets/targets/targets.mind; autoStart: true; filterMinCF: 0.0001; filterBeta: 0.001; missTolerance: 5;" 
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
                    <!-- Container untuk Touch Controls (Scale & Rotation) -->
                    <a-entity id="interactive-model" position="0 0 0" scale="0.05 0.05 0.05" rotation="0 0 0" touch-controller>
                        
                        <!-- HOTSPOTS (Petunjuk Visual - Non Clickable now since we use UI) -->
                        <a-entity id="hotspots" position="0 0 0">
                            <!-- Hotspot Ban -->
                            <a-sphere id="ban" color="#00A2E9" radius="4" position="15 5 15" opacity="0.6"
                                animation="property: scale; to: 1.5 1.5 1.5; dir: alternate; loop: true; dur: 800">
                            </a-sphere>
                            
                            <!-- Hotspot Mesin Belakang -->
                            <a-sphere id="mesin" color="#FFC000" radius="4" position="0 10 -15" opacity="0.6"
                                animation="property: scale; to: 1.5 1.5 1.5; dir: alternate; loop: true; dur: 800">
                            </a-sphere>

                            <!-- Hotspot Rangka -->
                            <a-sphere id="casis" color="#ff3b30" radius="4" position="0 25 0" opacity="0.6"
                                animation="property: scale; to: 1.5 1.5 1.5; dir: alternate; loop: true; dur: 800">
                            </a-sphere>
                        </a-entity>

                        <!-- Model GLB Kompleks (Mobil Buggy) -->
                        <a-entity 
                            id="gltf-main-model"
                            gltf-model="#model-complex" 
                            position="0 0 0" rotation="0 0 0" 
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
        const complexAsset = document.createElement('a-asset-item');
        complexAsset.setAttribute('id', 'model-complex');
        complexAsset.setAttribute('src', '/assets/models/Buggy.glb');
        
        // Track asset loading
        complexAsset.addEventListener('loaded', () => {
            this.ui.updateLoadingProgress(80, "Memulai Kamera...");
        });
        complexAsset.addEventListener('error', () => {
            console.error("Gagal memuat model kompleks");
            this.ui.updateLoadingProgress(100, "Error memuat aset");
        });

        assetsEl.appendChild(complexAsset);

        // Register custom A-Frame components
        this.registerClickComponent();
        this.registerTouchComponent();

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
        if(AFRAME.components['clickable-model']) return; 

        const self = this;
        AFRAME.registerComponent('clickable-model', {
            init: function () {
                // Listener untuk mereset isolasi model
                window.addEventListener('resetModelIsolation', () => {
                    const mesh = this.el.getObject3D('mesh');
                    if (mesh) {
                        mesh.traverse((node) => {
                            if (node.isMesh && node.userData.originalMaterial) {
                                node.material.dispose(); // clean up cloned material
                                node.material = node.userData.originalMaterial;
                                node.userData.originalMaterial = null;
                            }
                            
                            // Animasi kembali ke posisi semula
                            if (node.isMesh && node.userData.originalPosition) {
                                AFRAME.ANIME({
                                    targets: node.position,
                                    x: node.userData.originalPosition.x,
                                    y: node.userData.originalPosition.y,
                                    z: node.userData.originalPosition.z,
                                    duration: 800,
                                    easing: 'easeOutElastic(1, .8)'
                                });
                            }
                        });
                    }
                    
                    // Kembalikan semua hotspot
                    const hotspots = document.querySelectorAll('#hotspots a-sphere');
                    hotspots.forEach(h => {
                        h.setAttribute('visible', 'true');
                        h.setAttribute('animation', 'property: scale; to: 1.5 1.5 1.5; dir: alternate; loop: true; dur: 800');
                    });
                });

                // Listener ketika tombol di Action Bar UI diklik
                window.addEventListener('isolatePart', (e) => {
                    const partKey = e.detail; // e.g., 'ban', 'casis', 'mesin'
                    
                    const parentMesh = this.el.getObject3D('mesh');
                    if (parentMesh) {
                        parentMesh.traverse((node) => {
                            if (node.isMesh) {
                                // Simpan state original
                                if (!node.userData.originalMaterial) {
                                    node.userData.originalMaterial = node.material;
                                    node.material = node.material.clone();
                                }
                                if (!node.userData.originalPosition) {
                                    node.userData.originalPosition = node.position.clone();
                                }
                                
                                // Deteksi posisi spasial komponen (karena nama mesh generik)
                                const box = new THREE.Box3().setFromObject(node);
                                const worldCenter = new THREE.Vector3();
                                box.getCenter(worldCenter);
                                const localCenter = parentMesh.worldToLocal(worldCenter.clone());
                                
                                // Klasifikasi heuristik sederhana
                                let meshPart = 'casis';
                                if (localCenter.y < 12 && Math.abs(localCenter.x) > 8) meshPart = 'ban';
                                else if (localCenter.z < -8 && localCenter.y < 20) meshPart = 'mesin';

                                if (meshPart === partKey) {
                                    // Ini part yang dipilih! Biarkan solid dan kembali ke posisinya.
                                    node.material.transparent = false;
                                    node.material.opacity = 1;
                                    node.material.emissive = new THREE.Color(0x333333); 
                                    node.material.needsUpdate = true; // FIX: Wajib di Three.js jika mengubah transparent
                                    
                                    AFRAME.ANIME({
                                        targets: node.position,
                                        x: node.userData.originalPosition.x,
                                        y: node.userData.originalPosition.y,
                                        z: node.userData.originalPosition.z,
                                        duration: 800,
                                        easing: 'easeOutElastic(1, .8)'
                                    });
                                } else {
                                    // Ini part lain! Bikin transparan dan EXPLODE (Bongkar spt Lego)
                                    node.material.transparent = true;
                                    node.material.opacity = 0.2;
                                    node.material.emissive = new THREE.Color(0x000000); 
                                    node.material.needsUpdate = true; // FIX: Wajib di Three.js jika mengubah transparent
                                    
                                    // Hitung arah ledakan menjauh dari origin parent
                                    const dir = new THREE.Vector3().copy(node.userData.originalPosition).normalize();
                                    if (dir.lengthSq() < 0.001) dir.set(0, 1, 0); // Cegah NaN jika di origin
                                    
                                    const explodeDist = 30; // Jarak bongkar
                                    const targetPos = node.userData.originalPosition.clone().add(dir.multiplyScalar(explodeDist));
                                    
                                    AFRAME.ANIME({
                                        targets: node.position,
                                        x: targetPos.x,
                                        y: targetPos.y,
                                        z: targetPos.z,
                                        duration: 800,
                                        easing: 'easeOutExpo'
                                    });
                                }
                            }
                        });
                    }

                    // Sembunyikan semua hotspot, KECUALI yang diklik
                    const hotspots = document.querySelectorAll('#hotspots a-sphere');
                    hotspots.forEach(h => {
                        if (h.getAttribute('id') === partKey) {
                            h.setAttribute('visible', 'true');
                            h.setAttribute('animation', 'property: scale; to: 3 3 3; dir: alternate; loop: true; dur: 500');
                        } else {
                            h.setAttribute('visible', 'false');
                        }
                    });
                });

                // Listener Toggle AR/2D Mode
                window.addEventListener('toggleARMode', (e) => {
                    const is2D = e.detail;
                    const modelContainer = document.getElementById('interactive-model');
                    const camera = document.querySelector('a-camera');
                    const target = document.getElementById('target0');
                    const video = document.querySelector('video');

                    if (is2D) {
                        // Mode 2D Viewer
                        if (video) video.style.display = 'none';
                        camera.appendChild(modelContainer); // Pindah ke layar
                        modelContainer.setAttribute('position', '0 -0.5 -3');
                        modelContainer.setAttribute('scale', '0.05 0.05 0.05');
                        modelContainer.setAttribute('rotation', '0 0 0');
                    } else {
                        // Mode AR
                        if (video) video.style.display = 'block';
                        target.appendChild(modelContainer); // Kembali menempel ke logo
                        modelContainer.setAttribute('position', '0 0 0');
                        modelContainer.setAttribute('scale', '0.05 0.05 0.05');
                        modelContainer.setAttribute('rotation', '0 0 0');
                    }
                });

                this.el.addEventListener('click', (evt) => {
                    if (!evt.detail.intersection || !self.currentActiveTarget) return;

                    const clickedMesh = evt.detail.intersection.object;
                    let partName = clickedMesh.name;
                    const db = modelDatabase[self.currentActiveTarget];
                    
                    if (!partName || !db.parts[partName]) {
                        const el = evt.detail.intersection.object.el;
                        if (el) {
                            partName = el.getAttribute('id') || el.getAttribute('data-part');
                        }
                    }

                    // --- FITUR OBJEKTIFIKASI (ISOLATION MODE) ---
                    const parentMesh = this.el.getObject3D('mesh');
                    if (parentMesh) {
                        parentMesh.traverse((node) => {
                            if (node.isMesh) {
                                // Clone material sekali saja agar tidak berbagi material dengan mesh lain
                                if (!node.userData.originalMaterial) {
                                    node.userData.originalMaterial = node.material;
                                    node.material = node.material.clone();
                                }
                                
                                if (node === clickedMesh) {
                                    // Highlight mesh yang diklik
                                    node.material.transparent = false;
                                    node.material.opacity = 1;
                                    // Menambahkan efek warna agar lebih mencolok (opsional)
                                    node.material.emissive = new THREE.Color(0x333333); 
                                } else {
                                    // Bikin transparan (ghosting) mesh yang tidak diklik
                                    node.material.transparent = true;
                                    node.material.opacity = 0.15;
                                    node.material.emissive = new THREE.Color(0x000000); 
                                }
                            }
                        });
                    }
                    // ---------------------------------------------

                    if (partName && db.parts[partName]) {
                        self.ui.showInfoPanel(self.currentActiveTarget, partName);
                    } else {
                        // Fallback
                        self.ui.infoTitle.textContent = "Komponen: " + (partName || "Unknown");
                        self.ui.infoFunction.textContent = "Dipilih untuk dipelajari.";
                        self.ui.infoDesc.textContent = "Anda sedang mengisolasi komponen ini dari keseluruhan mesin. Komponen lain disamarkan agar Anda bisa fokus.";
                        self.ui.infoPanel.classList.add('visible');
                    }
                });
            }
        });
    }

    registerTouchComponent() {
        if(AFRAME.components['touch-controller']) return;

        AFRAME.registerComponent('touch-controller', {
            init: function () {
                this.initialScale = this.el.object3D.scale.x;
                this.initialDistance = 0;
                this.initialAngle = 0;
                this.initialZRot = 0;
                this.previousTouch = null;

                const sceneEl = document.querySelector('a-scene');

                sceneEl.addEventListener('touchstart', (e) => {
                    if (e.touches.length === 2) {
                        // Setup Pinch & Twist
                        const dx = e.touches[0].pageX - e.touches[1].pageX;
                        const dy = e.touches[0].pageY - e.touches[1].pageY;
                        this.initialDistance = Math.hypot(dx, dy);
                        this.initialScale = this.el.object3D.scale.x;
                        this.initialAngle = Math.atan2(dy, dx);
                        this.initialZRot = this.el.getAttribute('rotation').z;
                    } else if (e.touches.length === 1) {
                        // Setup Drag Rotate
                        this.previousTouch = { x: e.touches[0].pageX, y: e.touches[0].pageY };
                    }
                });

                sceneEl.addEventListener('touchmove', (e) => {
                    if (e.touches.length === 2) {
                        // Pinch to Zoom
                        const dx = e.touches[0].pageX - e.touches[1].pageX;
                        const dy = e.touches[0].pageY - e.touches[1].pageY;
                        const currentDistance = Math.hypot(dx, dy);
                        
                        const scaleFactor = currentDistance / this.initialDistance;
                        const newScale = this.initialScale * scaleFactor;
                        
                        // Limit scale (min 0.01, max 0.8)
                        const clampedScale = Math.max(0.01, Math.min(newScale, 0.8));
                        this.el.setAttribute('scale', `${clampedScale} ${clampedScale} ${clampedScale}`);

                        // Twist to Rotate Z (Miring)
                        const currentAngle = Math.atan2(dy, dx);
                        const angleDiff = (currentAngle - this.initialAngle) * (180 / Math.PI); 
                        const currentRot = this.el.getAttribute('rotation');
                        this.el.setAttribute('rotation', {
                            x: currentRot.x,
                            y: currentRot.y,
                            z: this.initialZRot + angleDiff
                        });
                        
                    } else if (e.touches.length === 1 && this.previousTouch) {
                        // Drag to Rotate X & Y (Lebih Halus: 0.2)
                        const deltaX = e.touches[0].pageX - this.previousTouch.x;
                        const deltaY = e.touches[0].pageY - this.previousTouch.y;
                        
                        const rotation = this.el.getAttribute('rotation');
                        this.el.setAttribute('rotation', {
                            x: rotation.x + deltaY * 0.2, 
                            y: rotation.y + deltaX * 0.2,
                            z: rotation.z
                        });
                        
                        this.previousTouch = { x: e.touches[0].pageX, y: e.touches[0].pageY };
                    }
                });
            }
        });
    }
}
