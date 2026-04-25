# Dashboard Premium Analítico de Churn (D3.js)

Un dashboard interactivo y de diseño estético ultra-premium creado íntegramente con datos puros, HTML5, Vanilla CSS y **D3.js (v7)**. Su enfoque abandona la mera demostración de datos brutos y se dedica de lleno al **Business Intelligence**, mostrando métricas procesadas para predecir, localizar y entender el abandono de los clientes en un banco.

## 🛠️ Tecnologías Empleadas
- **D3.js v7:** Para el procesamiento, escalado, dibujado y transición de las matemáticas vectoriales (SVG). 
- **HTML5:** Estructuración semántica con `foreignObject` para incrustar análisis dinámico de HTML dentro de los lienzos.
- **Vanilla CSS:** Utilización de variables nativas `--bg-dark`, pseudo-selectores y Glassmorphism para una interfaz futurista profunda. Sin frameworks.
- **ResizeObserver API:** Implementación de escucha asíncrona para dotar a las gráficas vectoriales de **Responsividad Extrema**, redimensionando y repintando en vivo.
- **Tipografías:** Inter (Legibilidad UI) y JetBrains Mono (Jerarquía de las cifras numéricas).

## 🚀 Cómo Ejecutar

Dado que D3.js carga un archivo `.csv` asíncrono desde el disco local mediante `d3.csv()`, el navegador bloquea la lectura directa vía *CORS* por seguridad. Debes levantar un servidor ligero.

1. Abre la terminal en el directorio raíz (`visualizacion-d3/`).
2. Ejecuta un servidor local:
   ```bash
   python -m http.server 8000
   ```
3. Entra a tu navegador en `http://localhost:8000/`.

---

## 📊 Arquitectura de Visualizaciones (Analíticas)

El proyecto cuenta con un sistema de filtrado interactivo por país (Glassmorphism UI) que recalcula en tiempo real las métricas y textos analíticos de las gráficas. Las visualizaciones aplican el cálculo directo de **Tasas Relativas de Churn** (porcentajes de abandono sobre la masa instalada):

### 1. Resumen Global (Donut Chart Animado)
- **Visualización:** Gráfico de Anillo (`d3.arc`) con animación radial. Acompañado de indicadores KPI apilados y leyenda aumentada en formato Scorecard.
- **Objetivo:** Informar sin distracciones la métrica ancla del dashboard: la tasa base general de todo el corporativo (20.4%).

### 2. Tasa de Churn por País (Dumbbell / Bar Chart Ordenado)
- **Visualización:** Barras sólidas ordenadas descendentemente por urgencia (Riesgo). Contienen etiquetas porcentuales adheridas y semaforizadas cromáticamente ($f43f5e para alto riesgo).
- **Objetivo:** Exponer disparidades regionales brutales que justificarían una falla estructural corporativa en mercados específicos como el Alemán.

### 3. Tasa por Edad (Histograma de Deserción con Área Focalizada)
- **Visualización:** Histograma interactivo, dibujado procesando edades con `d3.bin`. Trazado customizado del Eje X para revelar y destacar en rojo los tramos demográficos puntuales [40 a 55 años] de alta sensibilidad.
- **Objetivo:** Quebrar el mito de volumen de edad e inducir al lector a percibir la ventana geriátrica/adulta especifica a la que debe atacar la campaña de retención.

### 4. Perfil Financiero (Heatmap Semaforizado)
- **Visualización:** Mapa de calor (Heatmap) en matriz bidimensional de $3 \times 3$ cruzando categorizaciones matemáticas del Salario y Score Crediticio. Etiquetado tipográfico colosal y colorímetria térmica interactuante mediante Hover de alto resalte intercuartílico.
- **Objetivo:** Condensar 10,000 cruces de datos en tan solo nueve postales para desmitificar que "los pobres abandonan al banco" revelando que el factor destructor absoluto es puramente crediticio, sin importar su ingreso.

### 5. Tenencia Evolutiva (Time-Series Area con Marcadores Críticos)
- **Visualización:** Monolinea suavizada con spline (`d3.curveMonotoneX`) con lupa de corte en Eje Y, complementada por Puntos Scatter Interactivos. Cuenta con directrices guías (dasharray) proyectando el promedio general, además de anotaciones dinámicas de texto posicionadas paramétricamente frente a las curvas críticas.
- **Objetivo:** Entregar la radiografía del ciclo cronológico del producto. Señalar al estratega dónde hay ruptura temprana (Falla de Onboarding en T=0) y en qué tramo de la veteranía del cliente existe peligro de fatiga de producto competitiva (T=9).

### 6. Conclusión Estratégica (Accionabilidad Data-Driven)
- **Visualización:** Diseño de tarjetas (Cards) en CSS Grid que consolidan los hallazgos en campañas ejecutables.
- **Objetivo:** Transformar los datos de las gráficas anteriores en 3 propuestas de valor específicas: *Onboarding Seguro*, *Fidelización Senior* y *Alivio Financiero*.
