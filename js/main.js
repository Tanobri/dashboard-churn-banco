/**
 * Main logical file for the Churn Dashboard
 */

let globalData = [];
let currentVizId = "viz1";
let resizeObserver;

const vizConfig = {
    viz1: { 
        title: "Resumen de Fidelidad de Clientes", 
        drawFunc: drawViz1, 
        description: `
        <div class="intro-professional">
            <p><strong>Contexto del Dataset:</strong> Análisis de 10,000 perfiles de clientes de una entidad bancaria multinacional ubicados en <strong>Francia, España y Alemania</strong>.</p>
            <p><strong>¿Qué es el Churn?</strong> Representa la tasa de abandono o cancelación de cuentas por parte de los clientes en un periodo determinado.</p>
            <p class="highlight-objective"><strong>Objetivo Principal:</strong> Implementar una campaña de retención efectiva. Necesitamos filtrar y encontrar en qué sectores exactos radica el mayor riesgo de deserción.</p>
        </div>
        ` 
    },
    viz2: { 
        title: "Tasa de Churn por País", 
        drawFunc: drawViz2, 
        description: `
        <div class="intro-professional">
            <p><strong>Impacto Geográfico:</strong> El primer paso de nuestra campaña es entender dónde estamos perdiendo más clientes.</p>
            <p>Este análisis permite evaluar si la deserción tiene un componente regional fuerte en Francia, España o Alemania.</p>
            <p class="highlight-objective"><strong>Enfoque Estratégico:</strong> Identificar el país con mayor tasa de fuga para priorizar la asignación de recursos y localizar la campaña de retención.</p>
        </div>` 
    },
    viz3: { 
        title: "Tasa de Churn por Rango de Edad", 
        drawFunc: drawViz3, 
        description: `
        <div class="intro-professional">
            <p><strong>Impacto Demográfico:</strong> Una campaña de retención no puede ser genérica; debe hablarle al grupo correcto.</p>
            <p>Al agrupar a los clientes por edad y visualizar su proporción de abandono (Stacked 100%), podemos ver fluctuaciones drásticas en la lealtad.</p>
            <p class="highlight-objective"><strong>Enfoque Estratégico:</strong> Determinar qué generaciones son más vulnerables para poder personalizar el mensaje y los incentivos de la campaña.</p>
        </div>` 
    },
    viz4: { 
        title: "Tasa de Churn por Perfil Financiero", 
        drawFunc: drawViz4, 
        description: `
        <div class="intro-professional">
            <p><strong>Impacto Económico:</strong> ¿Afecta el poder adquisitivo o el historial de crédito en la decisión de abandonar el banco?</p>
            <p>Este mapa de calor cruza bidimensionalmente el Salario Estimado y el Score Crediticio de nuestros usuarios.</p>
            <p class="highlight-objective"><strong>Enfoque Estratégico:</strong> Revelar los cuadrantes financieros de alto riesgo, permitiendo crear ofertas económicas específicas (como mejores tasas) para evitar que se vayan.</p>
        </div>` 
    },
    viz5: { 
        title: "Tasa de Churn según Años de Tenencia", 
        drawFunc: drawViz5, 
        description: `
        <div class="intro-professional">
            <p><strong>Ciclo de Vida del Cliente:</strong> El momento en el que intervenimos es tan crucial como a a quién le hablamos.</p>
            <p>Esta gráfica analiza la curva de deserción en relación con los años de antigüedad (Tenencia) que tiene el cliente con el banco.</p>
            <p class="highlight-objective"><strong>Enfoque Estratégico:</strong> Descubrir si los clientes nos abandonan tempranamente (problema de onboarding) o tardíamente (falta de fidelización) para lanzar la campaña en el momento justo.</p>
        </div>` 
    },
    viz6: {
        title: "Conclusión Estratégica",
        drawFunc: drawViz6,
        description: `
        <div class="intro-professional">
            <p><strong>Síntesis del Proyecto:</strong> En base a todo el análisis visual realizado en las pestañas anteriores, hemos cruzado las variables de Geografía, Edad, Perfil Financiero y Tenencia.</p>
            <p class="highlight-objective"><strong>Plan de Acción:</strong> A continuación se proponen 3 campañas de retención fundamentadas en los datos (Data-Driven) para mitigar el Churn en sus sectores más críticos.</p>
        </div>`
    }
};

function drawViz6(data, containerId, width, height) {
    const container = d3.select(containerId);
    container.html(`
        <div class="conclusion-grid">
            <div class="campaign-card" style="animation-delay: 0.1s;">
                <div class="campaign-icon">🛡️</div>
                <h3>Campaña 1: "Onboarding Seguro"</h3>
                <div class="campaign-target"><strong>Público Objetivo:</strong> Nuevos clientes (Año 0)</div>
                <p>Nuestra gráfica de Tenencia demostró un pico drástico de abandono en el primer año. Se propone un programa de acompañamiento personalizado y eliminación de cobros de mantenimiento durante los primeros 12 meses para reducir la fricción inicial.</p>
            </div>
            
            <div class="campaign-card" style="animation-delay: 0.2s;">
                <div class="campaign-icon">🎯</div>
                <h3>Campaña 2: "Fidelización Senior"</h3>
                <div class="campaign-target"><strong>Público Objetivo:</strong> Clientes entre 40 y 55 años, especialmente en Alemania</div>
                <p>El análisis cruzado de Edad y Geografía reveló que los adultos maduros alemanes son los más propensos a irse. Proponemos ofrecerles productos de inversión conservadores con tasas preferenciales o seguros familiares subvencionados.</p>
            </div>
            
            <div class="campaign-card" style="animation-delay: 0.3s;">
                <div class="campaign-icon">💳</div>
                <h3>Campaña 3: "Reestructuración de Crédito"</h3>
                <div class="campaign-target"><strong>Público Objetivo:</strong> Clientes con Score Crediticio Bajo (300-500)</div>
                <p>El mapa de calor financiero confirmó que el bajo puntaje de crédito impulsa el abandono sin importar el salario. Implementaremos un plan de "Alivio Financiero" reestructurando sus deudas para evitar que se fuguen a bancos con menores intereses.</p>
            </div>
        </div>
    `);
}

document.addEventListener("DOMContentLoaded", () => {
    // Configurar ResizeObserver
    const chartAreaElem = document.getElementById("chart-area");
    resizeObserver = new ResizeObserver(entries => {
        // Usar debounce simple para no renderizar violentamente
        if(window.resizeTimeout) clearTimeout(window.resizeTimeout);
        window.resizeTimeout = setTimeout(() => {
            if(globalData.length > 0) switchViz(currentVizId);
        }, 100);
    });
    resizeObserver.observe(chartAreaElem);

    // Cargar datos
    d3.csv("datos/Churn_Modelling.csv").then(data => {
        globalData = data.map(d => ({
            ...d,
            CreditScore: +d.CreditScore,
            Age: +d.Age,
            Tenure: +d.Tenure,
            Balance: +d.Balance,
            NumOfProducts: +d.NumOfProducts,
            HasCrCard: +d.HasCrCard,
            IsActiveMember: +d.IsActiveMember,
            EstimatedSalary: +d.EstimatedSalary,
            Exited: +d.Exited
        }));

        console.log("Datos cargados correctamente:", globalData.length, "registros.");
        switchViz("viz1");
    }).catch(error => {
        console.error("Error cargando el CSV:", error);
        document.getElementById("viz-description").innerHTML = `<p style="color: var(--danger)">Error cargando los datos. Asegúrese de que el archivo CSV esté en la carpeta datos/.</p>`;
    });

    // Eventos de navegación
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
        item.addEventListener("click", () => {
            const vizId = item.getAttribute("data-viz");
            navItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
            switchViz(vizId);
        });
    });
});

function switchViz(id) {
    const config = vizConfig[id];
    if (!config || globalData.length === 0) return;
    
    currentVizId = id;

    // Actualizar Textos
    document.getElementById("viz-title").innerText = config.title;
    document.getElementById("viz-description").innerHTML = config.description;

    // Limpiar DOM de gráfica previa
    const chartArea = d3.select("#chart-area");
    chartArea.html(""); 

    // Obtener dimensiones reales del contenedor
    const rect = document.getElementById("chart-area").getBoundingClientRect();
    const width = Math.max(rect.width, 400); // Fallback para navegadores como Opera GX
    const height = Math.max(rect.height, 400);

    // Dibujar pasando las dimensiones disponibles
    config.drawFunc(globalData, "#chart-area", width, height);
}
