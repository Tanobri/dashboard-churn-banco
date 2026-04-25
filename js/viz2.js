/**
 * Viz 2: Geographical Analysis - Churn Rate (Bar Chart)
 */
function drawViz2(data, containerId, width, height) {
    // Aumentamos drásticamente el margen inferior para acoplar el alto del Insight (120px) sin que se corte
    const margin = { top: 40, right: 30, bottom: 160, left: 60 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const svg = d3.select(containerId)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Calcular rates y totales
    let geoData = d3.rollups(data, 
        v => ({
            total: v.length,
            exited: v.filter(d => d.Exited === 1).length,
            rate: v.filter(d => d.Exited === 1).length / v.length
        }), 
        d => d.Geography
    ).map(([key, value]) => ({ country: key, ...value }));

    // 1. Ordenar de mayor a menor churn rate
    geoData.sort((a, b) => b.rate - a.rate);

    // Escalas ajustadas exlusivamente para el Rate (%)
    const x = d3.scaleBand().range([0, w]).domain(geoData.map(d => d.country)).padding(0.4);
    const y = d3.scaleLinear().domain([0, d3.max(geoData, d => d.rate) * 1.2]).nice().range([h, 0]);

    // Ejes rediseñados
    svg.append("g").attr("transform", `translate(0,${h})`)
       .call(d3.axisBottom(x))
       .attr("class", "axis-label")
       .selectAll("text")
       .style("font-size", "15px")
       .style("font-family", "'Inter', sans-serif")
       .style("font-weight", "500");
       
    svg.append("g")
       .call(d3.axisLeft(y).tickFormat(d3.format(".0%")))
       .selectAll("text")
       .style("font-size", "14px")
       .style("fill", "#cbd5e1")
       .style("font-family", "'JetBrains Mono', monospace");

    // --- Títulos Descriptivos de los Ejes ---
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", w / 2)
        .attr("y", h + 45) // Espacio bajo las labels de los países
        .style("fill", "#94a3b8")
        .style("font-size", "14px")
        .style("font-weight", "600")
        .style("font-family", "'Inter', sans-serif")
        .text("Mercados Regionales (Países)");

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 15) // Alejarlo del eje vertical hacia la izq
        .attr("x", -h / 2) // Centrado vertical sobre el alto
        .style("fill", "#94a3b8")
        .style("font-size", "14px")
        .style("font-weight", "600")
        .style("font-family", "'Inter', sans-serif")
        .text("Tasa Relativa de Abandono (Churn %)");

    // 2. Color Semántico para comunicar Riesgo
    const getColor = (rate) => {
        if (rate >= 0.25) return "#f43f5e"; // Riesgo Alto (Rojo)
        if (rate >= 0.15) return "#f59e0b"; // Riesgo Medio (Naranja/Amarillo)
        return "#10b981";                   // Riesgo Bajo (Verde)
    };

    // 2.5 Leyenda Semántica
    const legendData = [
        { label: "Riesgo Alto (>25%)", color: "#f43f5e" },
        { label: "Riesgo Medio (15-25%)", color: "#f59e0b" },
        { label: "Riesgo Bajo (<15%)", color: "#10b981" }
    ];

    // Posicionar leyenda en la parte superior derecha (desfasado horizontal para evitar tocar la barra de Francia si la ventana es pequeña)
    const legendRisk = svg.append("g")
        .attr("transform", `translate(${Math.max(w - 180, 0)}, -25)`); 

    const legendRows = legendRisk.selectAll("g")
        .data(legendData)
        .enter().append("g")
        .attr("transform", (d, i) => `translate(0, ${i * 22})`);

    legendRows.append("rect")
        .attr("width", 14)
        .attr("height", 14)
        .attr("rx", 3)
        .attr("fill", d => d.color);

    legendRows.append("text")
        .attr("x", 22)
        .attr("y", 12)
        .style("fill", "#cbd5e1")
        .style("font-size", "13px")
        .text(d => d.label);

    // 3. Dibujar exclusivamente las Barras de Churn Rate
    svg.selectAll("bar-churn")
        .data(geoData).enter().append("rect")
        .attr("x", d => x(d.country))
        .attr("y", h) // Iniciar animación desde abajo
        .attr("width", x.bandwidth())
        .attr("height", 0) // Altura inicial 0
        .attr("fill", d => getColor(d.rate))
        .attr("rx", 6)
        .style("filter", "drop-shadow(0 4px 6px rgba(0,0,0,0.3))")
        .on("mouseover", function(event, d) {
            d3.select(this).style("filter", "brightness(1.2) drop-shadow(0 8px 10px rgba(0,0,0,0.4))");
            // 5. Tooltip Avanzado con toda la info de volumen manual y letras grandes
            showTooltip(event, `
                <strong style="font-family:'Inter', sans-serif; font-size:16px; display:block; padding-bottom:6px; border-bottom:1px solid #334155; margin-bottom:6px;">🌍 ${d.country}</strong>
                <span class="mono-text" style="color: ${getColor(d.rate)}; font-weight:700; font-size:15px;">Churn Rate: ${(d.rate * 100).toFixed(1)}%</span><br>
                <div style="margin-top:8px; font-family:'JetBrains Mono', monospace; font-size:14px; color:#cbd5e1; line-height:1.6;">
                <span style="color:#f43f5e">●</span> Abandonos: <b>${d.exited.toLocaleString()}</b><br>
                <span style="color:#94a3b8">●</span> Total País: <b>${d.total.toLocaleString()}</b>
                </div>
            `);
        })
        .on("mouseout", function() {
            d3.select(this).style("filter", "drop-shadow(0 4px 6px rgba(0,0,0,0.3))");
            hideTooltip();
        })
        .transition().duration(1000).ease(d3.easeCubicOut)
        .attr("y", d => y(d.rate))
        .attr("height", d => h - y(d.rate));

    // 4. Rate Labels con Porcentaje Gigante sobre cada barra
    svg.selectAll(".label")
        .data(geoData).enter().append("text")
        .attr("class", "mono-text")
        .attr("x", d => x(d.country) + x.bandwidth() / 2)
        .attr("y", h)
        .attr("text-anchor", "middle")
        .style("fill", "#f8fafc")
        .style("font-size", "16px")
        .style("font-weight", "700")
        .text(d => `${(d.rate * 100).toFixed(1)}%`)
        .transition().duration(1000).ease(d3.easeCubicOut)
        .attr("y", d => y(d.rate) - 12);

    // --- 6. CAJA DE ANÁLISIS E INSIGHTS ESTÁTICO DEBAJO (OBLIGATORIA) ---
    svg.append("foreignObject")
        .attr("x", 0)
        .attr("y", h + 60) // Bajado a +60 para ceder espacio al título del Eje X
        .attr("width", w) // Ocupar todo el ancho para lectura en línea
        .attr("height", 120) // Aumentado significativamente el height para dar holgura
        .append("xhtml:div")
        .style("color", "#f1f5f9") // Un gris-blanco espectacularmente vibrante para lectura
        .style("font-size", "15px") // Fuente subida para legibilidad (de 13 a 15)
        .style("line-height", "1.6")
        .style("padding", "16px 20px") // Padding robusto para una "tarjeta" ancha
        .style("background", "rgba(244, 63, 94, 0.08)") 
        .style("border-left", "4px solid #f43f5e") // Borde ligeramente más grueso 
        .style("border-radius", "0 6px 6px 0")
        .html(`<strong style="color: #f8fafc; font-size: 16px; display: block; margin-bottom: 6px; font-family: 'Inter', sans-serif;">Análisis sobre la gráfica</strong>Alemania presenta la tasa de abandono más alta (32.4%), duplicando a Francia y España, lo que sugiere un problema específico en ese mercado regional.`);

    function showTooltip(event, text) {
        let tooltip = d3.select("body").select(".tooltip");
        if (tooltip.empty()) tooltip = d3.select("body").append("div").attr("class", "tooltip");
        // Asegurar que el Tooltip reaccione rápido y siga el mouse en un offset cómodo
        tooltip.style("display", "block").style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 15) + "px").html(text);
    }
    
    function hideTooltip() { 
        d3.select(".tooltip").style("display", "none"); 
    }
}
