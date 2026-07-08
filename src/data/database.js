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
                function: 'Tutorial Inspeksi Mesin',
                desc: 'Ikuti panduan mekanik langkah demi langkah di bawah ini untuk menginspeksi ruang mesin belakang mobil.',
                steps: [
                    {
                        title: 'Langkah 1: Buka Akses Mesin',
                        instruction: 'Posisikan dongkrak hidrolik. Kendurkan baut rangka pelindung belakang dan lepaskan suspensi ban belakang agar blok mesin terekspos.'
                    },
                    {
                        title: 'Langkah 2: Inspeksi Visual',
                        instruction: 'Periksa keausan pada blok mesin dan periksa kebocoran oli. Mesin akan disorot untuk memusatkan area inspeksi.'
                    },
                    {
                        title: 'Langkah 3: Perakitan Kembali',
                        instruction: 'Setelah inspeksi selesai, rangka tubular pelindung belakang dan suspensi dirakit kembali ke posisi semula. Kunci semua baut dengan kuat.'
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
