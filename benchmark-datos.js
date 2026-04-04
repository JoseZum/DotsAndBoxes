// Resultados precalculados del benchmark MinMax
// 2×2: 8 partidas automáticas (profundidad 14)
// 3×3: 1 partida jugada manualmente (profundidad 8)  — 24 movimientos, 142.5s total
// 4×4: 1 partida jugada manualmente (profundidad 6)  — 40 movimientos, 531.9s total
var bmResultados = [
  {
    "nombre": "2×2",
    "tamano": 2,
    "nPartidas": 8,
    "victorias": 6,
    "empates": 0,
    "derrotas": 2,
    "tasaVictoria": 75,
    "tiempoMedioMs": 84.9,
    "nodosMedios": 0
  },
  {
    "nombre": "3×3",
    "tamano": 3,
    "nPartidas": 1,
    "victorias": 1,
    "empates": 0,
    "derrotas": 0,
    "tasaVictoria": 100,
    "tiempoMedioMs": 6385.7,
    "nodosMedios": 0
  },
  {
    "nombre": "4×4",
    "tamano": 4,
    "nPartidas": 1,
    "victorias": 1,
    "empates": 0,
    "derrotas": 0,
    "tasaVictoria": 100,
    "tiempoMedioMs": 15119.0,
    "nodosMedios": 0
  }
];
