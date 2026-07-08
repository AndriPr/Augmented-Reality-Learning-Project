// Centralized Data Store for AR Models
export const modelDatabase = {
    'target0': {
        name: 'Laptop PLN',
        badge: 'PLN EDU',
        modes: {
            'spesifikasi': {
                title: 'Spesifikasi Inti',
                function: 'Laptop Standar Lapangan',
                desc: 'Laptop tangguh untuk petugas PLN, dilengkapi baterai tahan lama dan RAM modular untuk mendukung sistem pemetaan jaringan kelistrikan secara realtime.'
            },
            'maintenance': {
                title: 'Maintenance',
                function: 'Penggantian Modul (RAM/Baterai)',
                desc: 'Ikuti panduan perbaikan berikut untuk melepas dan mengganti modul internal secara aman.',
                steps: [
                    {
                        title: 'Langkah 1: Persiapan & Inspeksi',
                        instruction: 'Pastikan laptop dalam keadaan mati. Mesin akan dipindai, dan Casing bawah siap untuk dibuka menjauh dari bodi utama.'
                    },
                    {
                        title: 'Langkah 2: Membuka Casing Utama',
                        instruction: 'Gunakan Kunci Obeng (hologram) untuk membuka sekrup. Bagian Casing dan Layar akan diisolasi agar modul mesin utama terlihat jelas.'
                    },
                    {
                        title: 'Langkah 3: Mengganti Modul',
                        instruction: 'Cabut modul lama (RAM/Baterai) berbentuk kotak dari soketnya. Pasang modul yang baru hingga lampu indikator mesin berwarna hijau (sukses).'
                    },
                    {
                        title: 'Langkah 4: Tutup Kembali',
                        instruction: 'Kembalikan Casing bawah ke posisi semula, kencangkan baut untuk memastikan laptop aman dari debu lapangan.'
                    }
                ]
            },
            'health': {
                title: 'Status Perangkat',
                function: 'Monitoring Suhu & Baterai',
                desc: 'Kondisi Baterai: 85% (Normal). Suhu Motherboard: 45°C. Semua komponen beroperasi dalam batas aman.'
            },
            'ux': {
                title: 'User Experience',
                function: 'Aksesibilitas Lapangan',
                desc: 'Desain kokoh, layar anti-silau (anti-glare) untuk di bawah sinar matahari, dan sasis yang mudah dibuka untuk penggantian komponen cepat.'
            }
        }
    }
};
