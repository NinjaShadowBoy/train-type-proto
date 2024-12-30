import { User, ExerciseDone, CustomExo, DB } from "./model.js";

const shrink_btn = document.querySelector(".shrink-btn");
const search = document.querySelector(".search");
const sidebar_links = document.querySelectorAll(".sidebar-links a");
const active_tab = document.querySelector(".active-tab");
const shortcuts = document.querySelector(".sidebar-links h4");
const tooltip_elements = document.querySelectorAll(".tooltip-element");
const themetoggler = document.querySelector(".theme-toggler");
let user = User.loadUser(JSON.parse(sessionStorage.getItem("user")))
let db = DB.load()
console.log(user, db);



let jsonDB = localStorage.getItem("DB")
jsonDB = JSON.parse(jsonDB)


let exercises = $(".exercises").html("")
for (const exo of Object.entries(db.exos)) {
    exercises.html(function (_, old) {
        console.log(exo);

        return old +
            `<div class="exercise" data-exoID=" ${exo[0]}">
              <div class="exo-head">
                <h3 class="exo-title">Exo ${exo[0]}</h4>
                <p>Attempted <b>${exo[1].timesAttempted}</b> times</p>
              </div>
              <p class="exo-content-preview">${exo[1].text.slice(0, 80)}...</p>
              <div class="start-buttons">
                <div class="start-button easy" difficulty="easy">Easy</div>
                <div class="start-button medium" difficulty="medium">Medium</div>
                <div class="start-button hard" difficulty="hard">Difficult</div>
              </div>
            </div>`
    })
}


$("main h1").text(`Welcome ${user.username} !`)
$(".admin-info h3").text(`${user.username}`)
$(".admin-info h5").text(`${user.role}`)



let activeIndex;

shrink_btn.addEventListener("click", () => {
    document.body.classList.toggle("shrink");
    setTimeout(moveActiveTab, 400);

    shrink_btn.classList.add("hovered");

    setTimeout(() => {
        shrink_btn.classList.remove("hovered");
    }, 500);
});

search.addEventListener("click", () => {
    document.body.classList.remove("shrink");
    search.lastElementChild.focus();
});

function moveActiveTab() {
    let topPosition = activeIndex * 58 + 2.5;

    if (activeIndex > 4) {
        topPosition += shortcuts.clientHeight;
    }

    active_tab.style.top = `${topPosition}px`;
}

function changeLink() {
    sidebar_links.forEach((sideLink) => sideLink.classList.remove("active"));
    this.classList.add("active");

    activeIndex = this.dataset.active;

    moveActiveTab();
}

sidebar_links.forEach((link) => link.addEventListener("click", changeLink));

function showTooltip() {
    let tooltip = this.parentNode.lastElementChild;
    let spans = tooltip.children;
    let tooltipIndex = this.dataset.tooltip;

    Array.from(spans).forEach((sp) => sp.classList.remove("show"));
    spans[tooltipIndex].classList.add("show");

    tooltip.style.top = `${(100 / (spans.length * 2)) * (tooltipIndex * 2 + 1)}%`;
}

tooltip_elements.forEach((elem) => {
    elem.addEventListener("mouseover", showTooltip);
});

themetoggler.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme-variables");

    themetoggler.querySelector("span").classList.toggle("active");
})

initializeGauge(".avg-speed")
initializeGauge(".avg-acc")
initializeGauge(".avg-aspeed")

function randomChanges() {
    setValue(Math.random(), 70, ".avg-speed")
    setValue(Math.random(), 100, ".avg-acc")
    setValue(Math.random(), 100, ".avg-aspeed")
    setTimeout(randomChanges, 1000)
}

setValue(user.avg_speed() / 70, 70, ".avg-speed")
setValue(user.avg_acc(), 100, ".avg-acc")
setValue(user.avg_acc()*user.avg_speed() / 70, 70, ".avg-aspeed")
// randomChanges()

// Example data
let timestamps = [];
let speeds = []; // Typing speed in WPM
let accuracies = []; // Accuracy in percentage

// Convert timestamps to readable dates
const formattedDates = timestamps.map((ts) => {
    const date = new Date(ts);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
});

// Initialize Chart.js
const ctx = document
    .getElementById("typingPerformanceChart")
    .getContext("2d");

const typingPerformanceChart = new Chart(ctx, {
    type: "line",
    data: {
        labels: formattedDates, // X-axis: Dates
        datasets: [
            {
                label: "Typing Speed (WPM)",
                data: speeds, // Y-axis: Typing speeds
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 2,
                pointBackgroundColor: "rgba(75, 192, 192, 1)",
                pointRadius: 5,
                pointHoverRadius: 7,
                cubicInterpolationMode: "monotone", // Smooth line
                tension: 0.4, // Adds some tension to the curve
                yAxisID: "ySpeed",
            },
            {
                label: "Accuracy (%)",
                data: accuracies, // Y-axis: Accuracies
                backgroundColor: "rgba(255, 159, 64, 0.2)",
                borderColor: "rgba(255, 159, 64, 1)",
                borderWidth: 2,
                pointBackgroundColor: "rgba(255, 159, 64, 1)",
                pointRadius: 5,
                pointHoverRadius: 7,
                cubicInterpolationMode: "monotone",
                tension: 0.4,
                yAxisID: "yAccuracy",
            },
        ],
    },
    options: {
        responsive: true,
        plugins: {
            tooltip: {
                enabled: true,
                callbacks: {
                    // Display both metrics in the tooltip
                    title: (context) => `Date: ${context[0].label}`,
                    label: (context) => {
                        const datasetLabel = context.dataset.label;
                        const value = context.raw;
                        return `${datasetLabel}: ${value}`;
                    },
                },
            },
            legend: {
                position: "top", // Move legend to the top
                labels: {
                    boxWidth: 20,
                },
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Typing Speed (WPM)",
                },
                title: {
                    display: true,
                    text: "Date",
                },
            },
            // y: {
            //   // Explicitly defining only two Y-axes
            ySpeed: {
                beginAtZero: false,
                type: "linear",
                position: "left",
                title: {
                    display: true,
                    text: "Typing Speed (WPM)",
                },
            },
            yAccuracy: {
                beginAtZero: false,
                type: "linear",
                position: "right",
                title: {
                    display: true,
                    text: "Accurac (%)",
                },
                grid: {
                    drawOnChartArea: false, // Prevent grid lines from overlapping
                },
            },
            // },
        },
    },
});

// Dynamically update the chart
function addData(newTimestamp, newSpeed, newAccuracy) {
    const newDate = new Date(newTimestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
    typingPerformanceChart.data.labels.push(newDate); // Add new date to x-axis
    typingPerformanceChart.data.datasets[0].data.push(newSpeed); // Add new speed to speed dataset
    typingPerformanceChart.data.datasets[1].data.push(newAccuracy); // Add new accuracy to accuracy dataset
    typingPerformanceChart.update(); // Refresh the chart
}

// setTimeout(() => {
//     $("canvas")[0].$chartjs
//     console.log("Chart height", $("canvas").attr({
//         "height": "200",
//         "width": "400",
//     }).parent().html());
// }, 3000)


timestamps = user.perf.map(elt => elt.date);
speeds = user.perf.map(elt => elt.wpm); // Typing speed in WPM
accuracies = user.perf.map(elt => elt.acc * 100); // Accuracy in percentage


// Example: Adding a new point dynamically
for (let i = 0; i < timestamps.length; i++) {
    const newTimestamp = timestamps[i]
    const newSpeed = speeds[i]
    const newAccuracy = accuracies[i]
    setTimeout(() => {
        addData(newTimestamp, newSpeed, newAccuracy); // Add Jan 4 data
    }, i * 3000 / (timestamps.length + 1));
}

$(".start-button").on("click", function (e) {
    console.log(e);
    console.log($(this).parent().parent().attr("data-exoID"));
    $(this).css({
        "margin": "0",
        "padding": "0",
        "top": "0",
        "left": "0",
        "z-index": "100",
        "position": "fixed",
        "width": "100vw",
        "height": "100vh",
    })
    setTimeout(() => {
        window.location.href = "./game.html" // Add Jan 4 data
    }, 500)
    sessionStorage.setItem("difficulty", $(this).attr("difficulty"));
    sessionStorage.setItem("exoID", $(this).parent().parent().attr("data-exoID"))
})

