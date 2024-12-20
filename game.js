// Generate interesting words for the game
const words = `Once upon a time, there was a cat. The cat was gray. It loved to play. It chased mice. It ran fast. The sun was up. The sky was blue. The cat felt happy.

One day, the cat saw a bird. The bird was small and red. It flew high. The cat wanted to catch it. So, it climbed a tree. The tree was tall. The cat slipped and fell. It landed on the ground. The bird flew away.

In the garden, there were many flowers. The flowers had bright colors. Red, yellow, blue, and pink. Bees buzzed around the flowers. Butterflies flitted from petal to petal. The garden was lively.

As the cat wandered, it found a hidden path. Curious, it followed the path. The path led to a secret place. There was a small pond. Fish swam in the pond. Frogs croaked by the edge. The cat dipped its paw in the water.

Suddenly, it heard a noise. It was a dog. The dog was big and brown. It barked loudly. The cat ran away quickly. It jumped over rocks and logs. The dog chased the cat. But the cat was too fast.

The cat hid in a bush. The dog couldn't find it. The cat waited until the dog left. It then came out carefully. The sun was setting. The sky turned orange and pink. The cat decided to go home.

On the way back, the cat saw its friend. The friend was a rabbit. The rabbit had long ears. They played together. They jumped and hopped. They had fun until it got dark.

Back at home, the cat felt tired. It curled up in its bed. The moon shone brightly in the sky. Stars twinkled like diamonds. The cat closed its eyes. It dreamed of more adventures.`.split(' '); // Split the text into words
const gameTime = 120 * 1000; // 1 minute

$("#Type-again-button").on("click", () => {
    speed = 0
    acc = 0
    pauseTime = 0
    $("#game, .game-container").removeClass("over")
    offset = 0
    $("#words").css("margin-top", "auto")
    newGame()
})

$(".timer").text(`Exercise time: ${Math.round(gameTime / 1000)}s`)

window.timer = null;
window.gameStart = null;
let speed = 0
let acc = 0
let pauseTime = 0
let offset = 0
const errors = {};

function newGame() {
    // Reset the words
    $("#words").html('<div id="cursor"></div>');

    // Generate random words
    for (let i = 0; i < 200; i++) {
        // Append a new word to the text
        $("#words").html($("#words").html() + formatWord(words[i]));
    }
    $(".word").each(function () {
        $(this).children().first().addClass("firstLetterOfWord")
    });

    // Set the first letter as the current letter
    $(".word")
        .first().addClass("current")
        .children().first().addClass("current");
}

function gameOver() {
    clearInterval(window.timer)
    $("#game, .game-container").addClass("over")
    window.gameStart = null
    window.timer = null
}

function randomWord() {
    return words[Math.floor(Math.random() * words.length)];
}
function formatWord(word) {
    // Put in a span with the class .word 
    return `<span class="word"><span class="letter">${word
        .split("")
        .join('</span><span class="letter">')}</span></span>`; // Put all letter in seperate spans
}


$("#game").keyup(function (event) {
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
    if (key !== expected) {
        if (expected in errors) {
            errors[expected]++
        } else {
            errors[expected] = 1
        }
        console.log("Errors: ", errors);
    }

    if (!window.timer && isLetter) {
        window.timer = setInterval(() => {
            if (!window.gameStart) {
                window.gameStart = (new Date()).getTime()
            }
            const timePassed = (new Date()).getTime() - window.gameStart - pauseTime
            const timePassedInMinutes = (timePassed + 100) / 60000
            const numCorrect = $(".correct").length
            const numIncorrect = $(".incorrect").length + $(".extra").length
            speed = (numCorrect + numIncorrect) / (timePassedInMinutes * 5)
            acc = numCorrect / (numCorrect + numIncorrect)
            setValue(speed / 200, 200, ".speed-gauge")
            setValue(acc, 100, ".acc-gauge")
            $(".timer").text(`Time left: ${Math.round((gameTime - timePassed) / 1000)}s`)
            if (!$("#game:focus").length) {
                pauseTime += 200
                console.log(pauseTime);
            }
            if (timePassed >= gameTime) {
                gameOver()
            }
        }, 200)
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
    let cursor = $("#cursor")
    currentLetter = $(".letter.current")
    currentWord = $(".word.current")
    if (currentLetter.text()) {
        // Place the cursor just before the current letter
        cursor
            .css("left", currentLetter.position().left - 3)
            .css("top", currentLetter.position().top + 3)
        console.log("cursor: ", cursor.position());
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
    console.log(distaceToBottom);
    console.log("Line height", lineheight);
    if (distaceToBottom >= 0) {
        offset += lineheight
        const words = $("#words")
        words.css("margin-top", `${words.css("margin-top").replace("px", "") - lineheight}px`)
        console.log(words.css("margin-top"));
    }
});


initializeGauge(".speed-gauge")
initializeGauge(".acc-gauge")

newGame();

