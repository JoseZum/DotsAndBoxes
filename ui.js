var RADIO_PUNTO = 9;
var ANCHO_LINEA = 9;
var CELDA = 80;
var MARGEN = 28;

var COLORES = {
  punto:     '#2d3436',
  vacio:     '#dfe6e9',
  resaltado: '#b2bec3',
  azul:      '#0984e3',
  rojo:      '#e17055',
  fondoAzul: 'rgba(9,132,227,.15)',
  fondoRojo: 'rgba(225,112,85,.15)',
  peligro:   'rgba(253,203,110,.18)',
  textoAzul: 'rgba(9,132,227,.55)',
  textoRojo: 'rgba(225,112,85,.55)',
};

var estadoJuego;
var tamano = 3;
var modo = 'pvp';
var jugadorIA = ROJO;
var bordeResaltado = null;
var canvas, ctx;

// ── Log de movimientos ────────────────────────────────────────────────────
var contadorMovimientos = 0;
var registroMovimientos = [];
var tiempoInicioPartida = 0;

(function inicializarBotonesTamano() {
  var fila = document.getElementById('size-row');
  [2,3,4].forEach(function(s) {
    var boton = document.createElement('button');
    boton.className = 'size-btn' + (s === 3 ? ' selected' : '');
    boton.textContent = s + '×' + s;
    boton.onclick = function() { seleccionarTamano(s); };
    fila.appendChild(boton);
  });
})();

function seleccionarTamano(s) {
  tamano = s;
  document.querySelectorAll('.size-btn').forEach(function(b) { b.classList.remove('selected'); });
  document.querySelectorAll('.size-btn')[s - 2].classList.add('selected');
  document.getElementById('hint-stats').textContent = (s * s) + ' cajas · ' + (2 * s * (s + 1)) + ' líneas';
}

function seleccionarModo(m) {
  modo = m;
  document.querySelectorAll('.mode-btn').forEach(function(b) { b.classList.remove('selected'); });
  document.querySelector('[data-mode="' + m + '"]').classList.add('selected');
  var opcionesIA = document.getElementById('ai-options');
  if (opcionesIA) opcionesIA.style.display = m === 'pve' ? '' : 'none';
}

function seleccionarColorHumano(color) {
  jugadorIA = (color === 'blue') ? ROJO : AZUL;
  document.querySelectorAll('.color-btn').forEach(function(b) { b.classList.remove('selected'); });
  document.querySelector('.color-' + color).classList.add('selected');
}

function iniciarJuego() {
  estadoJuego = crearEstado(tamano);
  contadorMovimientos = 0;
  registroMovimientos = [];
  tiempoInicioPartida = performance.now();
  actualizarPuntaje();
  document.getElementById('settings-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  document.getElementById('game-over-bar').classList.add('hidden');
  limpiarLog();
  actualizarContador();
  ocultarTiempoIA();
  inicializarCanvas();
  dibujar();
  if (modo === 'pve' && estadoJuego.turno === jugadorIA) programarIA();
}

function mostrarConfiguracion() {
  document.getElementById('settings-screen').classList.remove('hidden');
  document.getElementById('game-screen').classList.add('hidden');
}

function inicializarCanvas() {
  canvas = document.getElementById('board');
  ctx = canvas.getContext('2d');
  var tamanoPx = tamano * CELDA + MARGEN * 2;
  var dpr = window.devicePixelRatio || 1;
  canvas.width  = tamanoPx * dpr;
  canvas.height = tamanoPx * dpr;
  canvas.style.width  = tamanoPx + 'px';
  canvas.style.height = tamanoPx + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  canvas.onmousemove  = alMoverMouse;
  canvas.onmouseleave = function() { bordeResaltado = null; dibujar(); };
  canvas.onclick      = alHacerClick;
  canvas.ontouchmove  = function(e) { e.preventDefault(); alMoverMouse(tactiloAMouse(e)); };
  canvas.ontouchend   = function(e) { e.preventDefault(); alHacerClick(tactiloAMouse(e)); bordeResaltado = null; dibujar(); };
}

function tactiloAMouse(e) {
  var toque = e.changedTouches[0];
  return { clientX: toque.clientX, clientY: toque.clientY };
}

function posX(columna) { return MARGEN + columna * CELDA; }
function posY(fila)    { return MARGEN + fila * CELDA; }

function bordeEnPixel(px, py) {
  var n = estadoJuego.tamano;
  var mejor = null, mejorDistancia = 14;

  for (var f = 0; f <= n; f++) {
    for (var c = 0; c < n; c++) {
      var cx = (posX(c) + posX(c + 1)) / 2;
      var cy = posY(f);
      if (Math.abs(px - cx) < CELDA / 2 && Math.abs(py - cy) < mejorDistancia) {
        mejorDistancia = Math.abs(py - cy);
        mejor = { tipo: 'h', fila: f, columna: c };
      }
    }
  }

  for (var f = 0; f < n; f++) {
    for (var c = 0; c <= n; c++) {
      var cx = posX(c);
      var cy = (posY(f) + posY(f + 1)) / 2;
      if (Math.abs(py - cy) < CELDA / 2 && Math.abs(px - cx) < mejorDistancia) {
        mejorDistancia = Math.abs(px - cx);
        mejor = { tipo: 'v', fila: f, columna: c };
      }
    }
  }
  return mejor;
}

function alMoverMouse(e) {
  if (estadoJuego.terminado) return;
  if (modo === 'pve' && estadoJuego.turno === jugadorIA) return;
  var rect = canvas.getBoundingClientRect();
  var borde = bordeEnPixel(e.clientX - rect.left, e.clientY - rect.top);
  if (borde) {
    var ocupado = borde.tipo === 'h' ? estadoJuego.lineasH[borde.fila][borde.columna] : estadoJuego.lineasV[borde.fila][borde.columna];
    if (ocupado) borde = null;
  }
  if (!mismoBorde(bordeResaltado, borde)) { bordeResaltado = borde; dibujar(); }
}

function alHacerClick(e) {
  if (estadoJuego.terminado) return;
  if (modo === 'pve' && estadoJuego.turno === jugadorIA) return;
  var rect = canvas.getBoundingClientRect();
  var borde = bordeEnPixel(e.clientX - rect.left, e.clientY - rect.top);
  if (!borde) return;
  var ocupado = borde.tipo === 'h' ? estadoJuego.lineasH[borde.fila][borde.columna] : estadoJuego.lineasV[borde.fila][borde.columna];
  if (ocupado) return;
  realizarMovimiento(borde);
}

function mismoBorde(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.tipo === b.tipo && a.fila === b.fila && a.columna === b.columna;
}

function realizarMovimiento(movimiento) {
  var jugadorAntes = estadoJuego.turno;
  estadoJuego = aplicarMovimiento(estadoJuego, movimiento);
  contadorMovimientos++;
  agregarAlLog(movimiento, jugadorAntes);
  actualizarContador();
  bordeResaltado = null;
  actualizarPuntaje();
  dibujar();
  if (estadoJuego.terminado) { terminarJuego(); return; }
  if (modo === 'pve' && estadoJuego.turno === jugadorIA) programarIA();
}

function programarIA() {
  mostrarPensando(true);
  setTimeout(function() {
    var t0 = performance.now();
    var movimiento = mejorMovimiento(estadoJuego, jugadorIA);
    var t1 = performance.now();
    var ms = (t1 - t0).toFixed(1);
    mostrarPensando(false);
    mostrarTiempoIA(ms);
    console.log('[MinMax] Movimiento calculado en ' + ms + 'ms');
    if (movimiento) realizarMovimiento(movimiento);
  }, 350);
}

function terminarJuego() {
  var tiempoTotal = ((performance.now() - tiempoInicioPartida) / 1000).toFixed(1);
  document.getElementById('game-over-bar').classList.remove('hidden');
  var resumen = document.getElementById('log-resumen');
  if (resumen) {
    resumen.textContent = contadorMovimientos + ' movimientos · ' + tiempoTotal + 's';
    resumen.style.display = 'block';
  }
  console.log('[Partida] ' + contadorMovimientos + ' movimientos totales en ' + tiempoTotal + 's');
}

// ── Helpers de log y timing ───────────────────────────────────────────────

function agregarAlLog(mov, jugador) {
  var tipoLabel = mov.tipo === 'h' ? 'H' : 'V';
  var quienLabel = (modo === 'pve')
    ? (jugador === jugadorIA ? 'IA' : 'Tú')
    : (jugador === AZUL ? 'Azul' : 'Rojo');
  var entry = { n: contadorMovimientos, quien: quienLabel, tipo: tipoLabel, fila: mov.fila, col: mov.columna };
  registroMovimientos.push(entry);

  var logEl = document.getElementById('move-log');
  if (!logEl) return;
  var item = document.createElement('div');
  item.className = 'log-item log-' + (jugador === AZUL ? 'azul' : 'rojo');
  item.innerHTML =
    '<span class="log-num">#' + entry.n + '</span>' +
    '<span class="log-quien">' + entry.quien + '</span>' +
    '<span class="log-mov">' + tipoLabel + '(' + entry.fila + ',' + entry.col + ')</span>';
  logEl.appendChild(item);
  logEl.scrollTop = logEl.scrollHeight;
}

function limpiarLog() {
  var logEl = document.getElementById('move-log');
  if (logEl) logEl.innerHTML = '';
  var resumen = document.getElementById('log-resumen');
  if (resumen) resumen.style.display = 'none';
}

function actualizarContador() {
  var el = document.getElementById('move-counter-val');
  if (el) el.textContent = contadorMovimientos;
}

function mostrarTiempoIA(ms) {
  var badge = document.getElementById('ia-time-badge');
  if (badge) {
    badge.textContent = 'IA: ' + ms + ' ms';
    badge.classList.add('visible');
    clearTimeout(badge._timeout);
    badge._timeout = setTimeout(function() { badge.classList.remove('visible'); }, 3000);
  }
}

function ocultarTiempoIA() {
  var badge = document.getElementById('ia-time-badge');
  if (badge) badge.classList.remove('visible');
}

function actualizarPuntaje() {
  document.getElementById('score-blue').textContent = estadoJuego.puntos.azul;
  document.getElementById('score-red').textContent  = estadoJuego.puntos.rojo;

  if (modo === 'pve') {
    document.getElementById('name-blue').textContent = (jugadorIA === AZUL) ? 'IA' : 'Tú';
    document.getElementById('name-red').textContent  = (jugadorIA === ROJO) ? 'IA' : 'Tú';
  } else {
    document.getElementById('name-blue').textContent = 'Azul';
    document.getElementById('name-red').textContent  = 'Rojo';
  }

  document.getElementById('sc-blue').classList.toggle('active', estadoJuego.turno === AZUL && !estadoJuego.terminado);
  document.getElementById('sc-red').classList.toggle('active',  estadoJuego.turno === ROJO && !estadoJuego.terminado);

  var textoEstado = document.getElementById('status-text');
  if (estadoJuego.terminado) {
    if (estadoJuego.ganador === 'empate') {
      textoEstado.textContent = '¡Empate!';
      textoEstado.className = '';
    } else {
      var nombreGanador = (modo === 'pve')
        ? (estadoJuego.ganador === jugadorIA ? 'IA' : 'Tú')
        : (estadoJuego.ganador === AZUL ? 'Azul' : 'Rojo');
      textoEstado.textContent = '¡' + nombreGanador + ' gana!';
      textoEstado.className = estadoJuego.ganador === AZUL ? 'turn-azul' : 'turn-rojo';
    }
  } else {
    var nombreTurno = (modo === 'pve')
      ? (estadoJuego.turno === jugadorIA ? 'IA' : 'Tú')
      : (estadoJuego.turno === AZUL ? 'Azul' : 'Rojo');
    textoEstado.textContent = 'Turno de ' + nombreTurno;
    textoEstado.className = estadoJuego.turno === AZUL ? 'turn-azul' : 'turn-rojo';
  }
}

function mostrarPensando(activo) {
  document.getElementById('thinking').classList.toggle('hidden', !activo);
  document.getElementById('status-text').textContent = activo ? 'IA pensando…' : '';
}

function dibujar() {
  var n = estadoJuego.tamano;
  ctx.clearRect(0, 0, parseFloat(canvas.style.width), parseFloat(canvas.style.height));

  for (var f = 0; f < n; f++) {
    for (var c = 0; c < n; c++) {
      var dueno = estadoJuego.cajas[f][c];
      var x = posX(c), y = posY(f);
      if (dueno) {
        rectRedondeado(x + 2, y + 2, CELDA - 4, CELDA - 4, 6, dueno === AZUL ? COLORES.fondoAzul : COLORES.fondoRojo);
        ctx.fillStyle = dueno === AZUL ? COLORES.textoAzul : COLORES.textoRojo;
        ctx.font = '700 20px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(dueno === AZUL ? 'A' : 'R', x + CELDA / 2, y + CELDA / 2);
      } else if (contarLados(estadoJuego, f, c) === 3) {
        rectRedondeado(x + 2, y + 2, CELDA - 4, CELDA - 4, 6, COLORES.peligro);
      }
    }
  }

  for (var f = 0; f <= n; f++) {
    for (var c = 0; c < n; c++) {
      var dueno = estadoJuego.lineasH[f][c];
      var x1 = posX(c) + RADIO_PUNTO, y1 = posY(f);
      var longitud = CELDA - RADIO_PUNTO * 2;
      var color = dueno ? COLORES[dueno]
                : (bordeResaltado && bordeResaltado.tipo === 'h' && bordeResaltado.fila === f && bordeResaltado.columna === c)
                  ? COLORES.resaltado : COLORES.vacio;
      rectRedondeado(x1, y1 - ANCHO_LINEA / 2, longitud, ANCHO_LINEA, ANCHO_LINEA / 2, color);
    }
  }

  for (var f = 0; f < n; f++) {
    for (var c = 0; c <= n; c++) {
      var dueno = estadoJuego.lineasV[f][c];
      var x1 = posX(c), y1 = posY(f) + RADIO_PUNTO;
      var longitud = CELDA - RADIO_PUNTO * 2;
      var color = dueno ? COLORES[dueno]
                : (bordeResaltado && bordeResaltado.tipo === 'v' && bordeResaltado.fila === f && bordeResaltado.columna === c)
                  ? COLORES.resaltado : COLORES.vacio;
      rectRedondeado(x1 - ANCHO_LINEA / 2, y1, ANCHO_LINEA, longitud, ANCHO_LINEA / 2, color);
    }
  }

  for (var f = 0; f <= n; f++) {
    for (var c = 0; c <= n; c++) {
      ctx.beginPath();
      ctx.arc(posX(c), posY(f), RADIO_PUNTO, 0, Math.PI * 2);
      ctx.fillStyle = COLORES.punto;
      ctx.fill();
    }
  }
}

function rectRedondeado(x, y, ancho, alto, radio, relleno) {
  ctx.beginPath();
  ctx.moveTo(x + radio, y);
  ctx.lineTo(x + ancho - radio, y);
  ctx.quadraticCurveTo(x + ancho, y, x + ancho, y + radio);
  ctx.lineTo(x + ancho, y + alto - radio);
  ctx.quadraticCurveTo(x + ancho, y + alto, x + ancho - radio, y + alto);
  ctx.lineTo(x + radio, y + alto);
  ctx.quadraticCurveTo(x, y + alto, x, y + alto - radio);
  ctx.lineTo(x, y + radio);
  ctx.quadraticCurveTo(x, y, x + radio, y);
  ctx.closePath();
  ctx.fillStyle = relleno;
  ctx.fill();
}
