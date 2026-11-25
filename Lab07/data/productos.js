// data/productos.js - Catálogo de artesanías (persistencia temporal en memoria)
// categoria: alfareria | ceramica | ebanisteria | hilados-tejidos | muebleria-rustica
// artesanoId: null en los productos de muestra; en los nuevos es el id del artesano que los publica
module.exports = [
    { id: 1, nombre: 'Olla de barro cocido', categoria: 'alfareria', precio: 45, artesanoId: null },
    { id: 2, nombre: 'Jarrón de cerámica esmaltada', categoria: 'ceramica', precio: 120, artesanoId: null },
    { id: 3, nombre: 'Cofre de cedro tallado', categoria: 'ebanisteria', precio: 150, artesanoId: null },
    { id: 4, nombre: 'Chompa de alpaca tejida a mano', categoria: 'hilados-tejidos', precio: 180, artesanoId: null },
    { id: 5, nombre: 'Banca de madera rústica', categoria: 'muebleria-rustica', precio: 260, artesanoId: null },
    { id: 6, nombre: 'Set de platos pintados a mano', categoria: 'ceramica', precio: 95, artesanoId: null }
];