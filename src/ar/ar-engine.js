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
                    <a-entity id="interactive-model" position="0 0 0" scale="0.2 0.2 0.2" rotation="0 0 0" touch-controller>
                        <!-- Laptop Mockup (Placeholder until GLB is provided) -->
                        <a-entity id="laptop-mockup" position="0 0 0">
                            <!-- Layar Laptop -->
                            <a-box id="layar" position="0 2 -1.5" scale="3.5 2.2 0.1" color="#1a1a1a" rotation="-15 0 0">
                                <!-- Screen Display -->
                                <a-plane position="0 0 0.51" width="3.3" height="2" color="#00A2E9"></a-plane>
                            </a-box>
                            
                            <!-- Base Laptop (Keyboard area) -->
                            <a-box id="base" position="0 0.5 -0.5" scale="3.5 0.2 2.5" color="#333333">
                                <!-- Keyboard -->
                                <a-plane position="0 0.51 0" rotation="-90 0 0" width="3.2" height="1.4" color="#111"></a-plane>
                            </a-box>
                            
                            <!-- Casing Bawah -->
                            <a-box id="casing_bawah" position="0 0.3 -0.5" scale="3.5 0.1 2.5" color="#222222"></a-box>
                            
                            <!-- RAM Lama -->
                            <a-box id="ram_lama" position="0 0.35 -0.5" scale="0.8 0.05 0.3" color="#228B22"></a-box>
                            
                            <!-- RAM Baru (Hidden initially) -->
                            <a-box id="ram_baru" position="2 0.35 -0.5" scale="0.8 0.05 0.3" color="#FACC15" visible="false"></a-box>
                        </a-entity>
                        
                        <!-- Drop Shadow Fake untuk 2D Showcase -->
                        <a-circle id="drop-shadow" rotation="-90 0 0" position="0 -0.1 0" radius="3" color="#000000" opacity="0" material="shader: flat; transparent: true;"></a-circle>
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
                // Fungsi utilitas animasi A-Frame
                const animateEl = (elId, prop, to, duration = 800) => {
                    const el = document.getElementById(elId);
                    if (!el) return;
                    AFRAME.ANIME({
                        targets: el.getAttribute(prop),
                        x: to.x !== undefined ? to.x : el.getAttribute(prop).x,
                        y: to.y !== undefined ? to.y : el.getAttribute(prop).y,
                        z: to.z !== undefined ? to.z : el.getAttribute(prop).z,
                        duration: duration,
                        easing: 'easeOutExpo',
                        update: function() {
                            el.setAttribute(prop, {
                                x: this.targets[0].x,
                                y: this.targets[0].y,
                                z: this.targets[0].z
                            });
                        }
                    });
                };

                // Reset semua posisi laptop ke awal
                window.addEventListener('resetModelIsolation', () => {
                    animateEl('casing_bawah', 'position', {x: 0, y: 0.3, z: -0.5});
                    animateEl('ram_lama', 'position', {x: 0, y: 0.35, z: -0.5});
                    animateEl('ram_lama', 'rotation', {x: 0, y: 0, z: 0});
                    
                    const ramBaru = document.getElementById('ram_baru');
                    if(ramBaru) ramBaru.setAttribute('visible', 'false');
                    
                    const layar = document.getElementById('layar');
                    if(layar) layar.setAttribute('color', '#1a1a1a'); // Reset warna layar
                });

                // Listener Mode Berubah
                window.addEventListener('changeMode', (e) => {
                    const mode = e.detail;
                    window.dispatchEvent(new Event('resetModelIsolation'));
                    
                    if(mode === 'health') {
                        // Simulasi thermal (warna layar merah/kuning)
                        const layar = document.getElementById('layar');
                        if(layar) layar.setAttribute('color', '#aa2222');
                    }
                });

                // Listener untuk Langkah Maintenance
                window.addEventListener('maintenanceStep', (e) => {
                    const step = e.detail;
                    
                    if (step === 0) {
                        // Langkah 1: Buka Casing Bawah (geser ke bawah/menjauh)
                        animateEl('casing_bawah', 'position', {y: -1.5, z: -0.5});
                        animateEl('ram_lama', 'position', {x: 0, y: 0.35, z: -0.5});
                        document.getElementById('ram_baru').setAttribute('visible', 'false');
                    } 
                    else if (step === 1) {
                        // Langkah 2: Lepas RAM Lama
                        animateEl('casing_bawah', 'position', {y: -1.5, z: -0.5}); // Pastikan casing terbuka
                        
                        // RAM miring lalu tercabut ke atas
                        const ramLama = document.getElementById('ram_lama');
                        AFRAME.ANIME({
                            targets: ramLama.getAttribute('rotation'),
                            x: 30, // miring 30 derajat
                            duration: 400,
                            easing: 'easeOutExpo',
                            update: function() { ramLama.setAttribute('rotation', {x: this.targets[0].x, y: 0, z: 0}); },
                            complete: () => {
                                animateEl('ram_lama', 'position', {y: 1.5, z: 1.5}); // tercabut
                            }
                        });
                        document.getElementById('ram_baru').setAttribute('visible', 'false');
                    }
                    else if (step === 2) {
                        // Langkah 3: Pasang RAM Baru
                        animateEl('casing_bawah', 'position', {y: -1.5, z: -0.5});
                        animateEl('ram_lama', 'position', {x: 5, y: 1.5, z: 1.5}); // RAM lama dijauhkan
                        
                        const ramBaru = document.getElementById('ram_baru');
                        ramBaru.setAttribute('visible', 'true');
                        ramBaru.setAttribute('position', '0 1.5 1.5');
                        ramBaru.setAttribute('rotation', '30 0 0'); // mulai dari posisi miring
                        
                        // Animasi masuk
                        animateEl('ram_baru', 'position', {x: 0, y: 0.35, z: -0.5}, 600);
                        setTimeout(() => {
                            animateEl('ram_baru', 'rotation', {x: 0, y: 0, z: 0}, 300); // ditekan ke bawah
                        }, 600);
                    }
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
                        window.is2DModeLocal = true;
                        
                        // Pindahkan ke kamera agar mengikuti layar
                        camera.object3D.add(modelContainer.object3D); 
                        modelContainer.object3D.visible = true;
                        // Isometric Showcase (Lego-style)
                        modelContainer.setAttribute('position', '0 0 -20');
                        modelContainer.setAttribute('scale', '0.05 0.05 0.05'); // Ukuran proporsional persis AR
                        modelContainer.setAttribute('rotation', '15 -30 0');
                        
                        // Aktifkan Turntable dan Tampilkan Shadow
                        modelContainer.setAttribute('turntable', 'enabled: true; speed: 0.5');
                        document.getElementById('drop-shadow').setAttribute('opacity', '0.4');
                    } else {
                        // Mode AR
                        if (video) video.style.display = 'block';
                        window.is2DModeLocal = false;
                        
                        // Kembalikan ke marker target
                        target.object3D.add(modelContainer.object3D);
                        
                        modelContainer.setAttribute('position', '0 0 0');
                        modelContainer.setAttribute('scale', '0.05 0.05 0.05');
                        modelContainer.setAttribute('rotation', '0 0 0');
                        
                        // Matikan Turntable dan Sembunyikan Shadow
                        modelContainer.setAttribute('turntable', 'enabled: false');
                        document.getElementById('drop-shadow').setAttribute('opacity', '0');
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
                this.previousPan = null;

                const sceneEl = document.querySelector('a-scene');

                // Listener untuk Reset View
                window.addEventListener('resetView', () => {
                    if (window.is2DModeLocal) {
                        this.el.setAttribute('position', '0 0 -20');
                        this.el.setAttribute('scale', '0.05 0.05 0.05');
                        this.el.setAttribute('rotation', '15 -30 0');
                        this.el.setAttribute('turntable', 'enabled: true');
                        window.isUserTouching = false;
                    } else {
                        this.el.setAttribute('position', '0 0 0');
                        this.el.setAttribute('scale', '0.05 0.05 0.05');
                        this.el.setAttribute('rotation', '0 0 0');
                    }
                });

                sceneEl.addEventListener('touchstart', (e) => {
                    e.preventDefault(); 
                    window.isUserTouching = true; // Hentikan Turntable
                    if (e.touches.length === 2) {
                        // Setup Pinch & Twist & Pan
                        const dx = e.touches[0].pageX - e.touches[1].pageX;
                        const dy = e.touches[0].pageY - e.touches[1].pageY;
                        this.initialDistance = Math.hypot(dx, dy);
                        this.initialScale = this.el.object3D.scale.x;
                        this.initialAngle = Math.atan2(dy, dx);
                        this.initialZRot = this.el.getAttribute('rotation').z;
                        
                        this.previousPan = {
                            x: (e.touches[0].pageX + e.touches[1].pageX) / 2,
                            y: (e.touches[0].pageY + e.touches[1].pageY) / 2
                        };
                    } else if (e.touches.length === 1) {
                        // Setup Drag Rotate
                        this.previousTouch = { x: e.touches[0].pageX, y: e.touches[0].pageY };
                    }
                });

                sceneEl.addEventListener('touchmove', (e) => {
                    e.preventDefault(); // Cegah browser panning
                    if (e.touches.length === 2) {
                        // Pinch to Zoom
                        const dx = e.touches[0].pageX - e.touches[1].pageX;
                        const dy = e.touches[0].pageY - e.touches[1].pageY;
                        const currentDistance = Math.hypot(dx, dy);
                        
                        const scaleFactor = currentDistance / this.initialDistance;
                        const newScale = this.initialScale * scaleFactor;
                        
                        // Limit scale diperlebar: 0.005 sampai 2.0 agar AR bisa zoom out
                        const clampedScale = Math.max(0.005, Math.min(newScale, 2.0));
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
                        // Drag to Rotate X & Y (Kembali ke arah putaran awal yang terasa lebih pas)
                        const deltaX = e.touches[0].pageX - this.previousTouch.x;
                        const deltaY = e.touches[0].pageY - this.previousTouch.y;
                        
                        const rotation = this.el.getAttribute('rotation');
                        this.el.setAttribute('rotation', {
                            x: rotation.x + deltaY * 0.3, // revert to (+)
                            y: rotation.y + deltaX * 0.3, // revert to (+)
                            z: rotation.z
                        });
                        
                        this.previousTouch = { x: e.touches[0].pageX, y: e.touches[0].pageY };
                    }
                });
            }
        });
    }
}

// Komponen Turntable Otomatis
AFRAME.registerComponent('turntable', {
    schema: {
        enabled: {type: 'boolean', default: false},
        speed: {type: 'number', default: 0.5}
    },
    tick: function (time, timeDelta) {
        if (this.data.enabled && !window.isUserTouching) {
            const rot = this.el.getAttribute('rotation');
            this.el.setAttribute('rotation', {
                x: rot.x,
                y: rot.y + (this.data.speed * (timeDelta / 16)),
                z: rot.z
            });
        }
    }
});
