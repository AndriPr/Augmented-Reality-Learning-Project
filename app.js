// Database Multi-Target
// Mendukung banyak model 3D berdasarkan QR/Marker yang di-scan.
// 'target0', 'target1', dst disesuaikan dengan urutan gambar saat Anda mengompilasi file .mind

const multiTargetDatabase = {
    'target0': {
        modelName: 'Mesin Gearbox',
        parts: {
            'Gearbox': {
                title: 'Gearbox Utama',
                function: 'Mentransmisikan daya mekanis',
                desc: 'Bagian utama dari mesin gearbox yang membungkus semua roda gigi.'
            },
            'part1': { // Fallback jika pakai primitif
                title: 'Komponen Mesin A',
                function: 'Fungsi A',
                desc: 'Deskripsi A'
            }
        }
    },
    'target1': {
        modelName: 'Transformator PLN',
        parts: {
            'Bushing': {
                title: 'Bushing Trafo',
                function: 'Menghubungkan kumparan dengan jaringan luar',
                desc: 'Bushing berfungsi sebagai penyekat/isolator antara konduktor dengan tangki trafo.'
            },
            'Radiator': {
                title: 'Radiator',
                function: 'Mendinginkan minyak trafo',
                desc: 'Menyerap panas dari minyak di dalam tangki dan melepaskannya ke udara bebas.'
            }
        }
    }
};

let currentActiveTarget = null;

document.addEventListener("DOMContentLoaded", () => {
    const glassPanel = document.getElementById('info-panel');
    const infoTitle = document.getElementById('info-title');
    const infoFunction = document.getElementById('info-function');
    const infoDesc = document.getElementById('info-desc');
    const scanIndicator = document.getElementById('scan-indicator');
    const appHeader = document.getElementById('app-header');
    
    // Fitur Download Marker UI
    const markerMenuBtn = document.getElementById('marker-menu-btn');
    const markerModal = document.getElementById('marker-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    markerMenuBtn.addEventListener('click', () => {
        markerModal.classList.remove('hidden');
    });
    closeModalBtn.addEventListener('click', () => {
        markerModal.classList.add('hidden');
    });

    // Setup pendeteksi Multi-Target
    const targets = document.querySelectorAll('[mindar-image-target]');
    
    targets.forEach((targetEl) => {
        const targetId = targetEl.getAttribute('id'); // contoh: 'target0'
        
        targetEl.addEventListener("targetFound", event => {
            currentActiveTarget = targetId;
            scanIndicator.classList.add('hidden');
            
            // Update Header Title dengan nama model
            if(multiTargetDatabase[targetId]) {
                appHeader.textContent = "Melihat: " + multiTargetDatabase[targetId].modelName;
            }

            // (Opsional) Update tombol UI di bawah layar secara dinamis
            updateUIButtons(targetId);
        });

        targetEl.addEventListener("targetLost", event => {
            if (currentActiveTarget === targetId) {
                currentActiveTarget = null;
                scanIndicator.classList.remove('hidden');
                appHeader.textContent = "Modul Pembelajaran Interaktif AR";
                hideInfo();
            }
        });
    });

    function updateUIButtons(targetId) {
        const buttonContainer = document.getElementById('button-container');
        buttonContainer.innerHTML = ''; // Bersihkan tombol lama

        const db = multiTargetDatabase[targetId];
        if(!db) return;

        // Buat tombol baru sesuai parts yang ada di database model tersebut
        Object.keys(db.parts).forEach(partKey => {
            const btn = document.createElement('button');
            btn.className = 'part-btn';
            btn.dataset.part = partKey;
            btn.textContent = db.parts[partKey].title;
            
            btn.addEventListener('click', (e) => {
                showInfo(targetId, partKey);
            });

            buttonContainer.appendChild(btn);
        });
    }

    function showInfo(targetId, partKey) {
        const data = multiTargetDatabase[targetId]?.parts[partKey];
        if (data) {
            infoTitle.textContent = data.title;
            infoFunction.textContent = data.function;
            infoDesc.textContent = data.desc;
            glassPanel.classList.add('visible');

            // Update active button state
            document.querySelectorAll('.part-btn').forEach(btn => {
                if(btn.dataset.part === partKey) btn.classList.add('active');
                else btn.classList.remove('active');
            });
        }
    }

    function hideInfo() {
        glassPanel.classList.remove('visible');
        document.querySelectorAll('.part-btn').forEach(btn => btn.classList.remove('active'));
    }

    // A-Frame component untuk menangani klik model 3D (Otomatis mendeteksi target mana yang sedang aktif)
    AFRAME.registerComponent('clickable-model', {
        init: function () {
            this.el.addEventListener('click', (evt) => {
                if (!evt.detail.intersection || !currentActiveTarget) return;

                let partName = evt.detail.intersection.object.name;
                
                // Fallback untuk primitives A-Frame
                if (!partName || !multiTargetDatabase[currentActiveTarget].parts[partName]) {
                    const el = evt.detail.intersection.object.el;
                    if (el) {
                        partName = el.getAttribute('id') || el.getAttribute('data-part');
                    }
                }

                if (partName && multiTargetDatabase[currentActiveTarget].parts[partName]) {
                    showInfo(currentActiveTarget, partName);
                } else {
                    console.log("Bagian tidak dikenali:", partName);
                }
            });
        }
    });
});
