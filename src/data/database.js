// Centralized Data Store for AR Models
export const modelDatabase = {
    'target0': {
        name: 'Proyek Pembelajaran Undip',
        badge: 'UNDIP',
        parts: {
            'ban-depan': {
                title: 'Ban & Suspensi',
                function: 'Peredam kejut dan pergerakan',
                desc: 'Komponen ban khusus off-road yang dirancang untuk meredam guncangan ekstrem. Dilengkapi dengan suspensi independen.'
            },
            'mesin-belakang': {
                title: 'Blok Mesin',
                function: 'Penghasil tenaga gerak utama',
                desc: 'Mesin pembakaran internal atau motor listrik yang memberikan tenaga dorong ke gardan belakang mobil Buggy.'
            },
            'rangka-utama': {
                title: 'Rangka Pelindung (Roll Cage)',
                function: 'Melindungi pengemudi',
                desc: 'Struktur tubular baja yang sangat kuat, dirancang untuk melindungi pengemudi jika mobil terbalik (rollover).'
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
