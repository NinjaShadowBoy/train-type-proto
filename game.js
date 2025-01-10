import { DB, User, ExerciseDone } from "./model.js"

let db = DB.load()
let user = User.load()
let exoID = Number(sessionStorage.getItem("exoID"))
let difficulty = sessionStorage.getItem("difficulty")
let opponent = sessionStorage.getItem("opponent")
let initiator = sessionStorage.getItem("initiator")

let cursor = $("#cursor")
let opponent_cursor = $("#opponent-cursor")

let youCanStart = false

let opponent_position = 0

if (initiator) {
    var peer = new Peer(user.username);

    peer.on('open', function (id) {
        console.log('My id is ' + id);

        // Connecting to op
        let opponent_id = opponent;
        let conn = peer.connect(opponent_id);
        console.log(conn);

        conn.on('open', function () {
            alert(peer.id + " connected to " + opponent_id);

            // Sending a message to op
            conn.send(exoID + " " + difficulty);

            // runTimer() 

            // Receiving a message from op
            conn.on('data', (data) => {
                console.log(peer.id + " received:" + data);

                if (opponent) {
                    let opponent_cursor = $("#opponent-cursor")
                }

                if (data == "space") {
                    opponent_position += 1

                    let opponent_word = $("#words")[opponent_position]
                    opponent_cursor
                        .css("left", opponent_word.position().left - 3)
                        .css("top", opponent_word.position().top + 3)
                }

                if (data == "ok") {
                    peer = new Peer(user.username);


                    peer.on('open', function (id) {
                        console.log('My id is ' + id);

                        // Connecting to op
                        conn = peer.connect(opponent_id);
                        console.log(conn);

                        conn.on('open', function () {
                            alert(peer.id + " connected to " + opponent_id);
                            youCanStart = true

                            // Sending a message to op
                            conn.send(exoID + " " + difficulty);
                            runTimer()

                            // Receiving a message from op
                            conn.on('data', (data) => {
                                console.log(peer.id + " received:" + data);

                                if (opponent) {
                                    let opponent_cursor = $("#opponent-cursor")
                                }

                                if (data == "space") {
                                    opponent_position += 1

                                    let opponent_word = $("#words")[opponent_position]
                                    opponent_cursor
                                        .css("left", opponent_word.position().left - 3)
                                        .css("top", opponent_word.position().top + 3)
                                }

                                if (data == "ok") {
                                    peer = new Peer(user.username);
                                    youCanStart = true
                                }
                            });
                        });
                    });
                }
            });
        });
    });
} else if (opponent) {
    var p1 = new Peer(user.username);

    p1.on('open', function (id) {
        console.log('My id is ' + id);
        runTimer()

        p1.on('connection', function (conn) {
            alert(p1.id + " received connection from " + conn.peer);
            youCanStart = true

            // Sending a message to the connected peer
            // conn.send("Hello from " + p1.id);

            // Receiving a message from the connected peer
            conn.on('data', (data) => {
                console.log(p1.id + " received: " + data);


                if (data == "space") {
                    opponent_position += 1

                    let opponent_word = $("#words")[opponent_position]
                    opponent_cursor
                        .css("left", opponent_word.position().left - 3)
                        .css("top", opponent_word.position().top + 3)
                }
            });
        });
    });
} else {
    youCanStart = true
}


// Generate interesting words for the game
const words = db.getExo(exoID).text.split(/\s+/)
console.log(words);

let duration = 0; // 0 minute
switch (difficulty) {
    case "hard":
        duration = 5 * 60000 // 5 minutes
        break;
    case "medium":
        duration = 3 * 60000 // 3 minutes
        break;
    default:
        duration = 1 * 60000 // 1 minute
        break;
}

$("#Type-again-button").on("click", () => {
    speed = 0
    acc = 0
    pauseTime = 0
    $("#game, .game-container").removeClass("over")
    offset = 0
    $("#words").css("margin-top", "auto")
    newGame()
})

$(".timer").text(`Exercise time: ${Math.round(duration / 1000)}s`)

window.timer = null;
window.gameStart = null;
let speed = 0
let acc = 0
let pauseTime = 0
let offset = 0
let number_of_words = 0
let number_of_wrong_words = 0
let date = 0

const errors = {};

function newGame() {
    $(".results").css("visibility", "hidden")
    $(".results").css("margin", "-6.2rem")
    // Reset the words
    $("#words").html(opponent ? `<div id="cursor"></div><div id="opponent-cursor"></div>` : '<div id="cursor"></div>');

    // Generate random words
    for (const word of words) {
        // Append a new word to the text
        $("#words").html($("#words").html() + formatWord(word));
    }

    $(".word").each(function () {
        $(this).children().first().addClass("firstLetterOfWord")
    });

    // Set the first letter as the current letter
    $(".word")
        .first().addClass("current")
        .children().first().addClass("current");
}

function runTimer() {
    window.timer = setInterval(() => {
        if (!window.gameStart) {
            window.gameStart = (new Date()).getTime()
        }
        const timePassed = (new Date()).getTime() - window.gameStart - pauseTime
        const timePassedInMinutes = (timePassed + 100) / 60000
        const numCorrect = $(".letter.correct").length
        const numIncorrect = $(".letter.incorrect").length + $(".extra").length
        speed = (numCorrect + numIncorrect) / (timePassedInMinutes * 5)
        acc = numCorrect / (numCorrect + numIncorrect)
        setValue(speed / 70, 70, ".speed-gauge")
        setValue(acc, 100, ".acc-gauge")
        $(".timer").text(`Time left: ${Math.round((duration - timePassed) / 1000)}s`)
        if (!$("#game:focus").length && !opponent) {
            pauseTime += 200
            // console.log(pauseTime);
        }
        if (timePassed >= duration) {
            gameOver()
        }
    }, 200)
}

function gameOver() {
    clearInterval(window.timer)
    date = Number(new Date())

    $(".results").css("visibility", "visible")
    $(".results").css("margin", "0")

    setValue(speed * acc / 70, 70, ".aspeed-gauge")
    number_of_wrong_words = $(".word.underlined").length

    let number_of_errors = 0
    for (const letter of Object.keys(errors)) {
        number_of_errors += errors[letter]
        $(".errors-details").html($(".errors-details").html() + `<p>'${letter}': ${errors[letter]} times</p>`)
    }

    $(".words-typed").html(`<span>${number_of_words}</span> ` + $(".words-typed").html())
    $(".correctly").html(`<span class="correct">${number_of_words - number_of_wrong_words}</span> ` + $(".correctly").html())
    $(".incorrectly").html(`<span class="incorrect">${number_of_wrong_words}</span> ` + $(".incorrectly").html())
    $(".number_of_errors").text(number_of_errors)

    $("#game, .game-container").addClass("over")
    window.gameStart = null
    window.timer = null
    let exoDone = new ExerciseDone(date, exoID, speed, acc, errors, duration, number_of_words, number_of_wrong_words)
    console.log("Exo done ", exoDone);
    user.addToPerformance(exoDone)
    db.exos[exoID].timesAttempted++
    db.setUser(user)
    sessionStorage.setItem("user", JSON.stringify(user))
    db.save()
}

function randomWord() {
    return words[Math.floor(Math.random() * words.length)];
}
function formatWord(word) {
    // Put in a span with the class .word 
    return `<span class="word"><span class="letter">${word.split("").join('</span><span class="letter">')}</span></span>`; // Put all letter in seperate spans
}


$("#game").keyup(function (event) {
    if (youCanStart) {
        console.log($("#words").children().length);
        console.log(event);


        if ($("#game.over").length) {
            return
        }
        const key = event.key;
        let currentLetter = $(".letter.current")
        let currentWord = $(".word.current")
        const expected = currentLetter.text() || ' ';
        // console.log(`Expected '${expected}', got '${key}'`);



        // if key is not 'backspace' and not ' '
        const isLetter = key.length === 1 && key !== ' ';
        const isSpace = key === ' '
        const isBackSpace = key === 'Backspace'
        if (key !== expected && (isLetter || isSpace)) {
            if (expected in errors) {
                errors[expected]++
            } else {
                errors[expected] = 1
            }
            console.log("Errors: ", errors);
        }

        if (!window.timer && isLetter) {
            // FIrst letter to be typed since timer is not started
            runTimer()
        }

        if (isLetter) {
            // If current letter is not inexisting
            if (currentLetter.text()) {
                currentLetter.addClass(key !== expected ? "incorrect" : "correct").removeClass("current")
                if (currentLetter.next()) {
                    currentLetter.next().addClass("current")
                }
            } else {
                // If current letter is null it means that we are at the 
                // end of the word and the user is typing extra wrong letters
                const incorectLetter = `<span class="letter incorrect extra">${key}</span>`
                currentWord.html(currentWord.html() + incorectLetter)
                console.log("Extra letter typed");

            }
        } else if (isSpace && window.timer) {
            number_of_words++
            if (expected !== ' ') {
                const lettersToInvalidate = $(".word.current .letter:not(.correct)")

                lettersToInvalidate.addClass("incorrect").removeClass("current")
            }
            // Underlined mistyped word
            if (currentWord.children().hasClass("incorrect")) {
                currentWord.addClass("underlined")
            }
            currentWord
                .removeClass("current")
                .next().addClass("current")
                .children().first().addClass("current")
            if (currentWord.next().length === 0) {
                gameOver()
            }

            if (!initiator && opponent) {
                p1.send("space");
            } else if (opponent) {
                peer.send("space");
            }
        } else if (isBackSpace) {
            // You cannot rectify a word you already entered
            if (!currentLetter.hasClass("firstLetterOfWord")) {
                if (currentLetter.text()) {
                    // If you are not at the end of a word
                    currentLetter
                        .removeClass("current")
                        .prev().removeClass("correct incorrect")
                        .addClass("current")
                } else {
                    // If you are at the end of the word
                    currentWord
                        .children().last().removeClass("correct incorrect")
                        .addClass("current")
                }
                const lastExtra = $(".current.extra").remove()
            }
        }

        // Move the cursor to the next letter

        currentLetter = $(".letter.current")
        currentWord = $(".word.current")
        if (currentLetter.text()) {
            // Place the cursor just before the current letter
            cursor
                .css("left", currentLetter.position().left - 3)
                .css("top", currentLetter.position().top + 3)


            // console.log("cursor: ", cursor.position());
        } else {
            // If there is no current letter it means you are at the end of a word
            // so place the cursor at end of the current word
            const lastLetter = currentWord.children().last()
            cursor
                .css("left", lastLetter.position().left + lastLetter.width())
                .css("top", lastLetter.position().top)
        }

        // Move lines of words up
        const lineheight = parseInt($("#game").css("line-height").replace("px", ""))
        const distaceToBottom = (currentWord.position().top - $("#game").height() + lineheight - offset)
        // console.log(distaceToBottom);
        // console.log("Line height", lineheight);
        if (distaceToBottom >= 0) {
            offset += lineheight
            const words = $("#words")
            words.css("margin-top", `${words.css("margin-top").replace("px", "") - lineheight}px`)
            // console.log(words.css("margin-top"));
        }
    }
});


initializeGauge(".speed-gauge")
initializeGauge(".acc-gauge")

newGame();

