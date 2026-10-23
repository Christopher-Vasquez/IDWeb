// data/cursos.js - Persistencia temporal en memoria
// Se exporta el arreglo para que el controlador lo modifique con push/splice
// (así todos los módulos comparten la misma referencia).
module.exports = [
    { id: 1, nombre: 'Introducción al Desarrollo Web', codigo: 'IDW-101', creditos: 4 },
    { id: 2, nombre: 'Estructuras Discreta I', codigo: 'ED-201', creditos: 3 },
    { id: 3, nombre: 'Cálculo I', codigo: 'CAL-301', creditos: 5 }
];