/* =====================================================================
   TAPit · Banco de fichas
   Copiado de la hoja "TAPit · Banco de fichas".
   Cada ficha tiene: palabra fija al inicio, 3 palabras tapadas (tapa 1,
   2 y 3, de izquierda a derecha) y palabra fija al final.
   Para cada tapa: la palabra correcta y sus errores de número, género y
   absurdo (null = no existe ese error para esa palabra).
   ===================================================================== */
const FICHAS = {
  A: {
    inicio: 'LA', final: 'MANZANA',
    tapas: [
      { palabra: 'NIÑA', numero: 'NIÑAS', genero: 'NIÑO', absurdo: 'MESA' },
      { palabra: 'COME', numero: 'COMEN', genero: null, absurdo: 'JUEGA' },
      { palabra: 'UNA', numero: 'UNAS', genero: 'UN', absurdo: null }
    ]
  },
  B: {
    inicio: 'LA', final: 'PLATOS',
    tapas: [
      { palabra: 'CHICA', numero: 'CHICAS', genero: 'CHICO', absurdo: 'VACA' },
      { palabra: 'LAVA', numero: 'LAVAN', genero: null, absurdo: 'COLOREA' },
      { palabra: 'LOS', numero: 'EL', genero: 'LAS', absurdo: null }
    ]
  },
  C: {
    inicio: 'LA', final: 'LIBRO',
    tapas: [
      { palabra: 'MAMÁ', numero: 'MAMÁS', genero: 'PAPÁ', absurdo: 'PELOTA' },
      { palabra: 'LEE', numero: 'LEEN', genero: null, absurdo: 'COCINA' },
      { palabra: 'UN', numero: 'UNOS', genero: 'UNA', absurdo: null }
    ]
  },
  D: {
    inicio: 'LA', final: 'DIENTES',
    tapas: [
      { palabra: 'MAMÁ', numero: 'MAMÁS', genero: 'PAPÁ', absurdo: 'JIRAFA' },
      { palabra: 'SE CEPILLA', numero: 'SE CEPILLAN', genero: null, absurdo: 'SE PEINA' },
      { palabra: 'LOS', numero: 'EL', genero: 'LAS', absurdo: null }
    ]
  },
  E: {
    inicio: 'EL', final: 'PELUCHE',
    tapas: [
      { palabra: 'BEBÉ', numero: 'BEBÉS', genero: null, absurdo: 'CONEJO' },
      { palabra: 'ABRAZA', numero: 'ABRAZAN', genero: null, absurdo: 'COME' },
      { palabra: 'EL', numero: 'LOS', genero: 'LA', absurdo: null }
    ]
  },
  F: {
    inicio: 'LOS', final: 'NIEVE',
    tapas: [
      { palabra: 'PINGÜINOS', numero: 'PINGÜINO', genero: null, absurdo: 'ELEFANTES' },
      { palabra: 'CAMINAN', numero: 'CAMINA', genero: null, absurdo: 'VUELAN' },
      { palabra: 'SOBRE LA', numero: 'SOBRE LAS', genero: 'SOBRE EL', absurdo: null }
    ]
  }
};

/* ---------------------------------------------------------------------
   Pictogramas de ARASAAC
   - Si una palabra tiene número aquí, se usa ese pictograma.
   - Si no, la app lo busca sola en ARASAAC (con el texto de "buscar"
     si existe) y lo recuerda en el teléfono.
   - Para cambiar un pictograma: busca la palabra en arasaac.org, copia
     el número del pictograma y escríbelo aquí.
   --------------------------------------------------------------------- */
const PICTOS = {
  'NIÑA': 2484,
  'NIÑO': 2485,
  'COME': 2349,
  'COMEN': 5970,
  'MAMÁ': 2458,
  'PAPÁ': 31146,
  'LIBRO': 2450,
  'LEE': 7141,
  'LEEN': 39762,
  'LAVA': 8617,
  'PLATOS': 2532,
  'COCINA': 2342,
  'CHICAS': 6974
};

// Palabras que conviene buscar con otro texto
const PICTOS_BUSCAR = {
  'SE CEPILLA': 'cepillarse los dientes',
  'SE CEPILLAN': 'cepillarse los dientes',
  'SE PEINA': 'peinarse',
  'SOBRE LA': 'sobre',
  'SOBRE LAS': 'sobre',
  'SOBRE EL': 'sobre',
  'PINGÜINOS': 'pingüino',
  'ELEFANTES': 'elefante',
  'PLATOS': 'plato',
  'DIENTES': 'dientes',
  'MAMÁS': 'madres',
  'BEBÉS': 'bebés',
  'UN': 'un',
  'UNA': 'una',
  'UNOS': 'unos',
  'UNAS': 'unas',
  'EL': 'el',
  'LA': 'la',
  'LOS': 'los',
  'LAS': 'las'
};
