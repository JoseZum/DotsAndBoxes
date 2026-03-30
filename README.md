# Dots & Boxes — MinMax con Poda Alpha‑Beta

Juego de Dots and Boxes con tablero configurable de N×N, modos **1 jugador vs IA** y **2 jugadores**, programado en JavaScript vanilla + Canvas. Sin dependencias, sin servidor.

## Estructura del proyecto

```
MinMax/
├── index.html       # Pantalla de configuración y tablero de juego
├── styles.css       # Estilos (UI moderna, animaciones)
├── logicaJuego.js   # Motor del juego: estado, movimientos, capturas
├── minmax.js        # IA: algoritmo MinMax con poda Alpha‑Beta
└── ui.js            # Renderizado en Canvas + interacción mouse/touch
```

## Cómo correr el proyecto

No requiere instalación ni servidor. Solo abre el archivo `index.html` en cualquier navegador moderno:

### Opción 1 — Doble clic
1. Navega a la carpeta `MinMax/`
2. Haz doble clic en `index.html`

### Opción 2 — Desde la terminal
```bash
# Windows
start index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

### Opción 3 — Live Server (VS Code)
1. Instala la extensión **Live Server** en VS Code
2. Clic derecho sobre `index.html` → **Open with Live Server**

## Cómo jugar

1. Elige el **tamaño del tablero** (2×2 hasta 4x4)
2. Elige el **modo**: vs IA o 2 jugadores
3. En modo vs IA, elige tu color (Azul o Rojo)
4. Haz clic sobre las líneas entre puntos para trazar segmentos
5. Quien complete los 4 lados de una caja la captura y juega de nuevo
6. Gana quien capture más cajas al final

## Algoritmo

La IA utiliza **MinMax con poda Alpha‑Beta**. La profundidad de búsqueda se ajusta automáticamente según el tamaño del tablero para mantener tiempos de respuesta bajos:

| Tablero | Profundidad máxima |
|---------|-------------------|
| 2×2     | 14                |
| 3×3     | 8                 |
| 4×4     | 6                 ||

La función de evaluación considera la diferencia de puntos entre jugadores y penaliza dejar cajas con 3 lados expuestas al oponente.
