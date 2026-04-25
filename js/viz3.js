/**
 * Viz 3: Age Analysis - Stacked Churn Rate (Percentage Histogram)
 */
function drawViz3(data, containerId, width, height) {
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
        
        const margin = { top: 60, right: 30, bottom: 160, left: 70 };
        const w = width - margin.left - margin.right;
        const h = height - margin.top - margin.bottom;

        const svg = svgWrapper
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([18, 92]).range([0, w]);

    // Crear bins por Edad (cada 3-5 años aprox según el ancho)
    const histogram = d3.bin().value(d => d.Age).domain(x.domain()).thresholds(x.ticks(Math.floor(w / 40)));
    const bins = histogram(chartData).filter(d => d.length > 3); // Omitir bins con casi nula población (outliers extremos)

    // Añadir propiedades analíticas a cada bin
    bins.forEach(b => {
        b.exitedCount = b.filter(p => p.Exited === 1).length;
        b.stayCount = b.length - b.exitedCount;
        b.churnRate = b.exitedCount / b.length;
    });

    const y = d3.scaleLinear().domain([0, 1]).range([h, 0]); // Eje Y Normalizado (0% a 100%)

    // --- 1. ZONA CRÍTICA (40 a 55 años) - Resalte Visual del Insight ---
    svg.append("rect")
        .attr("x", x(40))
        .attr("width", x(55) - x(40))
        .attr("y", 0)
        .attr("height", h)
        .attr("fill", "rgba(244, 63, 94, 0.05)")
        .attr("stroke", "#f43f5e")
        .attr("stroke-dasharray", "4 4")
        .attr("stroke-width", 1);

    svg.append("text")
        .attr("x", x(47.5))
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("fill", "#f43f5e")
        .style("font-size", "16px")
        .style("font-weight", 600)
        .style("font-family", "'Inter', sans-serif")
        .text("Zona de Alto Riesgo (40-55)");

    // --- 2. EJES Y ETIQUETAS ---
    // Restaurando la gráfica tal cual y limitando visualmente el tick 90 y forzando el 55.
    const ageTicks = [20, 30, 40, 50, 55, 60, 70, 80];
    
    svg.append("g").attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).tickValues(ageTicks))
        .selectAll("text")
        .style("font-size", "14px")
        .style("font-family", "'JetBrains Mono', monospace")
        .style("fill", d => (d === 40 || d === 55) ? "#f43f5e" : "#cbd5e1")
        .style("font-weight", d => (d === 40 || d === 55) ? "700" : "400");

    svg.append("g").call(d3.axisLeft(y).tickFormat(d3.format(".0%")))
        .selectAll("text").style("font-size", "14px").style("font-family", "'JetBrains Mono', monospace").style("fill", "#cbd5e1");

    // Ejes Labels
    svg.append("text").attr("text-anchor", "middle").attr("x", w / 2).attr("y", h + 45)
        .style("fill", "#94a3b8").style("font-size", "14px").style("font-weight", "600").style("font-family", "'Inter', sans-serif")
        .text("Edad del Cliente (Años)");

    svg.append("text").attr("text-anchor", "middle").attr("transform", "rotate(-90)").attr("y", -margin.left + 15).attr("x", -h / 2)
        .style("fill", "#94a3b8").style("font-size", "14px").style("font-weight", "600").style("font-family", "'Inter', sans-serif")
        .text("Tasa de Churn (%)");

    // --- 3. LEYENDA CLARA ---
    const legendData = [
        { label: "Abandonan (% Churn)", color: "#f43f5e" },
        { label: "Permanecen", color: "#10b981" }
    ];
    // Posicionamos la leyenda a la derecha
    const legendGroup = svg.append("g").attr("transform", `translate(${Math.max(w - 200, 0)}, -45)`);
    const legendRows = legendGroup.selectAll("g").data(legendData).enter().append("g").attr("transform", (d, i) => `translate(0, ${i * 22})`);
    legendRows.append("rect").attr("width", 14).attr("height", 14).attr("rx", 3).attr("fill", d => d.color).style("opacity", (d, i) => i === 1 ? 0.3 : 1);
    legendRows.append("text").attr("x", 22).attr("y", 12).style("fill", "#cbd5e1").style("font-size", "13px").style("font-weight", "500").text(d => d.label);

    // --- 4. DIBUJADO DE BARRAS EN PROPORCIÓN ---
    const paddingX = 1;

    const binGroup = svg.selectAll(".bin-group")
        .data(bins).enter().append("g")
        .attr("class", "bin-group")
        .on("mouseover", function (event, d) {
            d3.select(this).style("filter", "brightness(1.3)");
            showTooltip(event, `
                <strong style="font-family:'Inter', sans-serif; font-size:16px; display:block; padding-bottom:6px; border-bottom:1px solid #334155; margin-bottom:6px;">Rango Etario: ${d.x0} - ${d.x1} años</strong>
                <span class="mono-text" style="color: #f43f5e; font-weight:700; font-size:15px;">Tasa Churn: ${(d.churnRate * 100).toFixed(1)}%</span><br>
                <div style="margin-top:8px; font-family:'JetBrains Mono', monospace; font-size:14px; color:#cbd5e1; line-height:1.6;">
                <span style="color:#059669">●</span> Permanecen: <b>${d.stayCount.toLocaleString()}</b><br>
                <span style="color:#f43f5e">●</span> Abandonan: <b>${d.exitedCount.toLocaleString()}</b><br>
                <span style="color:#94a3b8">●</span> Total Clientes: <b>${d.length.toLocaleString()}</b>
                </div>
            `);
        })
        .on("mouseout", function () {
            d3.select(this).style("filter", "none");
            hideTooltip();
        });

    // Sub-Barra Verde Transparente (Fondo para el 100% que representa a los retenidos)
    binGroup.append("rect")
        .attr("x", d => x(d.x0) + paddingX)
        .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - paddingX * 2))
        .attr("y", 0)
        .attr("height", 0) // Inicia oculta para animar
        .attr("fill", "#10b981")
        .style("opacity", 0.15) // Menor opacidad drásticamente
        .transition().duration(1000).delay(100)
        .attr("y", 0)
        .attr("height", h);

    // Barra Roja Principal (La porción que refleja el rate desde abajo)
    binGroup.append("rect")
        .attr("x", d => x(d.x0) + paddingX)
        .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - paddingX * 2))
        .attr("y", h)
        .attr("height", 0)
        .attr("fill", "#f43f5e") // Mayor visibilidad
        .attr("stroke", "#fda4af") // Resalte a las barras de abandono
        .attr("stroke-width", 1)
        .transition().duration(1000).delay(200)
        .attr("y", d => y(d.churnRate))
        .attr("height", d => h - y(d.churnRate));

    // --- 5. INSIGHT ANALÍTICO FINAL OBLIGATORIO ---
    const countryLabel = countryName === "France" ? "en Francia" : countryName === "Spain" ? "en España" : countryName === "Germany" ? "en Alemania" : "a nivel global";
    
    svg.append("foreignObject")
        .attr("x", 0)
        .attr("y", h + 65)
        .attr("width", w)
        .attr("height", 120)
        .append("xhtml:div")
        .style("color", "#f1f5f9")
        .style("font-size", "15px")
        .style("line-height", "1.6")
        .style("padding", "16px 20px")
        .style("background", "rgba(244, 63, 94, 0.08)")
        .style("border-left", "4px solid #f43f5e")
        .style("border-radius", "0 6px 6px 0")
        .html(`<strong style="color: #f8fafc; font-size: 16px; display: block; margin-bottom: 6px; font-family: 'Inter', sans-serif;">Análisis Demográfico (${countryLabel})</strong>Los clientes entre 40 y 55 años ${countryLabel} presentan la mayor tasa de abandono, indicando un segmento sumamente crítico que requiere campañas de retención urgentes y focalizadas.`);

    function showTooltip(event, text) {
        let tooltip = d3.select("body").select(".tooltip");
        if (tooltip.empty()) tooltip = d3.select("body").append("div").attr("class", "tooltip");
        tooltip.style("display", "block").style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 15) + "px").html(text);
    }
    function hideTooltip() { d3.select(".tooltip").style("display", "none"); }
    
    } // Final de la función render()
    
    // Iniciar el dibujado inicial con todos los datos
    render(data, "Todos los Países");
}
