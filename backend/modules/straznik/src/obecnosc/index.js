'use strict';

// Strażnik GPS — fasada obecności (ADR-011 punkt 2.2).
// Dziś jedno przejście: przekroczenie granicy planszy. Bezpiecznik ciszy
// sprzętu i zsunięcie warunkowe dołączą tu jako osobni producenci meldunku.

const { wykryjZmianeStanu } = require('./stan');

module.exports = { wykryjZmianeStanu };
