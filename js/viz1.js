/**
 * Viz 1: Global Churn Summary (Donut Chart)
 */
function drawViz1(data, containerId, width, height) {
    const margin = 40;
    const legendWidth = Math.min(220, width * 0.35); // 35% del contenedor o máx 220px para la leyenda
    const chartWidth = width - legendWidth;
    const radius = Math.min(chartWidth, height) / 2 - margin;

    const svg = d3.select(containerId)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        // Trasladamos el centro hacia la derecha, dejando espacio al inicio para la leyenda
        .attr("transform", `translate(${legendWidth + (chartWidth / 2)}, ${height / 2})`);

    const counts = d3.rollup(data, v => v.length, d => d.Exited);
    const plotData = [
        { label: "Permanecen", value: counts.get(0) || 0, color: "#10b981" },
        { label: "Abandonan", value: counts.get(1) || 0, color: "#f43f5e" }
    ];

    const pie = d3.pie().value(d => d.value).sort(null);
    const arc = d3.arc().innerRadius(radius * 0.55).outerRadius(radius * 0.85).cornerRadius(4);
    const arcHover = d3.arc().innerRadius(radius * 0.55).outerRadius(radius * 0.92).cornerRadius(6);

    const arcs = svg.selectAll("arc").data(pie(plotData)).enter().append("g");

    arcs.append("path")
        .attr("fill", d => d.data.color)
        .style("stroke", "var(--bg-dark)")
        .style("stroke-width", "3px")
        .on("mouseover", function(event, d) {
            d3.select(this).transition().duration(200).attr("d", arcHover);
            const pts = `${d.data.value.toLocaleString()} clientes`;
            showTooltip(event, `<b style="font-family: 'Inter', sans-serif;">${d.data.label}</b><br/><span class="mono-text">${pts} (${((d.data.value / data.length) * 100).toFixed(1)}%)</span>`);
        })
        .on("mouseout", function() {
            d3.select(this).transition().duration(200).attr("d", arc);
            hideTooltip();
        })
        .transition().duration(1000)
        .attrTween("d", function(d) {
            const i = d3.interpolate(d.startAngle+0.1, d.endAngle);
            return function(t) {
                d.endAngle = i(t);
                return arc(d);
            }
        });

    // Texto central perfeccionado
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-1em")
        .style("fill", "#94a3b8")
        .style("font-size", "15px")
        .style("font-weight", "500")
        .text("Total Clientes");

    svg.append("text")
        .attr("class", "mono-text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.7em")
        .style("fill", "#f8fafc")
        .style("font-size", "38px")
        .style("font-weight", "700")
        .text(data.length.toLocaleString());

    // --- MEJORA ANALÍTICA: LEYENDA TIPO SCORECARD (IZQUIERDA) ---
    // Usamos el punto base (-centerWidth/2) menos el legendWidth
    const legendX = -(chartWidth / 2) - legendWidth + 20; 
    const legendY = -50; 

    // Ocultar leyenda en pantallas extremadamente pequeñas (si width < 450)
    if (width > 450) {
        const legend = svg.append("g")
            .attr("transform", `translate(${legendX}, ${legendY})`);

        const legendGroups = legend.selectAll(".legend-item")
            .data(plotData)
            .enter()
            .append("g")
            .attr("transform", (d, i) => `translate(0, ${i * 70})`); // Apilados verticalmente con gap de 70px

        // Leyenda - Rectángulos
        legendGroups.append("rect")
            .attr("width", 20)
            .attr("height", 20)
            .attr("rx", 4)
            .attr("fill", d => d.color)
            .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.2))");

        // Leyenda - Etiquetas
        legendGroups.append("text")
            .attr("x", 32)
            .attr("y", 16)
            .style("fill", "#cbd5e1")
            .style("font-size", "18px")
            .style("font-weight", "500")
            .text(d => d.label);

        // Subtítulo con Data (Analítico)
        legendGroups.append("text")
            .attr("class", "mono-text")
            .attr("x", 32)
            .attr("y", 40)
            .style("fill", "#94a3b8")
            .style("font-size", "15px")
            .text(d => `${d.value.toLocaleString()} = ${((d.value / data.length) * 100).toFixed(1)}%`);

        // --- CAJA DE ANÁLISIS E INSIGHTS ---
        const exitedCount = counts.get(1) || 0;
        const rate = ((exitedCount / data.length) * 100).toFixed(1);

        legend.append("foreignObject")
            .attr("x", 0) 
            .attr("y", 155) // Separarlo contundentemente de la leyenda superior (antes 110)
            .attr("width", 260) // Ancho moderado pero suficiente
            .attr("height", 180) 
            .append("xhtml:div")
            .style("color", "#cbd5e1") // Color base original
            .style("font-size", "14px") // Regulado (bajado desde 15px) para garantizar renderizado
            .style("line-height", "1.5")
            .style("padding", "12px 16px") // Padding estabilizado
            .style("background", "rgba(244, 63, 94, 0.08)") 
            .style("border-left", "4px solid #f43f5e") 
            .style("border-radius", "0 6px 6px 0")
            .html(`<strong style="color: #f8fafc; font-size: 16px; display: block; margin-bottom: 8px; font-family: 'Inter', sans-serif;">Análisis sobre la gráfica</strong>Los datos muestran que el ${rate}% de los clientes ha abandonado el banco, advirtiendo una deserción severa y un claro problema de retención.`);
    }

    function showTooltip(event, text) {
        let tooltip = d3.select("body").select(".tooltip");
        if (tooltip.empty()) tooltip = d3.select("body").append("div").attr("class", "tooltip");
        tooltip.style("display", "block").style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 10) + "px").html(text);
    }
    function hideTooltip() { d3.select(".tooltip").style("display", "none"); }
}
