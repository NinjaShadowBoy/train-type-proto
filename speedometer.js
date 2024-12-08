function initializeGauge(guageName = ".gauge") {
    const svg = $(guageName + " svg")
    let h = svg.height();
    let w = svg.width();

    let proportion = 0.8
    let radius = proportion * Math.sqrt(w * h) / 2
    let x_offset = (1 - proportion) * w / 2
    let y_offset = (1 - proportion) * w / 2
    let a = Math.sqrt(2) / 2

    let p1 = `${radius * (1 - a) + x_offset} ${h - radius * (1 - a) - y_offset}`
    let p2 = `${radius * (1 + a) + x_offset} ${h - radius * (1 - a) - y_offset}`
    let p3 = `${radius + x_offset} ${h - 2 * radius - y_offset}`

    $(guageName + " path.arc").attr("d", `M${p1}, A${radius} ${radius}, 0, 0 1, ${p3} A${radius} ${radius}, 0, 0 1, ${p2}`);
    $(guageName + " path.arc").attr("stroke-width", radius / 5.6);
    $(guageName + " path.arc.incomplete").attr("stroke-width", radius / 6);
    $(guageName + " .number").css("font-size", `${radius / 18}rem`)
    $(guageName + " .wpm").css("font-size", `${radius / 50}rem`)
    $(guageName + " feGaussianBlur").attr("stdDeviation", `${radius / 20}`)
}
function setValue(percent, maxValue = 100, guageName = ".gauge") {
    const arc = $(guageName + " path.arc")

    const maxLen = arc[0].getTotalLength()
    $(guageName + " .center-circle .number").text(Math.round(percent * maxValue));
    arc[1].style.strokeDasharray = `${percent * maxLen} ${maxLen}`;
    arc[0].style.strokeDasharray = `0`;

    const colors = $(guageName + " svg linearGradient stop")

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

    const svg = $(guageName + " svg")
    let h = svg.height();
    let w = svg.width();

    let proportion = 0.8
    let radius = proportion * Math.sqrt(w * h) / 2
    $(guageName + " .center-circle").css("box-shadow", `inset 0px 0px ${radius / 5}px ${col}`)
    $(guageName + " .center-circle .number").css("color", col)
}

