/* ============================================================
   CONFIGURAZIONE KARTLOG PRO - DATI AGGIORNATI
   ============================================================ */

   const CONFIG = {
    // Elenco circuiti con coordinate per API meteo e link ufficiali
    circuiti: [
        {
            nome: '7 Laghi (Castelletto di Branduzzo)',
            lat: 44.9754,
            lon: 9.1009,
            url: 'https://7laghikartitalia.it/',
        },
        {
            nome: 'Ala Karting Circuit (Ala di Trento)',
            lat: 45.7481,
            lon: 10.9234,
            url: 'https://www.alakarting.it/',
        },
        {
            nome: 'Circuito di Pomposa (Pomposa)',
            lat: 44.7127,
            lon: 12.216,
            url: 'http://www.circuitodipomposa.com/',
        },
        {
            nome: 'Cremona Circuit (San Martino del lago)',
            lat: 45.1633,
            lon: 10.3758,
            url: 'https://cremonacircuit.it/',
        },
        {
            nome: 'Franciacorta (Castrezzato)',
            lat: 45.5085,
            lon: 9.9472,
            url: 'https://www.franciacortakartingtrack.com/',
        },
        {
            nome: 'Happy Valley kart (Cervia)',
            lat: 44.23774,
            lon: 12.3558,
            url: 'http://www.happyvalleykart.com/',
        },
        {
            nome: 'Pista Winner (Nizza Monferrato)',
            lat: 44.7846,
            lon: 8.3745,
            url: 'http://www.pistawinner.it/',
        },
        {
            nome: 'South Garda (Lonato)',
            lat: 45.4384,
            lon: 10.4902,
            url: 'https://www.southgardakarting.it/',
        }
    ],

    // Team Piloti aggiornato
    piloti: [
        'MATTIA',
        'DANIEL',
        'FILIPPO',
        'BRANDO',
        'SAMUELE',
        'ANDREA',
        'ROBERTO'
    ],

    // Elenco sessioni esteso
    sessioni: [
        'PL1', 'PL2', 'PL3', 'PL4', 'PL5', 'PL6', 'PL7', 'PL8', 'PL9',
        'Qualifica',
        'S Race',
        'M Race'
    ],

    // Opzioni generali pista
    condizioni: ['ASCIUTTA', 'BAGNATA'],
    gommatura: ['BASSO', 'MEDIO', 'ALTO'],
    posizioni: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],

    // Parametri tecnici Setup
    setup: {
        camber: ['-3', '-2', '-1', '0', '+1', '+2', '+3'],
        caster: ['-3', '-2', '-1', '0', '+1', '+2', '+3'],
        convergenza: ['-4', '-3', '-2', '-1', '0', '+1', '+2', '+3', '+4'],
        altezze: ['BASSO', 'MEDIO', 'ALTO'],
        rapporti: [
            '18-64', '18-65', '18-66', '18-67', '18-68', '18-69', '18-70', '18-71', '18-72', '18-73', '18-74',
            '19-64', '19-65', '19-66', '19-67', '19-68', '19-69', '19-70', '19-71', '19-72', '19-73', '19-74'
        ]
    }
};