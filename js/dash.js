import { User, ExerciseDone, CustomExo, DB } from "./model.js";

$(document).ready(function () {
    console.log(window.location.pathname);
    const sidebar_links = document.querySelectorAll(".sidebar-links a");
    const active_tab = document.querySelector(".active-tab");
    const shortcuts = document.querySelector(".sidebar-links h4");
    const tooltip_elements = document.querySelectorAll(".tooltip-element");
    const shrink_btn = document.querySelector(".shrink-btn");
    const logout_btn = $(".log-out");
    const search = document.querySelector(".search");

    $(".theme-toggler").on("click", function () {
        document.body.classList.toggle("dark-theme-variables");
        $(".theme").toggleClass("active");
        $(".theme1").toggleClass("active");
        if ($("body").hasClass("dark-theme-variables")) {
            user.theme = "dark"
        } else {
            user.theme = "light"
        }
        db.users[user.username].theme = user.theme
        db.save()
        sessionStorage.setItem("user", JSON.stringify(db.users[user.username]))
        console.log("User theme", db.users[user.username].theme);
    })

    let activeIndex;

    logout_btn.on("click", function () {
        window.location.href = "./login.html";
    });
    shrink_btn.addEventListener("click", () => {
        document.body.classList.toggle("shrink");
        setTimeout(moveActiveTab, 400);

        shrink_btn.classList.add("hovered");

        setTimeout(() => {
            shrink_btn.classList.remove("hovered");
        }, 500);
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
        console.log("active index", activeIndex);

        let location = window.location.pathname;
        console.log("window.location.pathname: ",location);
        setTimeout(() => {
            switch (Number(activeIndex)) {
                case 1:
                    location = "/train-type-proto/html/dash.html";
                    break;
                case 2:
                    location = "/train-type-proto/html/exercises.html";
                    break;
                case 3:
                    location = "/train-type-proto/html/challenge.html";
                    break;
                case 4:
                    location = "/train-type-proto/html/leaderboards.html";
                    break;
                case 5:
                    location = "/train-type-proto/html/statistics.html"
                    break;
                case 6:
                    location = "/train-type-proto/html/settings.html"
                    break;
                default:
                    break;
            }
            if (location != window.location.pathname) {
                window.location.href = location;
            }
        }, 300);
    }

    sidebar_links.forEach((link) => link.addEventListener("click", changeLink));

    function showTooltip() {
        let tooltip = this.parentNode.lastElementChild;
        let spans = tooltip.children;
        let tooltipIndex = this.dataset.tooltip;

        Array.from(spans).forEach((sp) => sp.classList.remove("show"));
        spans[tooltipIndex].classList.add("show");

        // console.log(p);
        tooltip.style.top = `${(100 / (spans.length * 2)) * (tooltipIndex * 2 + 1)
            }%`;
    }

    tooltip_elements.forEach((elem) => {
        elem.addEventListener("mouseover", showTooltip);
    });

    function loadExercisesOnPage() {
        let exercises = $(".exercises").html("");
        for (const exo of Object.entries(db.exos)) {
            exercises.html(function (_, old) {
                console.log(exo);

                return (
                    old +
                    `<div class="exercise" data-exoID=" ${exo[0]}">
              <div class="exo-head">
                <h3 class="exo-title">${exo[0]}:${exo[1].title}</h4>
                <p>Attempted <b>${exo[1].timesAttempted}</b> times</p>
              </div>
              <p class="exo-content-preview">${exo[1].text.slice(0, 80)}...</p>
              <div class="start-buttons">
                <div class="start-button easy" difficulty="easy">Short</div>
                <div class="start-button medium" difficulty="medium">Medium</div>
                <div class="start-button hard" difficulty="hard">Long</div>
              </div>
            </div>`
                );
            });
        }

        $(".start-button").on("click", function (e) {
            let Initiating_challenge = "/train-type-proto/html/challenge.html" == window.location.pathname
            $(this).css({
                margin: "0",
                padding: "0",
                top: "0",
                left: "0",
                "z-index": "100",
                position: "fixed",
                width: "100vw",
                height: "100vh",
            });
            console.log(e);


            let exoID = $(this).parent().parent().attr("data-exoID");
            let difficulty = $(this).attr("difficulty")

            console.log(Initiating_challenge);
            let opponent = sessionStorage.getItem("opponent");
            console.log("opponent", opponent);


            if (Initiating_challenge) {
                // var p = new Peer(user.username)


                // p.on("open", function () {
                //     console.log("Initiator peer created");

                //     let conn = p.connect(opponent);
                //     conn.on('open', function () {
                //         console.log("Connection initiated with " + conn.peer);
                //         let message = exoID + " " + difficulty
                //         conn.send(message);
                //         console.log("Sending " + message + " to " + conn.peer);

                //         conn.on('data', (data) => {
                //             console.log("Recieved " + data);

                //             if (data == "ok") {
                //                 sessionStorage.setItem("difficulty", difficulty);
                //                 sessionStorage.setItem("exoID", exoID);
                //                 setTimeout(() => {
                //                     window.location.href = "./game.html"; // Add Jan 4 data
                //                 }, 500);
                //             }
                //         });

                //         conn.on("disconnect", function () {
                //             sessionStorage.setItem("difficulty", difficulty);
                //             sessionStorage.setItem("exoID", exoID);
                //             setTimeout(() => {
                //                 window.location.href = "./game.html"; // Add Jan 4 data
                //             }, 500);
                //         })
                //     })
                // })
                //  p1 = new Peer(user.username, {
                //     debug: 2
                // }); // Including debug level 2 for more detailed logs
                console.log(p1);

                // p1.on("open", function (id) {
                console.log("Initiator peer created with ID: " + p1.id);

                let opponent = sessionStorage.getItem("opponent");
                if (!opponent) {
                    console.error("No opponent found in session storage.");
                    return;
                }

                let conn = p1.connect(opponent);
                conn.on('open', function () {

                    console.log("Connection initiated with " + conn.peer);
                    let message = exoID + " " + difficulty;
                    conn.send(message);
                    console.log("Sending " + message + " to " + conn.peer);

                    conn.on('data', (data) => {
                        console.log("Received " + data);

                        if (data === "ok") {
                            sessionStorage.setItem("difficulty", difficulty);
                            sessionStorage.setItem("exoID", exoID);
                            setTimeout(() => {
                                window.location.href = "./game.html";
                            }, 500);
                        }
                    });

                    conn.on("close", function () {
                        console.log("Preliminary Connection closed with " + conn.peer);
                        sessionStorage.setItem("difficulty", difficulty);
                        sessionStorage.setItem("exoID", exoID);
                        setTimeout(() => {
                            window.location.href = "./game.html";
                        }, 500);
                    });

                    conn.on("error", function (err) {
                        console.error("Connection error: ", err);
                    });
                });

                conn.on("error", function (err) {
                    console.error("Connection error: ", err);
                });
                // });

                p1.on("error", function (err) {
                    console.error("Peer error: ", err);
                });

            } else {
                setTimeout(() => {
                    window.location.href = "./game.html"; // Add Jan 4 data
                }, 500);
                sessionStorage.setItem("difficulty", difficulty);
                sessionStorage.setItem(
                    "exoID",
                    exoID
                );
            }
        });

        $(".start-button").on("mouseenter", function () {
            $(this)
                .parent()
                .parent()
                .css("box-shadow", `0 0 1em ${$(this).css("border-color")}`);
        });

        $(".start-button").on("mouseleave", function () {
            $(this).parent().parent().css("box-shadow", "0 0 1em lightgray");
        });
    }

    function loadPerformanceOnDashboard() {
        let exercises = $(".exercises-done");
        for (let i = 0; i < user.perf.length && i < 5; i++) {
            let p = user.perf[i];
            exercises.html(function (_, old) {
                console.log(p);
                let difficulty = ""
                if (p.duration == 60000) {
                    difficulty = "easy"
                }
                else if (p.duration == 3 * 60000) {
                    difficulty = "medium"
                }
                else if (p.duration == 5 * 60000) {
                    difficulty = "hard"
                }
                let date = (new Date(p.date))

                let dateString = date.toLocaleDateString() + " at " + date.toLocaleTimeString()


                return (`
                    <div class="exercise-done">
                        <div class="exo-head">
                        <h3 class="">Exo ${p.exoID} for <span style="border-radius: 10px;" class="${difficulty}"></span></h3>
                        <p>${dateString}</p>
                        </div>
                        <div class="user-stats">
                            <div class="user-stat">
                                <h4>WPM</h4>
                                <p>${Math.round(p.wpm)}</p>
                            </div>
                            <div class="user-stat">
                                <h4>ACC%</h4>
                                <p>${Math.round(p.acc * 100)}</p>
                            </div>
                            <div>
                                <h4>AWPM</h4>
                                <p>${(() => { return Math.round(p.acc * p.wpm) || 0; })()}</p>
                            </div>
                        </div>
                    </div>` + old
                );
            });
        }
    }

    function loadPerformanceStatistics() {
        let exercises = $(".exercises-done");
        for (let i = 0; i < user.perf.length; i++) {
            let p = user.perf[i];
            exercises.html(function (_, old) {
                let difficulty = ""
                if (p.duration == 60000) {
                    difficulty = "easy"
                }
                else if (p.duration == 3 * 60000) {
                    difficulty = "medium"
                }
                else if (p.duration == 5 * 60000) {
                    difficulty = "hard"
                }
                let date = (new Date(p.date))

                let dateString = date.toLocaleDateString() + " at " + date.toLocaleTimeString()


                return (`
                    <div class="exercise-done">
                        <div class="exo-head">
                        <h3 class="">Exo ${p.exoID} for <span style="border-radius: 10px;" class="${difficulty}"></span></h3>
                        <p>${dateString}</p>
                        </div>
                        <div class="user-stats">
                            <div class="user-stat">
                                <h4>WPM</h4>
                                <p>${Math.round(p.wpm)}</p>
                            </div>
                            <div class="user-stat">
                                <h4>ACC%</h4>
                                <p>${Math.round(p.acc * 100)}</p>
                            </div>
                            <div class="user-stat">
                                <h4>Words</h4>
                                <p>${(() => { return p.number_of_words || 0 })()}</p>
                            </div>
                            <div>
                                <h4>AWPM</h4>
                                <p>${(() => { return Math.round(p.acc * p.wpm) || 0; })()}</p>
                            </div>
                            <div>
                                <h4>Errors</h4>
                                <p>${(() => { return Math.round(p.acc * p.wpm) || 0; })()}</p>
                            </div>
                        </div>
                            <div class="errors">
                                <h4>
                                    <span>${(() => {
                        let num_of_errors = 0;
                        let errors = Object.values(p.errors)
                        console.log(errors);

                        for (const num of errors) {
                            num_of_errors += num
                        }
                        return num_of_errors
                    })()}</span> Mistyped characters
                                </h4>
                                <div class="errors-details">
                                    ${(() => {
                        let number_of_errors = 0;
                        console.log(p.errors);
                        let string = ""
                        let chars = Object.keys(p.errors)
                        for (const c of chars) {
                            string += `<p>'${c}' : ${p.errors[c]} times</p>`
                        }
                        return string
                    })()}
                                </div>
                        </div>
                    </div>` + old
                );
            });
        }
    }

    function loadUserOnPage() {
        $(".admin-info h3").text(`${user.username}`);
        $(".admin-info h5").text(`${user.role}`);
        $(".sidebar-footer .show").text(`${user.username}`);
        $(".admin-profile img").attr("src", `${user.avatar_path}`)
        console.log($(".admin-profile img"));


        if (user.role == "Admin") {
            $(".sidebar-footer .show").text(`${user.username} Goto Dashboard`);
            $(".sidebar-footer .account").attr('href', "./admin.html")
            $(".sidebar-footer .admin-profile").on('click', () => {
                window.location.href = "./admin.html"
            })
        }
        applyTheme(user.theme)
    }

    let user = User.load();
    let db = DB.load();
    console.log(db);
    active_tab.style.visibility = "visible";
    sessionStorage.setItem("opponent", "");
    sessionStorage.setItem("initiator", "");

    loadUserOnPage();
    switch (window.location.pathname) {
        case "./dash.html":
            (() => {
                $("main h1").text(`Welcome ${user.username} !`);
                $("main, aside").css("flex", "1")

                let adminPhotos = Object.values(db.users).filter((user) => {
                    return user.role == "Admin"
                }).map(usr => usr.avatar_path)
                console.log("Admin photos", adminPhotos);

                $(".updates").html("")
                for (const r of user.recommendations) {
                    $(".updates").html($(".updates").html() + `
                        <div class="update">
                  <div class="profile-photo">
                    <img src="${(() => {
                            let photo = adminPhotos[Math.floor(Math.random() * adminPhotos.length)]
                            console.log("Photo", photo);

                            return photo
                        })()}" />
                  </div>
                  <div class="message">
                    <p>${r}</p>
                  </div>
                </div>
                    `)
                }
                activeIndex = 1;
                moveActiveTab();

                loadPerformanceOnDashboard();
                loadUserOnPage();

                initializeGauge(".avg-speed");
                initializeGauge(".avg-acc");
                initializeGauge(".avg-aspeed");

                function randomChanges() {
                    setValue(Math.random(), 70, ".avg-speed");
                    setValue(Math.random(), 100, ".avg-acc");
                    setValue(Math.random(), 100, ".avg-aspeed");
                    setTimeout(randomChanges, 1000);
                }

                setValue(user.avg_speed() / 70, 70, ".avg-speed");
                setValue(user.avg_acc(), 100, ".avg-acc");
                setValue((user.avg_acc() * user.avg_speed()) / 70, 70, ".avg-aspeed");
                // randomChanges()

                // Example data
                let timestamps = [];
                let speeds = []; // Typing speed in WPM
                let accuracies = []; // Accuracy in percentage
                let aspeeds = [];

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

                // Chart.defaults.font.size = 15
                const typingPerformanceChart = new Chart(ctx, {
                    type: "line",
                    data: {
                        labels: formattedDates, // X-axis: Dates
                        datasets: [
                            {
                                label: "Ajusted Typing Speed (WPM)",
                                data: aspeeds, // Y-axis: Adjusted typing speed
                                backgroundColor: "rgb(251, 50, 50, 0.2)",
                                borderColor: "#fb3232ff",
                                borderWidth: 2,
                                pointBackgroundColor: "hsl(0, 96.20%, 40.00%)",
                                pointRadius: 5,
                                pointHoverRadius: 7,
                                cubicInterpolationMode: "monotone",
                                tension: 0.4,
                                yAxisID: "ySpeed",
                            },
                            {
                                label: "Typing Speed (WPM)",
                                data: speeds, // Y-axis: Typing speeds
                                backgroundColor: "rgba(75, 192, 192, 0.2)",
                                borderColor: "rgba(75, 192, 192, 1)",
                                borderWidth: 2,
                                pointBackgroundColor: "hsl(180, 48.10%, 40%)",
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
                                pointBackgroundColor: "hsl(30, 100.00%, 40%)",
                                pointRadius: 5,
                                pointHoverRadius: 7,
                                cubicInterpolationMode: "monotone",
                                tension: 0.1,
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
                                    font: {
                                        size: 15,
                                        weight: "bold",
                                        family: "Poppins"
                                    },
                                },
                            },
                            ySpeed: {
                                beginAtZero: true,
                                type: "linear",
                                position: "left",
                                title: {
                                    display: true,
                                    text: "Typing Speed (WPM)",
                                    font: {
                                        family: "Poppins"
                                    },
                                },
                            },
                            yAccuracy: {
                                beginAtZero: true,
                                type: "linear",
                                position: "right",
                                title: {
                                    display: true,
                                    text: "Accuracy (%)",
                                    font: {
                                        family: "Poppins"
                                    },
                                },
                                ticks: {
                                    font: {
                                        family: "Poppins"
                                    },
                                },
                                grid: {
                                    drawOnChartArea: false, // Prevent grid lines from overlapping
                                },
                            },
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
                    typingPerformanceChart.data.datasets[2].data.push(newAccuracy); // Add new speed to speed dataset
                    typingPerformanceChart.data.datasets[1].data.push(newSpeed); // Add new accuracy to accuracy dataset
                    typingPerformanceChart.data.datasets[0].data.push(
                        (newAccuracy * newSpeed) / 100
                    ); // Add new accuracy to accuracy dataset
                    typingPerformanceChart.update(); // Refresh the chart
                }

                // setTimeout(() => {
                //     $("canvas")[0].$chartjs
                //     console.log("Chart height", $("canvas").attr({
                //         "height": "200",
                //         "width": "400",
                //     }).parent().html());
                // }, 3000)

                timestamps = user.perf.map((elt) => elt.date);
                speeds = user.perf.map((elt) => elt.wpm); // Typing speed in WPM
                accuracies = user.perf.map((elt) => elt.acc * 100); // Accuracy in percentage

                // Example: Adding a new point dynamically
                for (let i = 0; i < timestamps.length; i++) {
                    const newTimestamp = timestamps[i];
                    const newSpeed = speeds[i];
                    const newAccuracy = accuracies[i];
                    setTimeout(() => {
                        addData(newTimestamp, newSpeed, newAccuracy); // Add Jan 4 data
                    }, (i * 3000) / (timestamps.length + 1));
                }
            })();

            break;

        case "./exercises.html":
            (() => {
                activeIndex = 2;
                moveActiveTab();

                loadExercisesOnPage();
            })();
            break;
        case "./challenge.html":
            activeIndex = 3;

            moveActiveTab();
            // Declare conn outside the function
            var p1 = new Peer(user.username);

            p1.on('open', function (id) {
                console.log('Reciever peer id is ' + id);

                p1.on('connection', function (conn) {
                    alert(p1.id + " received connection from " + conn.peer);
                    conn.send("ok")

                    // Receiving a message from the connected peer
                    conn.on('data', (data) => {
                        console.log(p1.id + " received: " + data + " from " + conn.peer);

                        if (/\d/.test(data)) {
                            data = data.split(" ")

                            console.log(data);

                            let difficulty = data[2]
                            let exoID = data[1]

                            setTimeout(() => {
                                console.log("Sent connection confirmation " + exoID + " " + difficulty)
                                window.location.href = "./game.html"; // Add Jan 4 data
                            }, 5000);
                            sessionStorage.setItem("difficulty", difficulty);
                            sessionStorage.setItem("exoID", exoID);
                            sessionStorage.setItem("opponent", conn.peer)
                            sessionStorage.setItem("initiator", "")
                        }
                    });

                });
            });
            p1.on("error", function (err) {
                console.error("Peer error: ", err);
            });

            $(".challenge-form").on("submit", function (e) {
                e.preventDefault();
                let opponent = $(".username").val();
                if (opponent != user.username) {
                    opponent = $(".username").val();
                    alert("Challenge will be sent to " + opponent);
                    $(".restricted").removeClass("restricted").addClass("unrestricted");
                    sessionStorage.setItem("opponent", opponent);
                    sessionStorage.setItem("initiator", user.username);
                    loadExercisesOnPage();
                }
                else {
                    alert("You can't challenge yourself");
                }
            });

            break;
        case "./leaderboards.html":
            (() => {
                activeIndex = 4;
                moveActiveTab();

                console.log("yeah!");
                let db = DB.load();
                let users = Object.values(db.users);
                users = users.map((user) => User.loadUser(user));
                let currentUser = User.load();

                users.sort((a, b) => b.avg_aspeed() - a.avg_aspeed());
                for (let user of users) {
                    $(".users").html(function (i, old) {
                        return (old + `
                            <div class="user" id="${currentUser.username == user.username
                                ? " current-user" : ""}">
          <div class="user-data-container">
            <div class="user-info">
              <img src="${user.avatar_path}" alt="" />
              <div class="user-details">
                <h3>${currentUser.username == user.username ? "You" : user.username
                            }</h3>
                <h5>${user.role}</h5>
              </div>
            </div>
            <div class="user-stats">
              <div class="user-stat">
                <h4>AWPM</h4>
                <p>${Math.round(user.avg_aspeed())}</p>
              </div>
              <div class="user-stat">
                <h4>WPM</h4>
                <p>${Math.round(user.avg_speed())}</p>
              </div>
              <div class="user-stat">
                <h4>ACC%</h4>
                <p>${Math.round(user.avg_acc() * 100)}</p>
              </div>
              <div class="user-stat">
                <h4>Words</h4>
                <p>${(() => {
                                let numberOfWords = 0;
                                for (const p of user.perf) {
                                    numberOfWords += p.number_of_words || 0;
                                }
                                return numberOfWords;
                            })()}</p>
              </div>
              <div class="user-stat">
                <h4>Time spent</h4>
                <p>${(() => {
                                let timeSpent = 0;
                                for (const p of user.perf) {
                                    timeSpent += p.duration || 0;
                                }
                                return Math.round(timeSpent / 1000);
                            })()}s</p>
              </div>
            </div>
          </div>
          <div class="user-bio">
            <h4>Bio</h4>
            <p>${user.bio}</p>
          </div>
        </div>
                            `);
                    });
                }
            })();
            break;
        case "./statistics.html":
            (() => {
                $("main>h1").text(`History and Statistics`);
                activeIndex = 5;
                moveActiveTab();

                loadPerformanceStatistics();
                loadUserOnPage();

                initializeGauge(".avg-speed");
                initializeGauge(".avg-acc");
                initializeGauge(".avg-aspeed");

                function randomChanges() {
                    setValue(Math.random(), 70, ".avg-speed");
                    setValue(Math.random(), 100, ".avg-acc");
                    setValue(Math.random(), 100, ".avg-aspeed");
                    setTimeout(randomChanges, 1000);
                }

                setValue(user.avg_speed() / 70, 70, ".avg-speed");
                setValue(user.avg_acc(), 100, ".avg-acc");
                setValue((user.avg_acc() * user.avg_speed()) / 70, 70, ".avg-aspeed");
                // randomChanges()

                // Example data
                let timestamps = [];
                let speeds = []; // Typing speed in WPM
                let accuracies = []; // Accuracy in percentage
                let aspeeds = [];

                // Convert timestamps to readable dates
                const formattedDates = timestamps.map((ts) => {
                    const date = new Date(ts);
                    return date.toDateString();
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
                                label: "Ajusted Typing Speed (WPM)",
                                data: aspeeds, // Y-axis: Adjusted typing speed
                                backgroundColor: "rgb(251, 50, 50, 0.2)",
                                borderColor: "#fb3232ff",
                                borderWidth: 2,
                                pointBackgroundColor: "hsl(0, 96.20%, 40.00%)",
                                pointRadius: 5,
                                pointHoverRadius: 7,
                                cubicInterpolationMode: "monotone",
                                tension: 0.4,
                                yAxisID: "ySpeed",
                            },
                            {
                                label: "Typing Speed (WPM)",
                                data: speeds, // Y-axis: Typing speeds
                                backgroundColor: "rgba(75, 192, 192, 0.2)",
                                borderColor: "rgba(75, 192, 192, 1)",
                                borderWidth: 2,
                                pointBackgroundColor: "hsl(180, 48.10%, 40%)",
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
                                pointBackgroundColor: "hsl(30, 100.00%, 40%)",
                                pointRadius: 5,
                                pointHoverRadius: 7,
                                cubicInterpolationMode: "monotone",
                                tension: 0.1,
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
                                ticks: {
                                    font: {
                                        family: "Poppins"
                                    },
                                },
                                title: {
                                    display: true,
                                    text: "Date",
                                    font: {
                                        size: 15,
                                        family: "Poppins"
                                    },
                                },
                            },
                            ySpeed: {
                                beginAtZero: true,
                                type: "linear",
                                position: "left",
                                title: {
                                    display: true,
                                    text: "Typing Speed (WPM)",
                                    font: {
                                        family: "Poppins"
                                    },
                                },
                            },
                            yAccuracy: {
                                beginAtZero: true,
                                type: "linear",
                                position: "right",
                                title: {
                                    display: true,
                                    text: "Accuracy (%)",
                                    font: {
                                        family: "Poppins"
                                    },
                                },
                                ticks: {
                                    font: {
                                        family: "Poppins"
                                    },
                                },
                                grid: {
                                    drawOnChartArea: false, // Prevent grid lines from overlapping
                                },
                            },
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
                    typingPerformanceChart.data.datasets[2].data.push(newAccuracy); // Add new speed to speed dataset
                    typingPerformanceChart.data.datasets[1].data.push(newSpeed); // Add new accuracy to accuracy dataset
                    typingPerformanceChart.data.datasets[0].data.push(
                        (newAccuracy * newSpeed) / 100
                    ); // Add new accuracy to accuracy dataset
                    typingPerformanceChart.update(); // Refresh the chart
                }

                // setTimeout(() => {
                //     $("canvas")[0].$chartjs
                //     console.log("Chart height", $("canvas").attr({
                //         "height": "200",
                //         "width": "400",
                //     }).parent().html());
                // }, 3000)

                timestamps = user.perf.map((elt) => elt.date);
                speeds = user.perf.map((elt) => elt.wpm); // Typing speed in WPM
                accuracies = user.perf.map((elt) => elt.acc * 100); // Accuracy in percentage

                // Example: Adding a new point dynamically
                for (let i = 0; i < timestamps.length; i++) {
                    const newTimestamp = timestamps[i];
                    const newSpeed = speeds[i];
                    const newAccuracy = accuracies[i];
                    setTimeout(() => {
                        addData(newTimestamp, newSpeed, newAccuracy); // Add Jan 4 data
                    }, (i * 3000) / (timestamps.length + 1));
                }


                // Data containers for the chart
                let characters = []; // Array of characters
                let number_of_errors = []; // Array of number of errors

                // Initialize Chart.js
                const error_ctx = document
                    .getElementById("typingErrorsChart")
                    .getContext("2d");

                const typingErrorsChart = new Chart(error_ctx, {
                    type: "bar",
                    data: {
                        labels: characters, // X-axis: Dates
                        datasets: [
                            {
                                label: "Character",
                                data: number_of_errors, // Y-axis: number of errors
                                backgroundColor: "rgb(251, 50, 50, 0.2)",
                                borderColor: "#fb3232ff",
                                borderWidth: 1,
                                pointBackgroundColor: "hsl(0, 96.20%, 40.00%)",
                                yAxisID: "ynum_of_errors",
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            tooltip: {
                                enabled: true,
                                callbacks: {
                                    // Display metrics in the tooltip
                                    label: (context) => {
                                        const datasetLabel = context.dataset.label;
                                        const value = context.raw;
                                        return `Errors: ${value}`;
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
                                title: {
                                    display: true,
                                    text: "Character",
                                    font: {
                                        size: 15,
                                        weight: "bold",
                                        family: "Poppins"
                                    },
                                },
                                ticks: {
                                    font: {
                                        family: "Poppins"
                                    },
                                    maxRotation: 0, minRotation: 0,
                                }
                            },

                            // Defining the y axis
                            ynum_of_errors: {
                                beginAtZero: true,
                                type: "linear",
                                position: "left",
                                title: {
                                    display: true,
                                    text: "Number of Errors",
                                    font: {
                                        family: "Poppins"
                                    },
                                },
                                ticks: {
                                    font: {
                                        family: "Poppins"
                                    },
                                },
                            },
                        },
                    },
                });

                $("#typingErrorsChart")
                    .parent().parent().parent().css("margin-bottom", "2em")

                // Dynamically update the chart
                function addErrorData(newCharacter, newNumber) {
                    typingErrorsChart.data.labels.push(`'${newCharacter}'`); // Add new date to x-axis
                    typingErrorsChart.data.datasets[0].data.push(newNumber); // Add new speed to speed dataset
                    // Add new number to number of errors dataset
                    typingErrorsChart.update(); // Refresh the chart
                }

                // setTimeout(() => {
                //     $("canvas")[0].$chartjs
                //     console.log("Chart height", $("canvas").attr({
                //         "height": "200",
                //         "width": "400",
                //     }).parent().html());
                // }, 3000)

                // Retrieve all characters from the user's performance
                characters = (() => {

                    let chars = new Set();
                    for (let p of user.perf) {
                        for (const char of Object.keys(p.errors)) {
                            chars.add(char)
                        }
                    }
                    chars = Array.from(chars).sort()
                    return chars
                })()

                // Retrive the corresponding numbers of errors for each character
                number_of_errors = (() => {
                    let result = Array(characters.length).fill(0)
                    console.log(characters.length);
                    let errors_array = user.perf.map((elt) => elt.errors);
                    for (let i = 0; i < result.length; i++) {
                        for (const e of errors_array) {
                            for (const c of Object.keys(e)) {
                                if (c == characters[i]) {
                                    result[i] += e[c] // Add the number of errors of the character
                                }
                            }
                        }
                    }
                    console.log(result);

                    return result
                })()

                // Example: Adding a new point dynamically
                for (let i = 0; i < characters.length; i++) {
                    console.log("dsfsdaf");

                    const char = characters[i];
                    const num = number_of_errors[i];
                    setTimeout(() => {
                        addErrorData(char, num); // Add a char and a num
                    }, (i * 3000) / (characters.length + 1));
                }
            })()
            break

        case "./settings.html":
            (() => {
                activeIndex = 6;
                moveActiveTab();

                function saveProfileChanges(event) {
                    event.preventDefault();

                    const email = document.getElementById('profileEmail').value;
                    const currentPassword = document.getElementById('currentPassword').value;
                    const newPassword = document.getElementById('newPassword').value;
                    const confirmPassword = document.getElementById('confirmPassword').value;

                    let user = User.load()
                    let db = DB.load()
                    if (currentPassword) {
                        if (currentPassword != user.password) {
                            alert('Current password is incorrect');
                            return;
                        }
                        if (newPassword != confirmPassword) {
                            alert('New passwords do not match');
                            return;
                        }
                        user.password = newPassword
                        alert("Password changed")
                    }
                    user.email = email
                    db.users[user.username] = user
                    sessionStorage.setItem("user", JSON.stringify(user))
                    console.log(sessionStorage.getItem("user"));
                    
                    db.save()
                    console.log(user);
                }

                function editProfile() {
                    let user = User.load()
                    const profileContent = document.getElementById('profileContent');
                    profileContent.innerHTML = `
                        <form id="profileForm" onsubmit="saveProfileChanges(event)">
                            <div class="form-group">
                                <label>Email:</label>
                                <input type="email" id="profileEmail" value="${user.email}" required>
                            </div>
                            <div class="form-group">
                                <label>Current Password:</label>
                                <input type="password" id="currentPassword">
                            </div>
                            <div class="form-group">
                                <label>New Password:</label>
                                <input type="password" id="newPassword">
                            </div>
                            <div class="form-group">
                                <label>Confirm New Password:</label>
                                <input type="password" id="confirmPassword">
                            </div>
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                            <button type="button" class="btn btn-danger">Cancel</button>
                        </form>
                    `;

                    $("#profileForm button").ready(function () {
                        $("#profileForm .btn-danger").on("click", displayProfile)
                    })
                    $("#profileForm button").ready(function () {
                        $("#profileForm .btn-primary").on("click", saveProfileChanges)
                    })
                }

                function saveProfileSettings() {
                    let db = DB.load()
                    const profileData = {
                        bio: document.getElementById('userBio').value,
                        theme: document.getElementById('userTheme').value,
                    };

                    let user = User.load()
                    user.bio = profileData.bio
                    user.theme = profileData.theme
                    db.users[user.username] = user
                    db.save()
                    sessionStorage.setItem("user", JSON.stringify(user))
                    console.log("Settings saved");


                    // if (updateProfile(profileData)) {
                    //     logUserActivity('profile_update', 'Updated profile settings');
                    //     alert('Profile settings saved successfully');
                    //     displayProfile();
                    // } else {
                    //     alert('Failed to save profile settings');
                    // }
                }
                // Profile picture handling
                function handleProfilePictureUpload(event) {
                    const file = event.target.files[0];
                    if (file) {
                        console.log(file);

                        if (file.size > 10 * 1024 * 1024) { // 5MB limit
                            alert('File size must be less than 5MB');
                            return;
                        }

                        const reader = new FileReader();
                        reader.onload = function (e) {
                            console.log(e);

                            const base64Image = e.target.result;
                            console.log(base64Image);

                            // updateProfile({ profilePicture: base64Image });
                            let user = User.load()
                            user.avatar_path = base64Image
                            document.getElementById('profilePicture').src = base64Image;
                            let db = DB.load()
                            db.users[user.username] = user
                            db.save()
                            sessionStorage.setItem("user", JSON.stringify(user))
                            console.log(db);
                        };
                        reader.readAsDataURL(file);
                    }
                }
                function displayProfile() {
                    console.log(sessionStorage.getItem("user"));
                    
                    let user = User.load()
                    console.log(user);
                    
                    const profileContent = document.getElementById('profileContent');
                    const defaultTheme = 'light';
                    profileContent.innerHTML = `
                    <div class="profile-header">
                    <div class="profile-picture-container">
                        <img id="profilePicture" src="${user.avatar_path || '../landing/16.jpeg'}"
                             alt="Profile Picture" class="profile-picture">
                        <div class="profile-picture-overlay">
                            <label for="profilePictureInput" class="upload-label">
                                <i class="fas fa-camera"></i> Change Photo
                            </label>
                            <input type="file" id="profilePictureInput" accept="image/*" onchange="console.log('fjfgjhfjhfhjfhfhj')" style="display: none">
                        </div>
                    </div>
                    <div class="profile-info">
                        <h3>${user.username}</h3>
                        <p>${user.email}</p>
                        <p class="user-role">${user.role == "Admin" ? 'Administrator' : 'User'}</p>
                    </div>
                </div>
                
                <div class="profile-customization">
                    <h3>Profile Settings</h3>
                    <div class="form-group">
                        <label>Bio:</label>
                        <textarea id="userBio" class="form-control" rows="3">${user.bio || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Theme:</label>
                        <select id="userTheme" class="form-control">
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </div>
                    <button class="btn btn-primary" id="saveProfileSettings">Save Settings</button>
                </div>
                
                <div class="profile-stats">
                    <div class="stat-card">
                        <h3>Join Date</h3>
                        <p>${new Date(user.join_date).toDateString()}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Last Active</h3>
                        <p>${new Date(user.last_login_date).toDateString()}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Exercises Completed</h3>
                        <p>${user.perf.length || 0}</p>
                    </div>
                </div>
                `;

                    $("#saveProfileSettings").ready(() => {
                        $("#saveProfileSettings").on("click", saveProfileSettings)
                    })

                    console.log($("#profilePictureInput"));
                    $("#profilePictureInput").ready(() => {
                        console.log($("#profilePictureInput"));

                        $("#profilePictureInput").change(function (e) {
                            e.preventDefault();
                            console.log(e);

                            handleProfilePictureUpload(e)
                        });
                    })
                    // Apply theme
                    applyTheme(user.theme || defaultTheme);
                }
                displayProfile()

                $("#editProfile").on("click", editProfile)

                $("head").html($("head").html() + `<link rel="stylesheet" href="./admin.css"/>`)
            })()
            break
        default:
            break;
    }

    function applyTheme(theme) {
        if (theme == "light") {
            document.body.classList.remove("dark-theme-variables");
            $(".theme").addClass("active");
            $(".theme1").removeClass("active");
            console.log("Set light logo");
        } else {
            document.body.classList.add("dark-theme-variables");
            $(".theme").removeClass("active");
            $(".theme1").addClass("active");
            console.log("Set dark logo");
        }
    }

});


