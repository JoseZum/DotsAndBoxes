// benchmark.js
// Pruebas del algoritmo MinMax sobre Dots & Boxes

function movAleatorio(estado) {
    var movs = obtenerMovimientos(estado);
    if (!movs.length) return null;
    return movs[Math.floor(Math.random() * movs.length)];
}

// IA juega siempre como ROJO (segundo jugador); AZUL juega aleatorio.
function simularPartida(tamano) {
    var estado = crearEstado(tamano);
    var tiemposIA = [];

    while (!estado.terminado) {
        var mov;
        if (estado.turno === ROJO) {
            var t0 = performance.now();
            mov = mejorMovimiento(estado, ROJO);
            tiemposIA.push(performance.now() - t0);
        } else {
            mov = movAleatorio(estado);
        }
        if (!mov) break;
        estado = aplicarMovimiento(estado, mov);
    }

    return {
        ganador: estado.ganador,
        tiempoMedioIA: tiemposIA.length
            ? tiemposIA.reduce(function(a, b) { return a + b; }, 0) / tiemposIA.length
            : 0
    };
}

function ejecutarBM(nombre, tamano, nPartidas) {
    var victorias = 0, empates = 0, tiempos = [];
    for (var i = 0; i < nPartidas; i++) {
        var r = simularPartida(tamano);
        if (r.ganador === ROJO)          victorias++;
        else if (r.ganador === 'empate') empates++;
        tiempos.push(r.tiempoMedioIA);
    }
    var avgTiempo = tiempos.reduce(function(a, b) { return a + b; }, 0) / tiempos.length;
    return {
        nombre:        nombre,
        tamano:        tamano,
        nPartidas:     nPartidas,
        victorias:     victorias,
        empates:       empates,
        derrotas:      nPartidas - victorias - empates,
        tasaVictoria:  (victorias / nPartidas * 100).toFixed(0),
        tiempoMedioMs: avgTiempo.toFixed(1)
    };
}

function mostrarPanelBM(resultados) {
    var modal = document.getElementById('bm-modal');
    var filas = resultados.map(function(r) {
        return '<tr>' +
            '<td>' + r.nombre + '</td>' +
            '<td>' + r.nPartidas + '</td>' +
            '<td class="bm-win">' + r.victorias + '</td>' +
            '<td>' + r.empates + '</td>' +
            '<td class="bm-loss">' + r.derrotas + '</td>' +
            '<td><strong>' + r.tasaVictoria + '%</strong></td>' +
            '<td>' + r.tiempoMedioMs + ' ms</td>' +
            '</tr>';
    }).join('');

    modal.innerHTML =
        '<div class="bm-box">' +
        '<h2 class="bm-title">Benchmark MinMax — Dots &amp; Boxes</h2>' +
        '<p class="bm-sub">IA (Rojo, α‑β) vs Oponente aleatorio (Azul)</p>' +
        '<table class="bm-table"><thead><tr>' +
        '<th>Tablero</th><th>Partidas</th><th>Victorias IA</th>' +
        '<th>Empates</th><th>Derrotas</th><th>Tasa</th><th>t/mov IA</th>' +
        '</tr></thead><tbody>' + filas + '</tbody></table>' +
        '<p class="bm-note">' +
        'Heurística: diff × 10 − riesgo &nbsp;|&nbsp; Profundidades: 2×2→14 · 3×3→8 · 4×4→6' +
        '</p>' +
        '<div class="bm-actions">' +
        '<button class="bm-btn bm-btn-primary" ' +
        'onclick="document.getElementById(\'bm-modal\').style.display=\'none\'">Cerrar</button>' +
        '</div></div>';
    modal.style.display = 'flex';
}

window.runBenchmarks = function() {
    var configs = [
        { nombre: '2×2', tamano: 2, n: 10 },
        { nombre: '3×3', tamano: 3, n:  5 },
        { nombre: '4×4', tamano: 4, n:  3 },
    ];

    var modal = document.getElementById('bm-modal');
    modal.style.display = 'flex';
    modal.innerHTML =
        '<div class="bm-box" style="text-align:center">' +
        '<h2 class="bm-title">Ejecutando benchmarks…</h2>' +
        '<p id="bm-status" class="bm-sub">Preparando…</p>' +
        '<div class="bm-progress-track"><div id="bm-bar" class="bm-progress-fill"></div></div>' +
        '</div>';

    var resultados = [], i = 0;

    function paso() {
        if (i >= configs.length) { mostrarPanelBM(resultados); return; }
        var cfg = configs[i];
        var statusEl = document.getElementById('bm-status');
        var barEl    = document.getElementById('bm-bar');
        if (statusEl) statusEl.textContent =
            'Probando "' + cfg.nombre + '" (' + (i + 1) + ' / ' + configs.length + ')…';
        if (barEl) barEl.style.width = ((i / configs.length) * 100) + '%';
        setTimeout(function() {
            resultados.push(ejecutarBM(cfg.nombre, cfg.tamano, cfg.n));
            i++;
            paso();
        }, 60);
    }
    paso();
};
