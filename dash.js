import { User, ExerciseDone, CustomExo, DB } from "./model.js";

const shrink_btn = document.querySelector(".shrink-btn");
const search = document.querySelector(".search");
const sidebar_links = document.querySelectorAll(".sidebar-links a");
const active_tab = document.querySelector(".active-tab");
const shortcuts = document.querySelector(".sidebar-links h4");
const tooltip_elements = document.querySelectorAll(".tooltip-element");
const themetoggler = document.querySelector(".theme-toggler");
let user = sessionStorage.getItem("user")
console.log(user);
user = JSON.parse(user)
console.log(user);
user = User.newUser(user)

let jsonDB = localStorage.getItem("DB")
jsonDB = JSON.parse(jsonDB)
let db = new DB(jsonDB.users, jsonDB.exos)

console.log(user, db);

$("main h1").text(`Welcome ${user.username} !`)
// $("nav h3").text(`${user.username}`)



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

setValue(user.avg_speed, 70, ".avg-speed")
setValue(user.avg_acc, 100, ".avg-acc")
setValue(0.98, 60, ".avg-aspeed")
randomChanges()

$("body *").on("zoom", function () {
    initializeGauge(".avg-speed")
    initializeGauge(".avg-acc")
    initializeGauge(".avg-aspeed")
})