// Data for the 3D model parts
// GANTI DATA INI dengan nama bagian/mesh dari 3D model Anda yang sebenarnya.
// Kunci (seperti 'kepala', 'badan') harus cocok dengan nama mesh di dalam file .glb Anda.
const modelPartsData = {
    'part1': {
        title: 'Komponen Utama',
        function: 'Fungsi: Mengatur jalannya proses',
        desc: 'Ini adalah deskripsi singkat untuk komponen utama. Komponen ini sangat vital dalam operasional sistem.'
    },
    'part2': {
        title: 'Komponen Pendukung',
        function: 'Fungsi: Menjaga stabilitas',
        desc: 'Komponen pendukung memastikan bahwa beban didistribusikan dengan merata dan aman.'
    },
    'part3': {
        title: 'Konektor',
        function: 'Fungsi: Menyalurkan energi',
        desc: 'Bagian konektor yang menghubungkan satu modul dengan modul lainnya secara efisien.'
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const glassPanel = document.getElementById('info-panel');
    const infoTitle = document.getElementById('info-title');
    const infoFunction = document.getElementById('info-function');
    const infoDesc = document.getElementById('info-desc');
    const scanIndicator = document.getElementById('scan-indicator');
    const buttons = document.querySelectorAll('.part-btn');

    // Hide scan indicator when target is found
    const target = document.querySelector('#target-image');
    if(target) {
        target.addEventListener("targetFound", event => {
            scanIndicator.classList.add('hidden');
        });
        target.addEventListener("targetLost", event => {
            scanIndicator.classList.remove('hidden');
            hideInfo(); // Hide info when target is lost
        });
    }

    // Function to show information in the UI panel
    function showInfo(partId) {
        const data = modelPartsData[partId];
        if (data) {
            infoTitle.textContent = data.title;
            infoFunction.textContent = data.function;
            infoDesc.textContent = data.desc;
            
            glassPanel.classList.add('visible');

            // Update button active state
            buttons.forEach(btn => {
                if(btn.dataset.part === partId) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
    }

    function hideInfo() {
        glassPanel.classList.remove('visible');
        buttons.forEach(btn => btn.classList.remove('active'));
    }

    // Handle UI button clicks
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const partId = e.target.dataset.part;
            
            // TODO: Here you can also trigger an animation or highlight the 3D part
            // by manipulating the A-Frame entity (e.g., changing color or scale)
            
            showInfo(partId);
        });
    });

    // Custom A-Frame component to handle 3D model clicks
    AFRAME.registerComponent('clickable-model', {
        init: function () {
            this.el.addEventListener('click', (evt) => {
                if (!evt.detail.intersection) return;

                // 1. Coba ambil nama mesh dari 3D model (GLTF/GLB)
                let partName = evt.detail.intersection.object.name;
                
                // 2. Jika tidak ada, coba ambil dari ID atau data-part elemen HTML (berguna untuk testing primitives)
                if (!partName || !modelPartsData[partName]) {
                    const el = evt.detail.intersection.object.el;
                    if (el) {
                        partName = el.getAttribute('id') || el.getAttribute('data-part');
                    }
                }

                console.log("Bagian yang diklik:", partName);

                // Tampilkan info jika bagian yang diklik ada di database kita
                if (partName && modelPartsData[partName]) {
                    showInfo(partName);
                } else {
                    // Fallback jika tidak terdeteksi spesifik (misalnya ngeklik keseluruhan model)
                    console.log("Bagian tidak dikenali di database");
                }
            });
        }
    });
});
