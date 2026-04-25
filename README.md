# Dashboard Premium Analítico de Churn (D3.js)

## Descripción
Dashboard web interactivo enfocado en el análisis de retención de clientes bancarios (Churn). Transforma 10,000 registros en inteligencia accionable aplicando cálculos de Tasas Relativas de Churn y filtrado cruzado interactivo.

## Dataset
- **Fuente**: Kaggle
- **URL**: [Bank Customer Churn Dataset](https://www.kaggle.com/datasets/barelydedicated/bank-customer-churn-modeling) (Archivo incluido en el repo)
- **Descripción**: Contiene 10,000 perfiles de clientes de un banco europeo, incluyendo variables demográficas (edad, género, geografía), financieras (score crediticio, salario estimado, balance) y temporales (años de tenencia), con una etiqueta binaria (`Exited`) que indica si abandonaron el banco.

## Hallazgos Principales
1. **Hallazgo 1 (Tasa Base Crítica)**: El 20.4% de los clientes registrados ha abandonado el banco, marcando una pérdida crítica de ingresos que establece la urgencia del proyecto.
2. **Hallazgo 2 (Riesgo Alemán)**: Alemania presenta una tasa de abandono extrema (32.4%), duplicando a los mercados de Francia y España, sugiriendo una falla estructural localizada.
3. **Hallazgo 3 (Vulnerabilidad Demográfica)**: Los clientes adultos entre 40 y 55 años son el grupo con mayor propensión a la deserción, requiriendo estrategias de fidelización senior.
4. **Hallazgo 4 (Factor Crediticio Absoluto)**: Los clientes con score crediticio bajo (300-500) abandonan masivamente independientemente de su nivel salarial, descartando el ingreso económico como factor detonante.
5. **Hallazgo 5 (Crisis de Onboarding y Fatiga)**: Existe una ruptura temprana severa durante el Año 0 (Falla de Onboarding), y un peligro de fatiga de producto a partir del Año 9 de tenencia.

## Visualizaciones Implementadas
1. **Gráfico de Anillo de composición porcentual** sobre la tasa global de abandono.
2. **Gráfico de Barras semaforizado** comparando el impacto geográfico (países).
3. **Histograma Interactivo** de distribución de edad con un área focalizada de máximo riesgo.
4. **Mapa de Calor (Heatmap) cruzado** mostrando la relación entre Score Crediticio y Salario Estimado.
5. **Serie de Tiempo (Time-Series Spline)** mostrando la evolución de la retención según años de tenencia.

## Tecnologías Utilizadas
- Framework: D3.js (v7)
- Lenguaje: JavaScript / HTML5 / CSS
- Bibliotecas: D3.js

## Instalación y Ejecución Local
### Requisitos Previos
- Entorno de Python (para levantar servidor local)

### Instrucciones
```bash
# Clonar repositorio
git clone https://github.com/Tanobri/dashboard-churn-banco.git
cd dashboard-churn-banco

# Ejecutar aplicación mediante servidor local
python -m http.server 8000

# Abrir en el navegador:
# http://localhost:8000/
```

## Despliegue
URL en producción: [Enlace a la app desplegada en GitHub Pages]

## Autores
Obrian Sanchez
Andres Cardoso
