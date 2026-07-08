// Centralized Data Store for AR Models
export const modelDatabase = {
    'target0': {
        name: 'Proyek Pembelajaran Undip',
        badge: 'UNDIP',
        parts: {
            'ban': {
                title: 'Ban & Suspensi',
                function: 'Peredam kejut dan pergerakan',
                desc: 'Komponen ban khusus off-road yang dirancang untuk meredam guncangan ekstrem. Dilengkapi dengan suspensi independen.'
            },
            'mesin': {
                title: 'Blok Mesin',
                function: 'Penghasil tenaga gerak utama',
                desc: 'Mesin pembakaran internal atau motor listrik yang memberikan tenaga dorong ke gardan belakang mobil Buggy.'
            },
            'casis': {
                title: 'Casis & Rangka',
                function: 'Struktur Pelindung',
                desc: 'Struktur tubular baja (roll cage) yang sangat kuat, dirancang untuk melindungi pengemudi dan menopang seluruh komponen.'
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
