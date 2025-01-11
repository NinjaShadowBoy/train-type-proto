function initializeGauge(guageName = ".gauge") {
  let initialPercent = Number($(guageName).attr("percent")) ? Number($(guageName).attr("percent")) : 0
  let initialMaxValue = Number($(guageName).attr("maxValue")) ? Number($(guageName).attr("maxValue")) : 100

  let guage = $(guageName).html(`<div class="bottom-circle"></div>
      <svg height="95%" width="95%">
        <!-- Define the glow filter -->
        <defs>
          <!-- To increase or decrease the glow, change the stdDeviation-->
          <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" result="coloredBlur" />
            <!-- Increase stdDeviation for more blur -->
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <!-- Change the colors of the path -->
         
        </linearGradient>
        <!-- The d attribute which defines the actual shape of the svg
             is not set here but rather in the js file -->
        <path
          class="arc complete"
          stroke="lightgrey"
          stroke-width="15"
          fill="none"
          stroke-linecap="round"
          stroke-dasharray="0"
        ></path>
        <path
          class="arc incomplete"
          stroke="red"
          stroke-width="15"
          fill="none"
          stroke-linecap="round"
          stroke-dasharray="0 10000"
          filter="url(#glowFilter)"
        ></path>
      </svg>
      <!-- Initial content of the speedometer -->
      <div class="center-circle">
        <span class="wpm">WPM</span>
        <span class="number speed">0</span>
      </div>`)

  let grad = $(guageName + " linearGradient")
  let colors = $(guageName).attr("data-colors").split(' ')
  guage.attr("grad-colors", colors)

  for (let i = 0; i < colors.length; i++) {
    grad.html(grad.html() + `<stop offset="${i * 100 / (colors.length - 1)}%" stop-color="${colors[i]}" />`)
  }

  const svg = $(guageName + " svg")
  let h = svg.height();
  let w = svg.width();

  let proportion = 0.8
  let radius = proportion * Math.sqrt(w * w) / 2
  let x_offset = (1 - proportion) * w / 2
  let y_offset = (1 - proportion) * w / 2
  let a = Math.sqrt(2) / 2

  let p1 = `${radius * (1 - a) + x_offset} ${h - radius * (1 - a) - y_offset}`
  let p2 = `${radius * (1 + a) + x_offset} ${h - radius * (1 - a) - y_offset}`
  let p3 = `${radius + x_offset} ${h - 2 * radius - y_offset}`

  let completeArc = $(guageName + " path.arc")
    .attr("d", `M${p1}, A${radius} ${radius}, 0, 0 1, ${p3} A${radius} ${radius}, 0, 0 1, ${p2}`)
    .attr("stroke-width", radius / 5.6);

  let incompleteArc = $(guageName + " path.arc.incomplete")
    .attr("stroke-width", radius / 6)
    .attr("stroke", "url(#gradient)");

  let text = guage.attr("data-text")


  $(guageName + " .number").css("font-size", `${radius / 20}rem`)
  let desc = $(guageName + " .wpm")
    .css("font-size", `${radius / 60}rem`)
    .text(text)
  $(guageName + " feGaussianBlur").attr("stdDeviation", `${radius / 20}`)

  setValue(initialPercent, initialMaxValue, guageName)
}
function setValue(percent, maxValue = 100, guageName = ".gauge") {
  let guage = $(guageName).attr({
    "percent": percent,
    "maxValue": maxValue
  })
  const arc = $(guageName + " path.arc")

  const maxLen = arc[0].getTotalLength()

  $(guageName + " .center-circle .number").text(Math.round(percent * maxValue));
  arc[1].style.strokeDasharray = `${percent * maxLen} ${maxLen}`;
  arc[0].style.strokeDasharray = `0`;

  const colors = guage.attr("grad-colors").split(',')

  let col = "lightgrey"
  let index = Math.floor(percent * colors.length)
  col = index < colors.length ? colors[index] : colors[colors.length - 1]

  const svg = $(guageName + " svg")
  let h = svg.height();
  let w = svg.width();

  let proportion = 0.8
  let radius = proportion * Math.sqrt(w * h) / 2
  $(guageName + " .center-circle").css("box-shadow", `inset 0px 0px ${radius / 5}px ${col}`)
  $(guageName + " .center-circle .number").css("color", col)
}

$(document).ready(function () {
  // Define the element to observe
  const elements = $(".gauge");

  // Create a ResizeObserver instance
  const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      // console.log('Size changed:', entry.contentRect);
      // Handle the size change (width, height) here
      // console.log(`New size: ${entry.contentRect.width}px x ${entry.contentRect.height}px`);
      initializeGauge(`.${entry.target.className.split(" ").join(".")}`)
      // console.log(`.${entry.target.className.split(" ").join(".")}`);
    }
  });

  // Start observing the element
  for (const item of elements) {
    resizeObserver.observe(item);
  }
});