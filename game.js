// Generate interesting words for the game
const words =
    `Lorem ipsum dolor, sit amet consectetur adipisicing elit.`.split(' '); // Split the text into words
const gameTime = 60 * 1000; // 1 minute
window.timer = null;
window.gameStart = null;


function newGame() {
    // Reset the words
    $("#words").html('<div id="cursor"></div>');

    // Generate random words
    for (let i = 0; i < 200; i++) {
        // Append a new word to the text
        $("#words").html($("#words").html() + formatWord(randomWord()));
    }
    $(".word").each(function () {
        $(this).children().first().addClass("firstLetterOfWord")
    });

    // Set the first letter as the current letter
    $(".word")
        .first().addClass("current")
        .children().first().addClass("current");
    window.timer = null;
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


let offset = 0
$("#game").keyup(function (event) {
    const key = event.key;
    let currentLetter = $(".letter.current")
    let currentWord = $(".word.current")
    const expected = currentLetter.text() || ' ';
    // console.log(`Expected '${expected}', got '${key}'`);


    // if key is not 'backspace' and not ' '
    const isLetter = key.length === 1 && key !== ' ';
    const isSpace = key === ' '
    const isBackSpace = key === 'Backspace'
        
    if (!window.timer && isLetter) {
        window.timer = setInterval(() => {
            if (!window.gameStart) {
                window.gameStart = (new Date()).getTime()
            }
        }, 1000)
        alert("Start timer")
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
    } else if (isSpace) {
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
            .css("left", currentLetter.position().left)
            .css("top", currentLetter.position().top)
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

function infiniteRandomChange() {
    setValue(Math.random(), 200, ".speed-gauge")
    setValue(Math.random(), 100, ".acc-gauge")
    setTimeout(function () {
        infiniteRandomChange()
    }, 1000)
}
initializeGauge(".speed-gauge")
initializeGauge(".acc-gauge")
infiniteRandomChange()

newGame();

