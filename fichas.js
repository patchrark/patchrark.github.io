/* =====================================================================
   TAPit · Banco de fichas (copiado de la hoja "TAPit · Banco de fichas")
   - Oraciones: 5 tapas (artículo, sujeto, verbo, artículo, objeto).
     Para cada palabra: la correcta y sus errores de número, género y
     absurdo (null = no existe ese error).
   - Historias: 6 viñetas. Las 1–5 van bajo las tapas y la 6 es la imagen
     grande del final. Cada viñeta 2–5 tiene una versión incorrecta.
     Imágenes: img/historias/S1_2.png (correcta) y S1_2_mal.png (incorrecta).
   ===================================================================== */
const FICHAS = {
  L1: {
    tipo: 'oracion', imagen: 'Una mamá cepillándose los dientes',
    palabras: [
      { palabra: 'LA', numero: 'LAS', genero: 'EL', absurdo: null },
      { palabra: 'MAMÁ', numero: 'MAMÁS', genero: 'PAPÁ', absurdo: 'JIRAFA' },
      { palabra: 'SE CEPILLA', numero: 'SE CEPILLAN', genero: null, absurdo: 'SE PEINA' },
      { palabra: 'LOS', numero: 'EL', genero: 'LAS', absurdo: null },
      { palabra: 'DIENTES', numero: 'DIENTE', genero: null, absurdo: 'ZAPATOS' }
    ]
  },
  L2: {
    tipo: 'oracion', imagen: 'Un bebé abrazando su peluche',
    palabras: [
      { palabra: 'EL', numero: 'LOS', genero: 'LA', absurdo: null },
      { palabra: 'BEBÉ', numero: 'BEBÉS', genero: null, absurdo: 'CONEJO' },
      { palabra: 'ABRAZA', numero: 'ABRAZAN', genero: null, absurdo: 'COME' },
      { palabra: 'EL', numero: 'LOS', genero: 'LA', absurdo: null },
      { palabra: 'PELUCHE', numero: 'PELUCHES', genero: null, absurdo: 'SOL' }
    ]
  },
  S1: {
    tipo: 'historia', titulo: "La plantita", imagenes: 'S1',
    vinetas: [
      { texto: "La niña planta una semilla.", mal: null },
      { texto: "La niña riega la maceta.", mal: "La niña juega con una pelota." },
      { texto: "Sale una plantita pequeña.", mal: "La tierra está seca." },
      { texto: "La planta crece con un botón.", mal: "La planta se seca." },
      { texto: "Se abre una flor roja.", mal: "Sale una zanahoria gigante." },
      { texto: "La niña abraza su flor feliz.", mal: null }
    ]
  },
  S2: {
    tipo: 'historia', titulo: "La leche derramada", imagenes: 'S2',
    vinetas: [
      { texto: "El niño se sirve leche.", mal: null },
      { texto: "Deja el vaso en el borde y acaricia a su perrito.", mal: "El niño se para en la silla." },
      { texto: "El vaso se cae y la leche se derrama.", mal: "El niño toma la leche tranquilo." },
      { texto: "El niño limpia la leche con un trapeador.", mal: "El niño le tira las galletas al perrito." },
      { texto: "Mamá le sirve otro vaso.", mal: "Mamá le da un helado al perrito." },
      { texto: "El niño toma su leche feliz.", mal: null }
    ]
  },
  S3: {
    tipo: 'historia', titulo: "El globo", imagenes: 'S3',
    vinetas: [
      { texto: "El niño recibe un globo rojo.", mal: null },
      { texto: "El niño suelta la cuerda para aplaudir.", mal: "La abuela le amarra el globo a la muñeca." },
      { texto: "El globo se va volando.", mal: "El globo se queda en su mano." },
      { texto: "El niño llora mirando el cielo.", mal: "El niño se ríe y baila." },
      { texto: "La abuela le amarra otro globo a la muñeca.", mal: "La abuela le da una escoba." },
      { texto: "El niño camina feliz con su globo.", mal: null }
    ]
  },
  S4: {
    tipo: 'historia', titulo: "Día de lluvia", imagenes: 'S4',
    vinetas: [
      { texto: "Aparecen nubes grises.", mal: null },
      { texto: "Empieza a llover.", mal: "Sale un sol muy fuerte." },
      { texto: "La niña se moja y tiene frío.", mal: "La niña toma un helado seca." },
      { texto: "Se pone botas y un impermeable.", mal: "Se pone un traje de baño." },
      { texto: "Salta en los charcos con sus botas.", mal: "Se mete a la cama con las botas." },
      { texto: "La niña sonríe bajo el arcoíris.", mal: null }
    ]
  },
};
FICHAS.L3 = FICHAS.S1;   // L3 = La plantita
FICHAS.L4 = FICHAS.S2;   // L4 = La leche derramada

// Fichas de cada familia (por código de familia)
const FAMILIAS = {
  FAM1: ['L1', 'L2', 'L3', 'L4'],   // Salvador (por ahora las mismas fichas que Leonardo)
  FAM2: ['L1', 'L2', 'L3', 'L4']    // Leonardo
};

function fichaTexto(key) {
  const f = FICHAS[key];
  if (!f) return key;
  if (f.tipo === 'historia') return 'Historia: ' + f.titulo;
  const t = f.palabras.map((p) => p.palabra).join(' ').toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/* Pictogramas de ARASAAC (número fijo) o búsqueda automática */
const PICTOS = { 'MAMÁ': 2458, 'PAPÁ': 31146 };
const PICTOS_BUSCAR = {
  'SE CEPILLA': 'cepillarse los dientes', 'SE CEPILLAN': 'cepillarse los dientes', 'SE PEINA': 'peinarse',
  'DIENTES': 'dientes', 'DIENTE': 'diente', 'MAMÁS': 'madres', 'BEBÉS': 'bebés', 'PELUCHES': 'peluche',
  'EL': 'el', 'LA': 'la', 'LOS': 'los', 'LAS': 'las'
};
