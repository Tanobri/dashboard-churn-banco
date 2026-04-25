/**
 * Viz 5: Tasa de Churn según Años de Tenencia (Line Chart con Marcadores)
 */
function drawViz5(data, containerId, width, height) {
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
        
        const margin = { top: 60, right: 80, bottom: 160, left: 100 };
        const w = width - margin.left - margin.right;
        const h = height - margin.top - margin.bottom;

        const svg = svgWrapper
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

    // 1. Data Processing
    // Agrupar por años de Tenencia y calcular tasa de abandono
    let tenureData = Array.from(d3.rollup(chartData, 
        v => {
            const total = v.length;
            const exited = v.filter(d => d.Exited === 1).length;
            return { total, exited, rate: exited / total };
        }, 
        d => d.Tenure
    )).map(([key, value]) => ({ tenure: +key, ...value }))
      .sort((a, b) => d3.ascending(a.tenure, b.tenure));

    // Promedio Global
    const globalTotal = chartData.length;
    const globalExited = chartData.filter(d => d.Exited === 1).length;
    const globalRate = globalExited / globalTotal; // ~20.4%

    // 2. Escalas 
    const x = d3.scaleLinear()
        .domain(d3.extent(tenureData, d => d.tenure)) // 0 a 10
        .range([0, w]);

    // Margen holgado en el Eje Y para no empezar de Cero (Ajuste pedido)
    const minRate = d3.min(tenureData, d => d.rate);
    const maxRate = d3.max(tenureData, d => d.rate);
    const y = d3.scaleLinear()
        .domain([minRate * 0.85, maxRate * 1.15]) 
        .range([h, 0]);

    // 3. Ejes y Rejilla
    svg.append("g")
        .attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(10))
        .selectAll("text")
        .style("font-size", "14px").style("font-family", "'JetBrains Mono', monospace").style("fill", "#cbd5e1");

    svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d3.format(".0%")))
        .selectAll("text")
        .style("font-size", "14px").style("font-family", "'JetBrains Mono', monospace").style("fill", "#cbd5e1");

    // Rejilla Horizontal tenue
    svg.selectAll("grid-lines")
        .data(y.ticks(6)).enter()
        .append("line")
        .attr("x1", 0)
        .attr("x2", w)
        .attr("y1", d => y(d))
        .attr("y2", d => y(d))
        .attr("stroke", "#334155")
        .attr("stroke-dasharray", "2 4")
        .attr("opacity", 0.3);

    // Títulos de los Ejes
    svg.append("text").attr("text-anchor", "middle").attr("x", w / 2).attr("y", h + 45)
        .style("fill", "#94a3b8").style("font-size", "15px").style("font-weight", "600").style("font-family", "'Inter', sans-serif")
        .text("Años de Tenencia en el Banco");

    svg.append("text").attr("text-anchor", "middle").attr("transform", "rotate(-90)").attr("y", -margin.left + 35).attr("x", -h / 2)
        .style("fill", "#94a3b8").style("font-size", "15px").style("font-weight", "600").style("font-family", "'Inter', sans-serif")
        .text("Tasa de Abandono (Churn %)");

    // 4. Línea Promedio Horizontal
    svg.append("line")
        .attr("x1", 0).attr("x2", w)
        .attr("y1", y(globalRate)).attr("y2", y(globalRate))
        .attr("stroke", "#94a3b8")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5 5")
        .attr("opacity", 0.7);
    
    svg.append("text")
         .attr("x", w - 10)
         .attr("y", y(globalRate) - 10)
         .attr("text-anchor", "end")
         .style("fill", "#94a3b8")
         .style("font-size", "14px").style("font-weight", "500")
         .style("font-family", "'Inter', sans-serif")
         .text(`Promedio Base (${(globalRate*100).toFixed(1)}%)`);

    // 5. Dibujo de la Curva de Tendencia
    const line = d3.line()
        .x(d => x(d.tenure))
        .y(d => y(d.rate))
        .curve(d3.curveMonotoneX); // Suavizar la línea

    const path = svg.append("path")
        .datum(tenureData)
        .attr("fill", "none")
        .attr("stroke", "rgba(99, 102, 241, 0.6)") // Indigo sutil y elegante
        .attr("stroke-width", 4)
        .attr("d", line);

    // Transición de trazado de la línea (Efecto "dibujar" de izquierda a derecha)
    const totalLength = path.node().getTotalLength();
    path.attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition().duration(1500).ease(d3.easeCubicOut)
        .attr("stroke-dashoffset", 0);

    // 6. Círculos de Coordenadas Iterativos (Marcadores) con Semaforización Evaluada al Ojo Humano
    const getColor = (rate) => {
        // Riesgo por encima del Promedio Base -> Rojo
        if (rate > globalRate + 0.005) return "#f43f5e";
        // Riesgo aceptable/bajo (Zona de Retención) -> Verde
        if (rate < globalRate - 0.005) return "#10b981";
        // Zona en la raya del promedio -> Amarillento cautelar
        return "#f59e0b";
    };

    const dots = svg.selectAll("dot")
        .data(tenureData).enter()
        .append("circle")
        .attr("cx", d => x(d.tenure))
        .attr("cy", d => y(d.rate))
        .attr("r", 7) // Puntos grandes tal cual solicitado
        .attr("fill", d => getColor(d.rate))
        .attr("stroke", "var(--bg-dark)")
        .attr("stroke-width", 2)
        .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.4))")
        .style("cursor", "crosshair")
        .style("opacity", 0)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("r", 12).style("filter", "brightness(1.5)"); // Expanción masiva por CSS Hover
            showTooltip(event, `
                <strong style="font-family:'Inter', sans-serif; font-size:16px; display:block; padding-bottom:6px; border-bottom:1px solid #334155; margin-bottom:6px;">⏳ Tenencia: ${d.tenure} Año(s)</strong>
                <span class="mono-text" style="color: ${getColor(d.rate)}; font-weight:700; font-size:18px;">Tasa Churn: ${(d.rate * 100).toFixed(1)}%</span><br>
                <div style="margin-top:8px; font-family:'JetBrains Mono', monospace; font-size:14px; color:#cbd5e1; line-height:1.6;">
                Total Clientes: <b>${d.total.toLocaleString()}</b><br>
                Abandono Total: <b>${d.exited.toLocaleString()}</b>
                </div>
            `);
        })
        .on("mouseout", function() {
            d3.select(this).attr("r", 7).style("filter", "none").style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.4))");
            hideTooltip();
        });

    dots.transition().duration(1000).delay((d,i) => i * 150).style("opacity", 1);


    // 7. ANOTACIONES O MARCADORES FLOTANTES (MOMENTOS CLAVE DEL LIFECYCLE)
    function addAnnotation(xVal, text, color, offsetDirection="up") {
        const point = tenureData.find(d => d.tenure === xVal);
        if(!point) return;
        
        const offsetY = offsetDirection === "up" ? -40 : +40;
        const textY = y(point.rate) + offsetY;

        // Linea Conectora
        svg.append("line")
           .attr("x1", x(xVal)).attr("y1", y(point.rate) + (offsetDirection === "up" ? -10 : 10))
           .attr("x2", x(xVal)).attr("y2", textY - (offsetDirection === "up" ? -5 : 5))
           .attr("stroke", color).attr("stroke-dasharray", "3 3").attr("opacity", 0)
           .transition().delay(1800).duration(500).attr("opacity", 0.7);

        // Texto Anotación
        svg.append("text")
           .attr("font-family", "'Inter', sans-serif")
           .attr("font-size", "14px")
           .attr("font-weight", 600)
           .attr("fill", color)
           .attr("text-anchor", xVal === 0 ? "start" : (xVal === 9 ? "end" : "middle")) // Prevención de corte de pantalla
           .attr("x", x(xVal) + (xVal === 0 ? 10 : (xVal === 9 ? -10 : 0))) // Offset adicional local
           .attr("y", textY)
           .text(text)
           .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.8))")
           .attr("opacity", 0)
           .transition().delay(2000).duration(500).attr("opacity", 1);
    }

    addAnnotation(0, "Riesgo de Onboarding (Frustración Inicial)", "#f43f5e", "up"); // Forzar "up" para no chocar con la curva descendente
    addAnnotation(5, "Etapa de Estabilidad Fiel", "#10b981", "up");
    addAnnotation(9, "Riesgo Tardío (Fatiga/Ofertas)", "#f43f5e", "up"); // Forzado a "up" para evitar choques


    const countryLabel = countryName === "France" ? "en Francia" : countryName === "Spain" ? "en España" : countryName === "Germany" ? "en Alemania" : "a nivel global";
    
    svg.append("foreignObject")
        .attr("x", -margin.left + 30) // Margen limpio izquierdo absoluto
        .attr("y", h + 70) 
        .attr("width", width - 60) // Conserva 30px por ambos flancos absolutos
        .attr("height", 150) // Mas alto para acomodar saltos de linea
        .append("xhtml:div")
        .style("box-sizing", "border-box") // CRÍTICO: Previene que el padding lo empuje fuera de pantalla
        .style("width", "100%")
        .style("color", "#cbd5e1") 
        .style("font-size", "14px") // Normalizado a un estandar infalible
        .style("line-height", "1.6")
        .style("padding", "16px") 
        .style("background", "rgba(244, 63, 94, 0.08)") 
        .style("border-left", "4px solid #f43f5e") 
        .style("border-radius", "0 6px 6px 0")
        .html(`<strong style="color: #f8fafc; font-size: 16px; display: block; margin-bottom: 6px; font-family: 'Inter', sans-serif;">Análisis de Ciclo de Vida (${countryLabel})</strong>El abandono ${countryLabel} es drástico en el Año Cero de los clientes, indicando un fallo en el Onboarding. Posteriormente la tasa desciende demostrando estabilidad, solo para volver a fracturarse tras 8 años, augurando fatiga o vulnerabilidad ante la competencia.`);

    // --- Helpers de interaccion
    function showTooltip(event, text) {
        let tooltip = d3.select("body").select(".tooltip");
        if (tooltip.empty()) tooltip = d3.select("body").append("div").attr("class", "tooltip");
        tooltip.style("display", "block").style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 15) + "px").html(text);
    }
    function hideTooltip() { d3.select(".tooltip").style("display", "none"); }
    
    } // Fin de render()
    
    render(data, "Todos los Países");
}
