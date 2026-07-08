// Centralized Data Store for AR Models
export const modelDatabase = {
    'target0': {
        name: 'Modul Pembelajaran IT: Laptop',
        badge: 'UNDIP EDU',
        modes: {
            'spesifikasi': {
                title: 'Spesifikasi Detail',
                function: 'Overview Komponen Internal',
                desc: 'Laptop ini dilengkapi dengan prosesor Intel Core i7 Gen 12, RAM DDR4 16GB yang dapat di-upgrade, dan penyimpanan SSD NVMe 512GB untuk performa maksimal.'
            },
            'maintenance': {
                title: 'Maintenance (RAM)',
                function: 'Tutorial Upgrade RAM',
                desc: 'Ikuti panduan langkah demi langkah di bawah ini untuk mempelajari cara mengganti keping RAM dengan aman.',
                steps: [
                    {
                        title: 'Langkah 1: Buka Casing Bawah',
                        instruction: 'Pastikan laptop dalam keadaan mati. Lepaskan baut di bagian bawah, lalu angkat penutup bawah secara perlahan dari sudutnya.'
                    },
                    {
                        title: 'Langkah 2: Lepas RAM Lama',
                        instruction: 'Tarik perlahan dua tuas logam di sisi kiri dan kanan slot RAM ke arah luar hingga keping RAM terangkat 30 derajat, lalu cabut RAM lama.'
                    },
                    {
                        title: 'Langkah 3: Pasang RAM Baru',
                        instruction: 'Masukkan keping RAM baru dengan kemiringan 30 derajat ke dalam slot, lalu tekan perlahan ke bawah hingga kedua tuas logam berbunyi klik dan mengunci.'
                    }
                ]
            },
            'health': {
                title: 'Health Status',
                function: 'Analisis Kondisi Hardware',
                desc: 'Kesehatan baterai berada di angka 89% (Good). Temperatur rata-rata prosesor 45°C (Idle) dan 75°C (Load). Kipas pendingin berfungsi normal.'
            },
            'ux': {
                title: 'User Experience',
                function: 'Ergonomi & Penggunaan',
                desc: 'Keyboard dilengkapi dengan fitur tactile-feedback yang nyaman untuk mengetik lama. Desain engsel 180 derajat memudahkan kolaborasi.'
            }
        }
    }
};
