var AZUL = 'azul';
var ROJO = 'rojo';

function crearEstado(tamano) {
  var filas = tamano + 1;
  var columnas = tamano + 1;
  return {
    tamano: tamano,
    lineasH: crearMatriz(filas, tamano, null),
    lineasV: crearMatriz(tamano, columnas, null),
    cajas: crearMatriz(tamano, tamano, null),
    puntos: { azul: 0, rojo: 0 },
    turno: AZUL,
    terminado: false,
    ganador: null
  };
}

function crearMatriz(filas, columnas, valor) {
  var matriz = [];
  for (var f = 0; f < filas; f++) {
    matriz[f] = [];
    for (var c = 0; c < columnas; c++) matriz[f][c] = valor;
  }
  return matriz;
}

function clonarEstado(estado) {
  return {
    tamano: estado.tamano,
    lineasH: estado.lineasH.map(function(f) { return f.slice(); }),
    lineasV: estado.lineasV.map(function(f) { return f.slice(); }),
    cajas: estado.cajas.map(function(f) { return f.slice(); }),
    puntos: { azul: estado.puntos.azul, rojo: estado.puntos.rojo },
    turno: estado.turno,
    terminado: estado.terminado,
    ganador: estado.ganador
  };
}

function obtenerMovimientos(estado) {
  var movimientos = [];
  var n = estado.tamano;
  for (var f = 0; f <= n; f++)
    for (var c = 0; c < n; c++)
      if (estado.lineasH[f][c] === null) movimientos.push({ tipo: 'h', fila: f, columna: c });
  for (var f = 0; f < n; f++)
    for (var c = 0; c <= n; c++)
      if (estado.lineasV[f][c] === null) movimientos.push({ tipo: 'v', fila: f, columna: c });
  return movimientos;
}

function aplicarMovimiento(estado, movimiento) {
  var nuevoEstado = clonarEstado(estado);
  var jugador = nuevoEstado.turno;
  if (movimiento.tipo === 'h') nuevoEstado.lineasH[movimiento.fila][movimiento.columna] = jugador;
  else                         nuevoEstado.lineasV[movimiento.fila][movimiento.columna] = jugador;

  var capturadas = verificarCapturas(nuevoEstado, movimiento, jugador);

  var totalCajas = nuevoEstado.puntos.azul + nuevoEstado.puntos.rojo;
  if (totalCajas === nuevoEstado.tamano * nuevoEstado.tamano) {
    nuevoEstado.terminado = true;
    nuevoEstado.ganador = nuevoEstado.puntos.azul > nuevoEstado.puntos.rojo ? AZUL
                        : nuevoEstado.puntos.rojo > nuevoEstado.puntos.azul ? ROJO
                        : 'empate';
  }

  if (capturadas === 0) nuevoEstado.turno = (jugador === AZUL) ? ROJO : AZUL;

  return nuevoEstado;
}

function verificarCapturas(estado, movimiento, jugador) {
  var capturas = 0;
  var n = estado.tamano;
  var candidatos = [];

  if (movimiento.tipo === 'h') {
    if (movimiento.fila > 0) candidatos.push([movimiento.fila - 1, movimiento.columna]);
    if (movimiento.fila < n) candidatos.push([movimiento.fila, movimiento.columna]);
  } else {
    if (movimiento.columna > 0) candidatos.push([movimiento.fila, movimiento.columna - 1]);
    if (movimiento.columna < n) candidatos.push([movimiento.fila, movimiento.columna]);
  }

  for (var i = 0; i < candidatos.length; i++) {
    var filaCaja = candidatos[i][0], columnaCaja = candidatos[i][1];
    if (estado.cajas[filaCaja][columnaCaja] === null && cajaCompleta(estado, filaCaja, columnaCaja)) {
      estado.cajas[filaCaja][columnaCaja] = jugador;
      estado.puntos[jugador]++;
      capturas++;
    }
  }
  return capturas;
}

function cajaCompleta(estado, filaCaja, columnaCaja) {
  return estado.lineasH[filaCaja][columnaCaja] !== null &&
         estado.lineasH[filaCaja + 1][columnaCaja] !== null &&
         estado.lineasV[filaCaja][columnaCaja] !== null &&
         estado.lineasV[filaCaja][columnaCaja + 1] !== null;
}

function contarLados(estado, filaCaja, columnaCaja) {
  var lados = 0;
  if (estado.lineasH[filaCaja][columnaCaja] !== null) lados++;
  if (estado.lineasH[filaCaja + 1][columnaCaja] !== null) lados++;
  if (estado.lineasV[filaCaja][columnaCaja] !== null) lados++;
  if (estado.lineasV[filaCaja][columnaCaja + 1] !== null) lados++;
  return lados;
}
