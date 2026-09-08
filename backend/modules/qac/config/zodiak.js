'use strict';

// Znaki zodiaku tropikalnego: 12 równych sektorów po 30°, start 0° Barana.
// Niezależny podział koła od 64 bram HD (config/bramki.js) — reguła znak+brama.
const LICZBA_ZNAKOW = 12;
const SZEROKOSC_ZNAKU_DEG = 360 / LICZBA_ZNAKOW; // 30°

const NAZWY_ZNAKOW = Object.freeze([
    'Baran', 'Byk', 'Bliźnięta', 'Rak', 'Lew', 'Panna',
    'Waga', 'Skorpion', 'Strzelec', 'Koziorożec', 'Wodnik', 'Ryby',
]);

module.exports = Object.freeze({ LICZBA_ZNAKOW, SZEROKOSC_ZNAKU_DEG, NAZWY_ZNAKOW });
