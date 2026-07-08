// Centralized Data Store for AR Models
export const modelDatabase = {
    'target0': {
        name: 'Proyek Pembelajaran Undip',
        badge: 'UNDIP',
        parts: {
            'Gearbox': {
                title: 'Gearbox Utama',
                function: 'Mentransmisikan daya mekanis',
                desc: 'Bagian utama dari mesin gearbox yang membungkus semua roda gigi. Berfungsi menjaga rasio putaran mesin.'
            },
            'part1': { // Fallback if no specific mesh is clicked
                title: 'Komponen Gearbox',
                function: 'Fungsi Gearbox',
                desc: 'Pilih bagian spesifik pada model untuk melihat fungsinya.'
            }
        }
    },
    'target1': {
        name: 'Transformator',
        badge: 'PLN Elektrik',
        parts: {
            'Bushing': {
                title: 'Bushing Trafo',
                function: 'Menghubungkan kumparan dengan jaringan luar',
                desc: 'Bushing berfungsi sebagai penyekat/isolator antara konduktor dengan tangki trafo.'
            },
            'Radiator': {
                title: 'Radiator',
                function: 'Mendinginkan minyak trafo',
                desc: 'Menyerap panas dari minyak di dalam tangki dan melepaskannya ke udara bebas agar trafo tidak overheat.'
            }
        }
    }
};
