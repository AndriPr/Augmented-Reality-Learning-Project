// Centralized Data Store for AR Models
export const modelDatabase = {
    'target0': {
        name: 'Modul Pelatihan Mekanik: Mobil Buggy',
        badge: 'UNDIP EDU',
        modes: {
            'spesifikasi': {
                title: 'Spesifikasi Detail',
                function: 'Overview Rangka & Mesin',
                desc: 'Mobil Buggy ini dilengkapi dengan rangka tubular baja murni untuk proteksi maksimal, suspensi independen, dan mesin bertenaga tinggi untuk medan off-road ekstrem.'
            },
            'maintenance': {
                title: 'Maintenance Mesin',
                function: 'Ganti Oli & Filter',
                desc: 'Ikuti panduan mekanik langkah demi langkah di bawah ini untuk mempelajari prosedur penggantian pelumas mesin Buggy.',
                steps: [
                    {
                        title: 'Langkah 1: Buka Akses Mesin',
                        instruction: 'Posisikan dongkrak hidrolik. Rangka baja dan suspensi belakang akan dibuka menjauh agar blok mesin mudah dijangkau.'
                    },
                    {
                        title: 'Langkah 2: Buka Katup Oli',
                        instruction: 'Gunakan Kunci Pas (Wrench) ukuran 14mm untuk memutar baut pembuangan oli dan filter lama yang berada di atas blok mesin. Putar berlawanan arah jarum jam.'
                    },
                    {
                        title: 'Langkah 3: Tuang Oli Baru',
                        instruction: 'Setelah sisa oli lama terkuras, pasang kembali baut bawah. Lalu tuangkan pelumas (oli) sintetis baru perlahan-lahan ke dalam corong atas mesin.'
                    },
                    {
                        title: 'Langkah 4: Perakitan Selesai',
                        instruction: 'Pastikan seluruh baut tertutup rapat. Rangka tubular pelindung belakang dan suspensi dirakit kembali ke posisi semula secara otomatis.'
                    }
                ]
            },
            'health': {
                title: 'Health Status',
                function: 'Telemetri Kendaraan',
                desc: 'Tekanan ban berada di angka 18 PSI (Optimal untuk Off-road). Suhu mesin saat ini 85°C (Normal). Kondisi oli pada 80% (Baik).'
            },
            'ux': {
                title: 'User Experience',
                function: 'Performa Off-Road',
                desc: 'Bantingan suspensi sangat mulus saat melewati jalan berbatu. Kokpit pengemudi dioptimalkan dengan sudut pandang yang luas tanpa blind-spot besar.'
            }
        }
    }
};
