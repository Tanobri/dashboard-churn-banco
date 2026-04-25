/**
 * Viz 4: Heatmap - Tasa de Churn por Perfil Financiero (Score vs Salario)
 */
function drawViz4(data, containerId, width, height) {
    const container = d3.select(containerId);
    
    // Contenedor principal de controles
    const controls = container.append("div")
        .attr("class", "viz-filter-container");
        
    controls.append("label")
        .attr("for", "countryFilter")
        .text("Filtrar por País:");
        
    const select = controls.append("select")
        .attr("id", "countryFilter")
        .attr("class", "viz-filter-select");
        
    select.selectAll("option")
        .data(["Todos los Países", "France", "Spain", "Germany"])
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d === "France" ? "Francia" : d === "Spain" ? "España" : d === "Germany" ? "Alemania" : d);

    // Contenedor para el SVG
    const svgWrapper = container.append("div").attr("class", "svg-wrapper");

    // Evento de cambio
    select.on("change", function() {
        const selected = d3.select(this).property("value");
        const filteredData = selected === "Todos los Países" ? data : data.filter(d => d.Geography === selected);
        render(filteredData, selected);
    });

    function render(chartData, countryName) {
        svgWrapper.html(""); // Limpiar gráfico previo
        
        const margin = { top: 60, right: 200, bottom: 160, left: 160 }; // Aumento mayúsculo en right para la leyenda
        const w = width - margin.left - margin.right;
        const h = height - margin.top - margin.bottom;

        const svg = svgWrapper
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

    // 1. Preparación de Rangos y Agrupaciones
    // Calculamos los terciles reales del salario para asegurar franjas con igual cantidad de personas
    const salaries = chartData.map(d => d.EstimatedSalary).sort(d3.ascending);
    const salQ1 = d3.quantile(salaries, 0.3333);
    const salQ2 = d3.quantile(salaries, 0.6666);

    // Para simplificar la lectura redondearemos los terciles del salario a miles
    const q1Format = d3.format("$.2s")(salQ1);
    const q2Format = d3.format("$.2s")(salQ2);

    const xLabels = [`Bajo (< ${q1Format})`, `Medio (${q1Format} - ${q2Format})`, `Alto (> ${q2Format})`];
    const yLabels = ["Alto (700-850)", "Medio (500-700)", "Bajo (300-500)"];

    function getSalaryGroup(s) {
        if (s <= salQ1) return xLabels[0];
        if (s <= salQ2) return xLabels[1];
        return xLabels[2];
    }

    function getScoreGroup(s) {
        if (s < 500) return yLabels[2]; // Bajo
        if (s <= 700) return yLabels[1]; // Medio
        return yLabels[0]; // Alto
    }

    // 2. Tabular los 9 cuadrantes
    const heatmapData = [];
    for (let yG of yLabels) {
        for (let xG of xLabels) {
            const subset = chartData.filter(d => getScoreGroup(d.CreditScore) === yG && getSalaryGroup(d.EstimatedSalary) === xG);
            const total = subset.length;
            const exited = subset.filter(d => d.Exited === 1).length;
            const rate = total > 0 ? exited / total : 0;
            heatmapData.push({ x: xG, y: yG, total, exited, rate });
        }
    }

    // 3. Escalas del Grid X/Y
    const x = d3.scaleBand().range([0, w]).domain(xLabels).padding(0.04);
    const y = d3.scaleBand().range([0, h]).domain(yLabels).padding(0.04);

    // Ejes gigantes para legibilidad
    svg.append("g")
        .attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll("text")
        .style("font-size", "14px").style("font-family", "'Inter', sans-serif").style("fill", "#cbd5e1");

    svg.append("g")
        .call(d3.axisLeft(y).tickSizeOuter(0))
        .selectAll("text")
        .style("font-size", "14px").style("font-family", "'Inter', sans-serif").style("fill", "#cbd5e1");

    // Títulos de los Ejes
    svg.append("text").attr("text-anchor", "middle").attr("x", w / 2).attr("y", h + 50)
        .style("fill", "#94a3b8").style("font-size", "15px").style("font-weight", "600").style("font-family", "'Inter', sans-serif")
        .text("Nivel de Salario");

    svg.append("text").attr("text-anchor", "middle").attr("transform", "rotate(-90)").attr("y", -135).attr("x", -h / 2)
        .style("fill", "#94a3b8").style("font-size", "15px").style("font-weight", "600").style("font-family", "'Inter', sans-serif")
        .text("Nivel de Score Crediticio");

    // 4. Lógica de Semaforización del Churn Rate
    const getColor = (rate) => {
        if (rate >= 0.25) return "#f43f5e"; // Rojo brillante -> Alto
        if (rate >= 0.18) return "#f59e0b"; // Naranja/Amarillo -> Medio
        return "#10b981";                   // Verde -> Bajo
    };

    // 5. Dibujo del Heatmap
    const cells = svg.selectAll("heatmap-cells")
        .data(heatmapData).enter()
        .append("g")
        .attr("transform", d => `translate(${x(d.x)}, ${y(d.y)})`);

    // Cuadrados del Grid
    cells.append("rect")
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("rx", 8) // Bordes curvos elegantes
        .attr("fill", d => getColor(d.rate))
        .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.2))")
        .style("opacity", 0) // Oculto al inicio para transición
        .on("mouseover", function (event, d) {
            d3.select(this).style("filter", "brightness(1.2) drop-shadow(0 6px 8px rgba(0,0,0,0.4))");
            showTooltip(event, `
                <strong style="font-family:'Inter', sans-serif; font-size:16px; display:block; padding-bottom:6px; border-bottom:1px solid #334155; margin-bottom:6px;">Perfil: ${d.y} y ${d.x}</strong>
                <span class="mono-text" style="color: ${getColor(d.rate)}; font-weight:700; font-size:15px;">Tasa Churn: ${(d.rate * 100).toFixed(1)}%</span><br>
                <div style="margin-top:8px; font-family:'JetBrains Mono', monospace; font-size:14px; color:#cbd5e1; line-height:1.6;">
                <span style="color:#f43f5e">●</span> Abandonan: <b>${d.exited.toLocaleString()}</b><br>
                <span style="color:#94a3b8">●</span> Habitantes Cuadrante: <b>${d.total.toLocaleString()}</b>
                </div>
            `);
        })
        .on("mouseout", function () {
            d3.select(this).style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.2))");
            hideTooltip();
        })
        .transition().duration(1000).delay((d, i) => i * 100) // Animación secuencial
        .style("opacity", 0.95);

    // Textos porcentuales super gigantes en el centro de las cajas
    cells.append("text")
        .attr("x", x.bandwidth() / 2)
        .attr("y", y.bandwidth() / 2 + 10) // Ajustado para centrar verticalmente con el nuevo tamaño
        .attr("text-anchor", "middle")
        .style("fill", "#f8fafc")
        .style("font-size", "34px") // Subido de 22px a 34px
        .style("font-weight", "700")
        .style("font-family", "'JetBrains Mono', monospace")
        .text(d => `${(d.rate * 100).toFixed(1)}%`)
        .style("opacity", 0)
        .transition().duration(1000).delay((d, i) => i * 100)
        .style("opacity", 1);


    // 6. Leyenda Semaforizada
    const legendData = [
        { label: "Alto Riesgo (>25%)", color: "#f43f5e" },
        { label: "Medio Riesgo (18-25%)", color: "#f59e0b" },
        { label: "Riesgo Saludable", color: "#10b981" }
    ];

    const legendGroup = svg.append("g").attr("transform", `translate(${w + 15}, 0)`);
    const legendRows = legendGroup.selectAll("g")
        .data(legendData).enter().append("g")
        .attr("transform", (d, i) => `translate(0, ${i * 30})`); // Mayor separación Y
    legendRows.append("rect").attr("width", 18).attr("height", 18).attr("rx", 3).attr("fill", d => d.color); // Cuadro legenda mas grande
    legendRows.append("text").attr("x", 28).attr("y", 14).style("fill", "#cbd5e1").style("font-size", "15px").style("font-weight", "500").text(d => d.label);

    // 7. Insight Analítico Obligatorio
    const countryLabel = countryName === "France" ? "en Francia" : countryName === "Spain" ? "en España" : countryName === "Germany" ? "en Alemania" : "a nivel global";
    
    svg.append("foreignObject")
        .attr("x", -margin.left + 20) // Extendemos el background cubriendo ancho
        .attr("y", h + 70)
        .attr("width", width - 40) // Usa todo el ancho sumado
        .attr("height", 120)
        .append("xhtml:div")
        .style("color", "#f1f5f9")
        .style("font-size", "15px")
        .style("line-height", "1.6")
        .style("padding", "16px 20px")
        .style("background", "rgba(244, 63, 94, 0.08)")
        .style("border-left", "4px solid #f43f5e")
        .style("border-radius", "0 6px 6px 0")
        .html(`<strong style="color: #f8fafc; font-size: 16px; display: block; margin-bottom: 6px; font-family: 'Inter', sans-serif;">Análisis de Perfil Financiero (${countryLabel})</strong>El churn ${countryLabel} se concentra en los clientes con <b>Bajo Score Crediticio (300-500)</b>, manteniéndose consistentemente más alto que en otros segmentos sin importar su nivel de ingresos, lo que confirma que el Score es la verdadera métrica de riesgo.`);

    function showTooltip(event, text) {
        let tooltip = d3.select("body").select(".tooltip");
        if (tooltip.empty()) tooltip = d3.select("body").append("div").attr("class", "tooltip");
        tooltip.style("display", "block").style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 15) + "px").html(text);
    }
    function hideTooltip() { d3.select(".tooltip").style("display", "none"); }
    
    } // Fin de la funcion render()
    
    // Renderizado inicial
    render(data, "Todos los Países");
}
