// Definición de la estructura de la malla, cada ramo con sus requisitos (por nombre)
const malla = [
  {
    nombre: "Primer año - 1° Cuatrimestre",
    ramos: [
      { nombre: "Inglés I", requisito: [], abre: ["Inglés II"] },
      { nombre: "Herramientas Informáticas I", requisito: [], abre: ["Herramientas Informáticas II"] },
      { nombre: "Programación Estructurada", requisito: [], abre: [] }
    ]
  },
  {
    nombre: "Primer año - 2° Cuatrimestre",
    ramos: [
      { nombre: "Inglés II", requisito: ["Inglés I"], abre: ["Inglés III"] },
      { nombre: "Herramientas Informáticas II", requisito: ["Herramientas Informáticas I"], abre: [] },
      { nombre: "Estructura de Datos", requisito: [], abre: [] },
      { nombre: "Laboratorio de Sistemas Operativos I", requisito: [], abre: ["Laboratorio de Sistemas Operativos II"] },
      { nombre: "Base de Datos I", requisito: [], abre: ["Base de Datos II"] }
    ]
  },
  {
    nombre: "Segundo año - 1° Cuatrimestre",
    ramos: [
      { nombre: "Inglés III", requisito: ["Inglés II"], abre: ["Inglés IV"] },
      { nombre: "Álgebra I", requisito: [], abre: ["Álgebra II"] },
      { nombre: "Programación Visual", requisito: [], abre: [] },
      { nombre: "Laboratorio de Sistemas Operativos II", requisito: ["Laboratorio de Sistemas Operativos I"], abre: [] },
      { nombre: "Base de Datos II", requisito: ["Base de Datos I"], abre: [] }
    ]
  },
  {
    nombre: "Segundo año - 2° Cuatrimestre",
    ramos: [
      { nombre: "Inglés IV", requisito: ["Inglés III"], abre: ["Inglés V"] },
      { nombre: "Álgebra II", requisito: ["Álgebra I"], abre: [] },
      { nombre: "Programación Concurrente y Paralela", requisito: [], abre: [] },
      { nombre: "Programación Orientada a Objetos", requisito: [], abre: ["Laboratorio de Programación Orientado a Objetos I"] },
      { nombre: "Análisis de Diseño de Sistemas I", requisito: [], abre: ["Análisis y Diseño de Sistemas II"] }
    ]
  },
  {
    nombre: "Tercer año - 1° Cuatrimestre",
    ramos: [
      { nombre: "Inglés V", requisito: ["Inglés IV"], abre: ["Inglés VI"] },
      { nombre: "Redes I", requisito: [], abre: ["Redes II"] },
      { nombre: "Programación y Servicios Web", requisito: [], abre: [] },
      { nombre: "Laboratorio de Programación Orientado a Objetos I", requisito: ["Programación Orientada a Objetos"], abre: ["Laboratorio de Programación Orientado a Objetos II"] },
      { nombre: "Análisis y Diseño de Sistemas II", requisito: ["Análisis de Diseño de Sistemas I"], abre: [] }
    ]
  },
  {
    nombre: "Tercer año - 2° Cuatrimestre",
    ramos: [
      { nombre: "Inglés VI", requisito: ["Inglés V"], abre: [] },
      { nombre: "Redes II", requisito: ["Redes I"], abre: [] },
      { nombre: "Laboratorio de Programación Orientado a Objetos II", requisito: ["Laboratorio de Programación Orientado a Objetos I"], abre: [] },
      { nombre: "Herramientas Informáticas Avanzadas", requisito: [], abre: [] },
      { nombre: "Legislación y Ejercico Profesional", requisito: [], abre: [] }
    ]
  }
];

// Mapeo auxiliar para acceder rápido por nombre
const nombreToRamo = {};
let estado = {}; // nombre -> 'bloqueado', 'desbloqueado', 'aprobado'

// Inicializa el estado de la malla: desbloqueados los sin requisitos, bloqueados el resto
function inicializarEstado() {
  estado = {};
  malla.forEach(cuatri => {
    cuatri.ramos.forEach(ramo => {
      nombreToRamo[ramo.nombre] = ramo;
      estado[ramo.nombre] = ramo.requisito.length === 0 ? 'desbloqueado' : 'bloqueado';
    });
  });
}

// Actualiza el DOM de la malla
function renderMalla() {
  const mallaDiv = document.getElementById('malla');
  mallaDiv.innerHTML = '';
  malla.forEach((cuatri, idx) => {
    const cuatriDiv = document.createElement('div');
    cuatriDiv.className = 'cuatrimestre';
    cuatriDiv.innerHTML = `<h2>${cuatri.nombre}</h2>`;
    cuatri.ramos.forEach(ramo => {
      const btn = document.createElement('button');
      btn.className = `ramo ${estado[ramo.nombre]}`;
      btn.textContent = ramo.nombre;
      btn.tabIndex = estado[ramo.nombre] === 'bloqueado' ? -1 : 0;
      btn.disabled = estado[ramo.nombre] === 'bloqueado';
      btn.addEventListener('click', () => toggleRamo(ramo.nombre));
      cuatriDiv.appendChild(btn);
    });
    mallaDiv.appendChild(cuatriDiv);
  });
}

// Lógica para aprobar/desaprobar un ramo y desbloquear los que correspondan
function toggleRamo(nombre) {
  if (estado[nombre] === 'bloqueado') return;
  if (estado[nombre] === 'aprobado') {
    estado[nombre] = 'desbloqueado';
    // Si se desaprueba, bloquea los que dependan de este, recursivamente
    bloquearDependientes(nombre);
  } else {
    estado[nombre] = 'aprobado';
    // Al aprobar, desbloquea los que tengan este como requisito y todos sus requisitos aprobados
    desbloquearDependientes(nombre);
  }
  renderMalla();
}

function bloquearDependientes(nombre) {
  for (const cuatri of malla) {
    for (const ramo of cuatri.ramos) {
      if (ramo.requisito.includes(nombre) && estado[ramo.nombre] !== 'bloqueado') {
        estado[ramo.nombre] = 'bloqueado';
        bloquearDependientes(ramo.nombre);
      }
    }
  }
}

function desbloquearDependientes(nombre) {
  for (const cuatri of malla) {
    for (const ramo of cuatri.ramos) {
      if (ramo.requisito.includes(nombre) && estado[ramo.nombre] === 'bloqueado') {
        // Solo si todos los requisitos están aprobados
        const requisitosOk = ramo.requisito.every(req => estado[req] === 'aprobado');
        if (requisitosOk) {
          estado[ramo.nombre] = 'desbloqueado';
          // Si se aprueba automáticamente porque todos los requisitos ya fueron aprobados
        }
      }
    }
  }
}

// Inicializa y renderiza
inicializarEstado();
renderMalla();
