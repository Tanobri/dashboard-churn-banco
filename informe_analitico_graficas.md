# Informe de Diseño Analítico: Dashboard "ChurnViz"

Este documento presenta una autopsia técnica y estratégica sobre las resoluciones de diseño aplicadas al panel "ChurnViz". El proyecto evolucionó desde una naturaleza descriptiva básica (conteo bruto de datos aislados) a **una interfaz analítica hiper-contextualizada** orientada a propiciar decisiones en 3 segundos o menos.

El análisis de centra en **dos pilares fundamentales** para cada uno de los tableros desarrollados:
1. Las decisiones en la **Visualización de los Datos** (cómo codificamos la información matemática mediante gráficos, componentes visuales, legibilidad y colorimetría).
2. **Lo que se busca lograr Visualizar** (cuál es el objetivo de negocio intrínseco detrás del dibujo vectorial).

---

## 1. Resumen Global de Fidelidad (Dona Central)

### 📌 Sobre la Visualización de Datos
El gráfico fue diseñado como un anillo o dona de radio engrosado. En el núcleo geocéntrico no hay distractores, tan solo figura la cantidad de masa general operada. 
La codificación cromática sienta el estándar base a nivel mundial del *dashboard*: **Verde (#10b981)** para lo saludable (retención) y **Rojo Carmesí (#f43f5e)** para lo doloroso (abandono). 
El peso visual se delega al cuadrángulo del lado izquierdo mediante una leyenda gigante estilo KPI que empaqueta todo el dato explícito sin forzar al usuario a "pasar el ratón" (hover) para adivinar el dato fundamental.

### 🎯 Lo que se quiere Lograr Visualizar
Anclar la mente del visor. El objetivo es plantar la línea base o *General Baseline* (20.4%). Al leer la Tasa de Churn Global, el usuario fija esa crifra en el cerebelo y la usará iterativamente de aquí en adelante para compararla mentalmente cuando vea picos extraños o desviaciones atípicas en los siguientes gráficos. 

---

## 2. Segmentación Geográfica (Barras Direccionales)

### 📌 Sobre la Visualización de Datos
Dejando atrás los mapas coropléticos (altamente ineficientes para leer variabilidades finas), decantamos por un **Gráfico de Barras Discretas** pero completamente invertido en prioridad: en lugar de mostrar los millones de clientes por país, calculamos "De 100 clientes en este país, ¿Cuántos huyen?".
Se agregó inteligencia en tiempo de renderizado: las barras se ordenan automáticamente del peor mercado al mejor, y asumen dinámicamente un gradiente semafórico (Si la barra sobrepasa el promedio base, se pudre en rojo; de caso contrario, palidece en verde o neutro).

### 🎯 Lo que se quiere Lograr Visualizar
Identificar la **falla de fricción cultural o corporativa** en territorios de alto valor. Un CEO mirando esta gráfica entiende velozmente que en Alemania no necesita inyectar dinero en captar más clientes (los cuales perderá), sino en intervenir la infraestructura o los productos que hacen hostil su retención comparada a Francia o España.

---

## 3. Comportamiento Etario (Histograma Interconectado)

### 📌 Sobre la Visualización de Datos
Las edades de 10,000 personas representan un ruido estático infinito. D3.js (`d3.bin`) reagrupó paramétricamente a las personas en canastas *(bins)*. La gran victoria aquí fue evitar el sesgo ilusorio: el pico gigante de "cantidad de personas de 30 años" oculta que la proporción real de abandono está mucho más a la derecha. 
Recortamos e instruímos formalmente al lienzo a exaltar los números "40" y "55" en el eje X, mientras se sombrea intensamente dicha franja.

### 🎯 Lo que se quiere Lograr Visualizar
Resaltar que la retención no es lineal, es parabólica. El objetivo de negocio es vislumbrar de inmediato una **"Zona de Crisis de Jubilación/Nido Vacío"**. Evidenciamos que la gente joven permanece, la gente muy anciana disminuye, pero existe un agujero negro de abandono gigantesco en el mercado de la mediana edad (40-55).

---

## 4. Perfil Financiero (Heatmap 3x3)

### 📌 Sobre la Visualización de Datos
Las variables matemáticas de interpolación (Salario continuo vs Scoring continuo) ocasionaban el temido "Overscattering" (una masa redonda enmarañada de miles de puntos inleíbles). Al descartar nubes de puntos y hexbin maps complejos, pasamos a una cuadrícula hiper-agresiva cruzando dos variables categóricas (Nivel Score vs Nivel Salario). 
Textos arrolladores de `34px` informan netamente la propensión final inyectada centralmente sobre la parrilla.

### 🎯 Lo que se quiere Lograr Visualizar
Se buscaba que el lector contestase en el acto la siguiente incognita: *"¿La gente abandona nuestros servicios porque gana poco, o porque tiene mala reputación crediticia?"*
Las 9 cajas dictaminan contundentemente que **el Salario no tiene impacto**, pero todo el estrato de **"Score Crediticio Bajo"** huye vertiginosamente. Se visualiza un peligro rotundo en conceder apertura a clientes con historiales negativos.

---

## 5. Ciclo de Vida y Fidelización (Series de Tenencia Lineal)

### 📌 Sobre la Visualización de Datos
Un gráfico temporal de curvas matemáticas suavizadas (`curveMonotoneX`) sobre un rango Y de lupa (`min - max`). La implementación técnica destacada infunde vida directriz inyectando **Anotaciones Semánticas Flotantes D3** sobre puntos álgidos singulares (Marcadores con Offset Anti-Colisiones).
Además, traza la anhelada "Línea del Promedio General 20.4%" como referencia para evidenciar la gravedad de la curva.

### 🎯 Lo que se quiere Lograr Visualizar
Evaluar el **"Viaje del Consumidor"**. Se visualiza para encontrar fallos graves en procesos de atención. El analista divisa un desplome o fracaso temprano en el "Año 0–1" (la gran mayoría se arrepiente tras firmar el contrato). Luego divisa un "Valle Silencioso" donde es innecesario intervenir, seguido de un desgarro tardío en los Años "8-10" debido al cansancio o bombardeo de competidores rivales en un mercado maduro.

---

## Consideración Transversal (UI / UX Global)

El éxito medular del informe reside en la consistencia dictatorial del diseño. Se prescindió de títulos anticuados a cambio de una jerárquica *Tarjeta de Insight "Análisis Subre la Gráfica"* inyectada obligatoriamente en todos los tableros. Esto ancla la narrativa, fomenta un diseño de fondo oscurecido premium sin cansancio visual y respeta una sagrada paleta semaglífica que transforma los "datos" en verdaderos activadores psicológicos de decisión.
