// Retorna puntos del jugador menos puntos del oponente, positivo = ventaja para jugador, negativo = desventaja
function heuristica(estado, jugador) {
    return estado.puntos[jugador] - estado.puntos[jugador === AZUL ? ROJO : AZUL];
}

// Explora el árbol de movimientos hasta profundidad niveles
// El maximizador elige el mayor valor el minimizador el menor 

function minmax(estado, profundidad, esMaximizador, jugador) {
    // Caso base
    if (estado.terminado === true || profundidad === 0) return heuristica(estado, jugador);

    var movValidos = obtenerMovimientos(estado);

    if (esMaximizador) {
        var max = -Infinity;
        for (var i = 0; i < movValidos.length; i++) {
            var nuevoEstado = aplicarMovimiento(estado, movValidos[i]);
            var valor = minmax(nuevoEstado, profundidad - 1, nuevoEstado.turno === jugador, jugador);
            if (valor > max) max = valor;
        }
        return max;
    } else {
        var min = Infinity;
        for (var i = 0; i < movValidos.length; i++) {
            var nuevoEstado = aplicarMovimiento(estado, movValidos[i]);
            var valor = minmax(nuevoEstado, profundidad - 1, nuevoEstado.turno === jugador, jugador);
            if (valor < min) min = valor;
        }
        return min;
    }
}

// Punto de entrada: evalúa todos los movimientos posibles y retorna el mejor para la IA
function mejorMovimiento(estado, jugador) {
    var movValidos = obtenerMovimientos(estado);
    if (movValidos.length === 0) return null;

    var mejorValor = -Infinity;
    var mejorMov = null;

    for (var i = 0; i < movValidos.length; i++) {
        var nuevoEstado = aplicarMovimiento(estado, movValidos[i]);
        var valor = minmax(nuevoEstado, 5, nuevoEstado.turno === jugador, jugador);
        if (valor > mejorValor) {
            mejorValor = valor;
            mejorMov = movValidos[i];
        }
    }

    return mejorMov;
}
