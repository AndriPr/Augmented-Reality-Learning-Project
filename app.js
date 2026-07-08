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
                // Determine which part of the 3D model was clicked
                // evt.detail.intersection.object.name gets the name of the mesh inside the GLTF/GLB
                const meshName = evt.detail.intersection ? evt.detail.intersection.object.name : null;
                
                console.log("Clicked mesh name:", meshName);

                if (meshName) {
                    // Match the mesh name with our data dictionary
                    // Note: You might need to adjust this depending on how your 3D model meshes are named
                    // For testing, we just simulate clicking 'part1' if any part is clicked
                    // REMOVE the placeholder logic below and use actual mesh names:
                    
                    /* REAL LOGIC:
                    if (modelPartsData[meshName]) {
                        showInfo(meshName);
                    }
                    */

                    // PLACEHOLDER LOGIC:
                    const randomPart = ['part1', 'part2', 'part3'][Math.floor(Math.random() * 3)];
                    showInfo(randomPart);
                }
            });
        }
    });
});
