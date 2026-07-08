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
                        
                        <!-- Model GLB Kompleks (Laptop PLN) -->
                        <a-entity 
                            id="gltf-main-model"
                            gltf-model="#model-complex" 
                            position="0 0 0" rotation="0 0 0" 
                            class="clickable" clickable-model>
                        </a-entity>
                        
                        <!-- Hologram Tools (Hidden initially) -->
                        <a-entity id="hologram-tools" position="0 0 0" visible="false">
                            <!-- Obeng (Screwdriver) -->
                            <a-entity id="kunci-pas" position="0 18 -9" scale="2 2 2" visible="false">
                                <!-- Gagang Obeng -->
                                <a-cylinder position="0 2 0" radius="0.3" height="2" color="#00A2E9" material="opacity:0.9; transparent:true"></a-cylinder>
                                <!-- Batang Besi Obeng -->
                                <a-cylinder position="0 0 0" radius="0.08" height="3" color="#dddddd" material="opacity:0.9; transparent:true"></a-cylinder>
                                <!-- Ujung Mata Obeng -->
                                <a-cone position="0 -1.6 0" radius-bottom="0.08" radius-top="0.02" height="0.4" color="#aaaaaa"></a-cone>
                            </a-entity>
                        </a-entity>
                        
                        <!-- Drop Shadow Fake untuk 2D Showcase -->
                        <a-circle id="drop-shadow" rotation="-90 0 0" position="0 -3 0" radius="18" color="#000000" opacity="0" material="shader: flat; transparent: true;"></a-circle>
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
        complexAsset.setAttribute('src', '/assets/models/LAPTOP_PLN.glb');
        
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
                    
                    let currentVals = el.getAttribute(prop);
                    let parsedVals = {x: 0, y: 0, z: 0};
                    
                    if (typeof currentVals === 'string') {
                        const parts = currentVals.trim().split(/\s+/);
                        parsedVals = {
                            x: parseFloat(parts[0]) || 0,
                            y: parseFloat(parts[1]) || 0,
                            z: parseFloat(parts[2]) || 0
                        };
                    } else if (currentVals && typeof currentVals === 'object') {
                        parsedVals = {
                            x: currentVals.x || 0,
                            y: currentVals.y || 0,
                            z: currentVals.z || 0
                        };
                    }
                    
                    anime({
                        targets: parsedVals,
                        x: to.x !== undefined ? to.x : parsedVals.x,
                        y: to.y !== undefined ? to.y : parsedVals.y,
                        z: to.z !== undefined ? to.z : parsedVals.z,
                        duration: duration,
                        easing: 'easeOutExpo',
                        update: function() {
                            // Convert back to string format to be absolutely safe for A-Frame
                            el.setAttribute(prop, `${parsedVals.x} ${parsedVals.y} ${parsedVals.z}`);
                        }
                    });
                };

                // Reset semua posisi laptop ke awal
                window.addEventListener('resetModelIsolation', () => {
                    const parentMesh = this.el.getObject3D('mesh');
                    if (parentMesh) {
                        parentMesh.traverse((node) => {
                            if (node.isMesh && node.userData.originalMaterial) {
                                // Restore solid appearance
                                node.material.transparent = false;
                                node.material.opacity = 1;
                                node.material.emissive = new THREE.Color(0x333333); 
                                node.material.needsUpdate = true;
                                
                                // Restore position
                                anime({
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
                });

                // Listener Mode Berubah
                window.addEventListener('changeMode', (e) => {
                    const mode = e.detail;
                    window.dispatchEvent(new Event('resetModelIsolation'));
                    
                    if (mode === 'spesifikasi') {
                        const parentMesh = this.el.getObject3D('mesh');
                        if (parentMesh) {
                            parentMesh.traverse((node) => {
                                if (node.isMesh) {
                                    if (!node.userData.originalMaterial) {
                                        node.userData.originalMaterial = node.material;
                                        node.material = node.material.clone();
                                    }
                                    if (!node.userData.originalPosition) {
                                        node.userData.originalPosition = node.position.clone();
                                    }
                                    
                                    const isMotherboard = node.name === 'Bagian Mesin Laptop';
                                    const isRAM = node.name === 'Cube';
                                    
                                    if (node.name === 'Tutup Mesin Laptop') {
                                        const targetPos = node.userData.originalPosition.clone();
                                        targetPos.y += 12; // Melayang perlahan ke atas
                                        targetPos.z -= 5;
                                        
                                        // Buat transparan dan glow PLN Blue
                                        node.material.transparent = true;
                                        node.material.opacity = 0.4;
                                        node.material.emissive = new THREE.Color(0x0055aa); 
                                        node.material.needsUpdate = true;
                                        
                                        anime({
                                            targets: node.position,
                                            x: targetPos.x,
                                            y: targetPos.y,
                                            z: targetPos.z,
                                            duration: 1500,
                                            easing: 'easeOutQuint' // Smooth, cinematic ease out
                                        });
                                    } else if (node.name === 'Bagian Monitor Laptop') {
                                        const targetPos = node.userData.originalPosition.clone();
                                        targetPos.z -= 10; // Layar mundur sedikit
                                        
                                        anime({
                                            targets: node.position,
                                            x: targetPos.x,
                                            y: targetPos.y,
                                            z: targetPos.z,
                                            duration: 1200,
                                            easing: 'easeOutCubic'
                                        });
                                    } else if (isMotherboard || isRAM) {
                                        // Pamerkan jeroan laptop dengan glow futuristik
                                        setTimeout(() => {
                                            anime({
                                                targets: node.material.emissive,
                                                r: 0.0,
                                                g: 0.8,
                                                b: 1.0, // Cyan/Blue glow
                                                duration: 1000,
                                                easing: 'easeInOutQuad'
                                            });
                                            node.material.needsUpdate = true;
                                        }, 800);
                                    }
                                }
                            });
                        }
                    } else if(mode === 'health') {
                        // Simulasi thermal (warna merah di sekitar mesin)
                        const parentMesh = this.el.getObject3D('mesh');
                        if (parentMesh) {
                            parentMesh.traverse((node) => {
                                if (node.isMesh) {
                                    if (!node.userData.originalMaterial) {
                                        node.userData.originalMaterial = node.material;
                                        node.material = node.material.clone();
                                    }
                                    const box = new THREE.Box3().setFromObject(node);
                                    const worldCenter = new THREE.Vector3();
                                    box.getCenter(worldCenter);
                                    const localCenter = parentMesh.worldToLocal(worldCenter.clone());
                                    
                                    // Jika area mesin (z < -8) jadikan kemerahan
                                    if (localCenter.z < -8) {
                                        node.material.emissive = new THREE.Color(0xaa0000);
                                        node.material.needsUpdate = true;
                                    }
                                }
                            });
                        }
                    }
                });

                // Listener untuk Langkah Maintenance Buggy
                window.addEventListener('maintenanceStep', (e) => {
                    const step = e.detail;
                    const parentMesh = this.el.getObject3D('mesh');
                    if (!parentMesh) return;
                    
                    const toolsContainer = document.getElementById('hologram-tools');
                    const kunciPas = document.getElementById('kunci-pas');
                    const tabungOli = document.getElementById('tabung-oli');
                    const tetesanOli = document.getElementById('tetesan-oli');
                    
                    if(toolsContainer) toolsContainer.setAttribute('visible', 'true');
                    
                    // --- ANIMASI HOLOGRAM TOOLS (Dieksekusi sekali, di LUAR traverse loop) ---
                    if (step === 0) {
                        if (kunciPas) kunciPas.setAttribute('visible', 'false');
                        if (tabungOli) tabungOli.setAttribute('visible', 'false');
                        if (tetesanOli) tetesanOli.setAttribute('visible', 'false');
                    }
                    else if (step === 1) {
                        if (kunciPas) {
                            kunciPas.setAttribute('visible', 'true');
                            kunciPas.setAttribute('position', '0 20 -9'); // Melayang sedikit di atas mesin
                            kunciPas.setAttribute('rotation', '0 0 0');
                            
                            // Turun nempel ke mesin (y=10)
                            animateEl('kunci-pas', 'position', {x: 0, y: 10, z: -9}, 600);
                            setTimeout(() => {
                                // Putar poros sumbu Z agar gagang mengayun layaknya membuka baut sesungguhnya
                                animateEl('kunci-pas', 'rotation', {x: 0, y: 0, z: 270}, 1000);
                            }, 600);
                        }
                        if (tabungOli) tabungOli.setAttribute('visible', 'false');
                        if (tetesanOli) tetesanOli.setAttribute('visible', 'false');
                    }
                    else if (step === 2) {
                        if (kunciPas) kunciPas.setAttribute('visible', 'false');
                        if (tabungOli) {
                            tabungOli.setAttribute('visible', 'true');
                            tabungOli.setAttribute('position', '5 22 -9'); // Muncul dari samping kanan atas
                            tabungOli.setAttribute('rotation', '0 0 0');
                            
                            // Mendekat ke atas mesin (tapi miring)
                            animateEl('tabung-oli', 'position', {x: 2, y: 15, z: -9}, 800);
                            setTimeout(() => {
                                // Miring seolah menuang ke arah kiri bawah
                                animateEl('tabung-oli', 'rotation', {x: 0, y: 0, z: 60}, 500);
                                
                                setTimeout(() => {
                                    if (tetesanOli) {
                                        tetesanOli.setAttribute('visible', 'true');
                                        tetesanOli.setAttribute('position', '0 15 -9'); // Jatuh dari bibir corong
                                        // Tetesan jatuh vertikal lurus ke mesin (y=8)
                                        animateEl('tetesan-oli', 'position', {x: 0, y: 8, z: -9}, 800);
                                        
                                        // Ulangi tetesan sekali lagi biar realistis
                                        setTimeout(() => {
                                            tetesanOli.setAttribute('position', '0 15 -9');
                                            animateEl('tetesan-oli', 'position', {x: 0, y: 8, z: -9}, 800);
                                        }, 900);
                                    }
                                }, 600);
                            }, 800);
                        }
                    }
                    else if (step === 3) {
                        if (kunciPas) kunciPas.setAttribute('visible', 'false');
                        if (tabungOli) tabungOli.setAttribute('visible', 'false');
                        if (tetesanOli) tetesanOli.setAttribute('visible', 'false');
                    }
                    // -------------------------------------------------------------

                    parentMesh.traverse((node) => {
                        if (node.isMesh) {
                            if (!node.userData.originalMaterial) {
                                node.userData.originalMaterial = node.material;
                                node.material = node.material.clone();
                            }
                            if (!node.userData.originalPosition) {
                                node.userData.originalPosition = node.position.clone();
                            }
                            
                            const isCasing = node.name === 'Tutup Mesin Laptop' || node.name === 'Bagian Monitor Laptop';
                            const isMotherboard = node.name === 'Bagian Mesin Laptop';
                            const isRAM = node.name === 'Cube';
                            
                            if (step === 0) {
                                node.material.transparent = false;
                                node.material.opacity = 1;
                                node.material.emissive = new THREE.Color(0x333333);
                                node.material.needsUpdate = true;
                                
                                if (node.name === 'Tutup Mesin Laptop') {
                                    const targetPos = node.userData.originalPosition.clone();
                                    targetPos.y += 10; // Angkat tutup casing ke atas
                                    targetPos.z -= 10; // Geser sedikit ke belakang
                                    
                                    node.material.transparent = true;
                                    node.material.opacity = 0.5; // Agak transparan agar dalam terlihat
                                    
                                    anime({
                                        targets: node.position,
                                        x: targetPos.x,
                                        y: targetPos.y,
                                        z: targetPos.z,
                                        duration: 800,
                                        easing: 'easeOutExpo'
                                    });
                                } else if (isRAM) {
                                    node.material.emissive = new THREE.Color(0x555555);
                                    node.material.needsUpdate = true;
                                    anime({
                                        targets: node.position,
                                        x: node.userData.originalPosition.x,
                                        y: node.userData.originalPosition.y,
                                        z: node.userData.originalPosition.z,
                                        duration: 800,
                                        easing: 'easeOutElastic(1, .8)'
                                    });
                                } else {
                                    anime({
                                        targets: node.position,
                                        x: node.userData.originalPosition.x,
                                        y: node.userData.originalPosition.y,
                                        z: node.userData.originalPosition.z,
                                        duration: 800,
                                        easing: 'easeOutElastic(1, .8)'
                                    });
                                }
                            } 
                            else if (step === 1) {
                                if (isMotherboard) {
                                    // Motherboard di-highlight setelah obeng muter
                                    setTimeout(() => {
                                        node.material.emissive = new THREE.Color(0xaaaa00);
                                        node.material.needsUpdate = true;
                                    }, 1000);
                                }
                                if (isRAM) {
                                    // Highlight RAM
                                    setTimeout(() => {
                                        node.material.emissive = new THREE.Color(0x0088ff);
                                        node.material.needsUpdate = true;
                                    }, 1000);
                                }
                            }
                            else if (step === 2) {
                                if (isRAM) {
                                    // Animasi modul RAM dicabut
                                    const targetPos = node.userData.originalPosition.clone();
                                    targetPos.y += 5; // Terangkat dari slotnya
                                    
                                    anime({
                                        targets: node.position,
                                        x: targetPos.x,
                                        y: targetPos.y,
                                        z: targetPos.z,
                                        duration: 800,
                                        easing: 'easeOutExpo'
                                    });
                                    
                                    // Indikator hijau sukses
                                    setTimeout(() => {
                                        node.material.emissive = new THREE.Color(0x00ff00);
                                        node.material.needsUpdate = true;
                                    }, 1400);
                                }
                            }
                            else if (step === 3) {
                                node.material.transparent = false;
                                node.material.opacity = 1;
                                node.material.emissive = new THREE.Color(0x333333);
                                node.material.needsUpdate = true;
                                
                                anime({
                                    targets: node.position,
                                    x: node.userData.originalPosition.x,
                                    y: node.userData.originalPosition.y,
                                    z: node.userData.originalPosition.z,
                                    duration: 800,
                                    easing: 'easeOutElastic(1, .8)'
                                });
                            }
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
