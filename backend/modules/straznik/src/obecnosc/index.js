'use strict';

// Strażnik GPS — fasada obecności. Dwaj producenci meldunku, każdy z własnym
// wejściem i własną regułą:
//
//   `wykryjZmianeStanu` (2.2, 2.7) — orzeka z pozycji, nie zna czasu.
//   `wykryjSkutekCiszy` (2.8, 2.9) — orzeka z upływu, nie zna pozycji.
//
// Rozdział jest treścią kanonu, nie wygodą układu plików: wyjście poza granicę
// ma werdykt, cisza werdyktu nie ma (Ziarno v12 punkt 1.11).
//
// Niezbudowane: opaska (2.10) i podpis kształtu (2.6).

const { wykryjZmianeStanu } = require('./granica');
const { wykryjSkutekCiszy } = require('./cisza');

module.exports = { wykryjZmianeStanu, wykryjSkutekCiszy };
