// Diferencia de puntos (×10) penalizada por cajas con 3 lados (el oponente puede capturarlas).
function heuristica(estado, jugador) {
    var oponente = jugador === AZUL ? ROJO : AZUL;
    var diff = (estado.puntos[jugador] - estado.puntos[oponente]) * 10;
    var n = estado.tamano;
    var cajasRiesgo = 0;
    for (var f = 0; f < n; f++) {
        for (var c = 0; c < n; c++) {
            if (estado.cajas[f][c] === null && contarLados(estado, f, c) === 3) {
                cajasRiesgo++;
            }
        }
    }
    return diff - cajasRiesgo * 2;
}

// Explora el árbol de movimientos hasta profundidad niveles
// El maximizador elige el mayor valor el minimizador el menor
function minmax(estado, profundidad, esMaximizador, jugador, α, β) {
    // Caso base
    if (estado.terminado === true || profundidad === 0) return heuristica(estado, jugador);

    var movValidos = obtenerMovimientos(estado);

    if (esMaximizador) {
        var max = -Infinity;
        for (var i = 0; i < movValidos.length; i++) {
            var nuevoEstado = aplicarMovimiento(estado, movValidos[i]);
            var valor = minmax(nuevoEstado, profundidad - 1, nuevoEstado.turno === jugador, jugador, α, β);
            if (valor > max) max = valor;
            if (valor > α) α = valor;
            if (valor >= β) break;
        }
        return max;
    } else {
        var min = Infinity;
        for (var i = 0; i < movValidos.length; i++) {
            var nuevoEstado = aplicarMovimiento(estado, movValidos[i]);
            var valor = minmax(nuevoEstado, profundidad - 1, nuevoEstado.turno === jugador, jugador, α, β);
            if (valor < min) min = valor;
            if (valor < β) β = valor; 
            if (valor <= α) break;
        }
        return min;
    }
}

var PROFUNDIDAD_POR_TAMANO = { 2: 14, 3: 8, 4: 6 };

// Punto de entrada: evalúa todos los movimientos posibles y retorna el mejor para la IA
function mejorMovimiento(estado, jugador) {
    var movValidos = obtenerMovimientos(estado);
    if (movValidos.length === 0) return null;

    var profundidad = PROFUNDIDAD_POR_TAMANO[estado.tamano];
    var mejorValor = -Infinity;
    var mejorMov = null;

    for (var i = 0; i < movValidos.length; i++) {
        var nuevoEstado = aplicarMovimiento(estado, movValidos[i]);
        var valor = minmax(nuevoEstado, profundidad, nuevoEstado.turno === jugador, jugador, -Infinity, Infinity);
        if (valor > mejorValor) {
            mejorValor = valor;
            mejorMov = movValidos[i];
        }
    }

    return mejorMov;
}
