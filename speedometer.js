function initializeGauge() {
    const svg = $(".gauge svg")
    let h = svg.height();
    let w = svg.width();
    console.log(w, h);

    let proportion = 0.8
    let radius = proportion * Math.sqrt(w * h) / 2
    let x_offset = (1 - proportion) * w / 2
    let y_offset = (1 - proportion) * w / 2
    let a = Math.sqrt(2) / 2

    let p1 = `${radius * (1 - a) + x_offset} ${h - radius * (1 - a) - y_offset}`
    let p2 = `${radius * (1 + a) + x_offset} ${h - radius * (1 - a) - y_offset}`
    let p3 = `${radius + x_offset} ${h - 2 * radius - y_offset}`

    $(".arc").attr("d", `M${p1}, A${radius} ${radius}, 0, 0 1, ${p3} A${radius} ${radius}, 0, 0 1, ${p2}`);
    $(".arc").attr("stroke-width", radius / 5.6);
    $(".incomplete").attr("stroke-width", radius / 6);
    $(".speed").css("font-size", `${radius / 30}rem`)
    $(".wpm").css("font-size", `${radius / 60}rem`)
}
function setValue(percent, maxValue = 100) {
    const arc = $(".arc")
    const maxLen = arc[0].getTotalLength()
    console.log(maxLen);
    $(".speed").text(Math.round(percent * maxValue));
    arc[1].style.strokeDasharray = `${percent * maxLen} ${maxLen}`;
    arc[0].style.strokeDasharray = `0`;

    const colors = $(".gauge svg linearGradient stop")
    console.log(colors[0].attributes["stop-color"].value);

    let col = "lightgrey"
    if (percent > 0.9) {
        col = colors[4].attributes["stop-color"].value;
    } else if (percent > 0.8) {
        col = colors[3].attributes["stop-color"].value;
    } else if (percent > 0.5) {
        col = colors[2].attributes["stop-color"].value;
    } else if (percent > 0.1) {
        col = colors[1].attributes["stop-color"].value;
    } else if (percent > 0) {
        col = colors[0].attributes["stop-color"].value;
    }

    console.log(col);
    $(".center-circle").css("box-shadow", `inset 0px 0px 20px ${col}`)
    $(".speed").css("color", col)
}
$(window).resize(initializeGauge);
initializeGauge()
setValue(0.9)
