import puzzleLogic from "./puzzleLogic.js";
import play from "./sound.js";


let game, startGridItem,
    selectedGridItem = [],
    currentWord = "",
    currentOrientation,
    wordList = [],
    score = 0,
    difficultyLevel,
    totalPlayedSeconds = 0,
    interval,
    category,
    foundWordSound,
    completedGameSound,
    letterSelectedSound;

/**
 * 
 * Generate puzzle based on settings given by puzzlePlay.js
 * Draw the puzzle with the returned puzzle from puzzleLogic.js
 * Add event listeners to each grid square.
 * Display word list for user to find them.
 * Start timer and Set listener for New Game button.
 * 
 * @param {Obkect} htmlContainer 
 * @param {Array} wordList 
 * @param {Object} settings 
 */
const generateUIForPuzzle = (htmlContainer, wordList, settings) => {
    difficultyLevel = settings.level;
    category = settings.category;
    game = new puzzleLogic.PuzzleLogic(wordList, settings);
    foundWordSound = new play.sound("assets/sounds/foundword.wav");
    letterSelectedSound = new play.sound("assets/sounds/selectedletter.wav");
    completedGameSound = new play.sound("assets/sounds/wongame.wav");
    drawPuzzle(htmlContainer, game.puzzle, wordList);
    addTimerAndScoreUI();
    addEventListenersToGrid();
    displayWordList(wordList);
    setTimeout(() => {
        startTimer();
    }, 3000);
    newGame();
};

/**
 * It add the timer UI on the navbar.
 */
const addTimerAndScoreUI = () => {
    const timerAndScore = document.querySelector("#navBarTimerAndScore");
    let output = "";
    output += `<li>`;
    output += `<label class="uk-margin-left"><button class="uk-button uk-button-primary category" id="newGame">New Game</button></label >`;
    output += `</li>`;
    output += `<li>`;
    output += `<label class="uk-margin-left uk-margin-top uk-text-center" id="timeElement">` + `Timer: ` + `<label id="minutes">` + `00` + `</label>` + `:` + `<label id="seconds">` + `00` + `  </label>` + `</label >`;
    output += `</li>`;
    output += `<li>`;
    output += `<label class="uk-margin-left uk-margin-top uk-text-center" id = "scoreElement" > Score: <label id="score">0</label></label >`;
    output += `</li>`;
    timerAndScore.innerHTML = output;
}

/**
 * It is called when a New Game button is clicked
 * then reloads the page.
 */
const newGame = () => {
    const newGame = document.querySelector("#newGame");
    newGame.addEventListener("click", () => {
        location.reload();
    });
}

/**
 * Draw a puzzle using CSS variables and funtions,
 * also add animation.
 * 
 * @param {Object} el 
 * @param {Array} puzzle 
 * @param {Array} words 
 */
const drawPuzzle = (el, puzzle, words) => {
    wordList = [...words];
    while (el.firstChild) {
        el.removeChild(el.previousChild);
    }
    for (let i = 0, height = puzzle.length; i < height; i++) {
        el.style.setProperty("--grid-rows", puzzle.length);
        let row = puzzle[i];
        for (let j = 0, width = row.length; j < width; j++) {
            el.style.setProperty("--grid-cols", row.length);
            let divElement = document.createElement("div");
            divElement.setAttribute("x", j);
            divElement.setAttribute("y", i);
            divElement.classList.add("uk-box-shadow-large")
            divElement.innerText = row[j] || "&nbsp;";
            divElement.className = "grid-item";
            el.appendChild(divElement);
        }
    }
    el.setAttribute("uk-scrollspy", "target: > div; cls: uk-animation-fade ; delay: 10");
};

const addEventListenersToGrid = () => {
    document.querySelectorAll('.grid-item').forEach(item => {
        if (window.navigator.msPointerEnabled) {
            item.addEventListener('pointerdown', startGameTurn);
            item.addEventListener('pointerover', selectingSquares);
            item.addEventListener('pointerdown', endGameTurn);
        } else {
            item.addEventListener('mousedown', startGameTurn);
            item.addEventListener('mouseenter', mouseMovement);
            item.addEventListener('mouseup', endGameTurn)
            item.addEventListener('touchstart', startGameTurn);
            item.addEventListener('touchmove', touchMovement);
            item.addEventListener('touchend', endGameTurn);
        }
    });
}

/**
 * Get coordinates that was generated via event listeners and return 
 * which orientation the user inputs.
 * 
 * @param {Number} x1 
 * @param {Number} y1 
 * @param {Number} x2 
 * @param {Number} y2 
 */
const calculateOrientation = (x1, y1, x2, y2) => {
    for (let orientation in game.orientations) {
        let nextFn = game.orientations[orientation];
        let nextPos = nextFn(x1, y1, 1);
        if (nextPos.x === x2 && nextPos.y === y2) {
            return orientation;
        }
    }
    return null;
};

/**
 * Called when user starts touch or click events.
 * Save element for later use.
 * 
 * @param {Object} event 
 */
const startGameTurn = (event) => {
    event.target.className += " selected";
    playLetterSelectedSound();
    startGridItem = event.target;
    selectedGridItem.push(event.target);
    currentWord = event.target.innerText;
};

/**
 * 
 * This function will keep track of letters as the user clicks
 * and moves the mouse or touch across. It keeps track of all letters
 * when user is still selecting. If user clicks in one letter
 * the next letter will only be highlighted if that letter will form the word required,
 * meaning ywhen you are selecting letters from a starting point it wont allow
 * unless it is a word meant to be selected. Also, calls on function to calculate orientation
 * if the orientation is wrong it wont hightlight it. If orientations are fine then it will add
 * html class selected which in turn changes the letter colour. 
 * 
 * @param {Object} targetElement 
 */
const selectingSquares = (targetElement) => {
    if (!startGridItem) {
        return;
    }
    let previousSquare = selectedGridItem[selectedGridItem.length - 1];
    if (previousSquare == targetElement) {
        return;
    }
    let backToPreviousSquare;
    for (let i = 0, len = selectedGridItem.length; i < len; i++) {
        if (selectedGridItem[i] == targetElement) {
            backToPreviousSquare = i + 1;
            break;
        }
    }
    while (backToPreviousSquare < selectedGridItem.length) {
        selectedGridItem[selectedGridItem.length - 1].classList.remove("selected");
        selectedGridItem.splice(backToPreviousSquare, 1);
        currentWord = currentWord.substr(0, currentWord.length - 1);
    }
    let newOrientation = calculateOrientation(
        startGridItem.getAttribute("x") - 0,
        startGridItem.getAttribute("y") - 0,
        targetElement.getAttribute("x") - 0,
        targetElement.getAttribute("y") - 0
    );
    if (newOrientation) {
        selectedGridItem = [startGridItem];
        currentWord = $(startGridItem).text();
        if (previousSquare !== startGridItem) {
            previousSquare.classList.remove("selected");
            previousSquare = startGridItem;
        }
        currentOrientation = newOrientation;
    }
    let orientation = calculateOrientation(
        previousSquare.getAttribute("x") - 0,
        previousSquare.getAttribute("y") - 0,
        targetElement.getAttribute("x") - 0,
        targetElement.getAttribute("y") - 0
    );

    if (!orientation) {
        return;
    }
    if (!currentOrientation || currentOrientation === orientation) {
        currentOrientation = orientation;
        playGameTurn(targetElement);
    }
};
/**
 * This is executed when user click and moves the mouse or finger. 
 * 
 * @param {Object} event 
 */
const mouseMovement = function (event) {
    selectingSquares(event.target);
};

/**
 * This function is executed when there is touch movement by the aid of touch 
 * event listeners, it gets coordinates of the exact square being touched 
 * and returns it.
 * 
 * @param {Object} event 
 */
const touchMovement = function (event) {
    let xPos = event.touches[0].pageX;
    let yPos = event.touches[0].pageY;
    let target = document.elementFromPoint(xPos, yPos);
    console.log(target)
    selectingSquares(target);
};

/**
 * This function happens whislt letters are being selected and user is doing movement.
 * It tracks the letters selected.
 * 
 * @param {Object} square 
 */
const playGameTurn = function (square) {
    for (let i = 0, len = wordList.length; i < len; i++) {
        if (wordList[i].indexOf(currentWord + square.innerText) === 0) {
            square.className += " selected";
            selectedGridItem.push(square);
            currentWord += square.innerText;
            break;
        }
    }
};

/**
 * Once letters selected matches oen of the words in the array list
 * it will add css class to those letters that formed words. It will remove 
 * selected letters once a release event has happened and word doesnt match.
 * If all words are found then the game completes and sets a complete css class to
 * all letters. At  the end reset all tracking variables.
 */
const endGameTurn = function () {
    wordList.forEach((value, index) => {
        if (wordList[index] === currentWord) {
            document.querySelectorAll(".selected").forEach((el) => {
                el.classList.add("found");
            });
            wordList.splice(index, 1);
            document.querySelectorAll("#" + currentWord).forEach((el) => {
                el.classList.add("wordFound");
                el.style.color = "magenta";
                el.classList.add("uk-animation-shake");
                playSoundFoundWord();
                addScore(difficultyLevel);
                progressBarForWordFound();
            });;
        }
        if (wordList.length === 0) {
            document.querySelectorAll(".grid-item").forEach((el) => {
                el.classList.add("complete")
            });;
            endGameModal();
        }
    });
    document.querySelectorAll(".selected").forEach((el) => {
        el.classList.remove("selected")
    });;
    startGridItem = null;
    selectedGridItem = [];
    currentWord = "";
    currentOrientation = null;
};

/**
 * Displays word list with styles.
 *
 * @param {Array} wordList 
 */
const displayWordList = (wordList) => {
    let output = "";
    const wordListElement = document.querySelector("#wordList");
    const progressbarLength = wordList.length * 10;
    wordListElement.classList.add("uk-text-center");
    output += `<h3 class="` + `uk-heading-line uk-text-center uk-column-1-1 ` + `" id="` + `progressBarHeading` + `">` + "<span>" + `Progress` + "</span>" + `</h3>`;
    output += `<progress id="progressBar" class="uk-progress progress-purple" value="0" max="` + `${progressbarLength}` + `"></progress>`
    output += `<h3 class="` + `uk-heading-line uk-text-center uk-column-1-1 ` + `" id="` + `wordListHeading` + `">` + "<span>" + `Word List` + "</span>" + `</h3>`;
    output += "<div class=" + "uk-column-1-1" + ">";
    wordList.forEach(function (value) {

        output += "<div class=" + "words" + " id=" + `${value}` + ">";
        output += `${value}`;
        output += "</div>";

    });
    output += "</div>";
    wordListElement.innerHTML = output;
    wordListElement.setAttribute("uk-scrollspy", "target: > div; cls: uk-animation-fade; delay: 500");
};

/**
 * Fills progress bar as the words are being found.
 */
const progressBarForWordFound = () => {
    UIkit.util.ready(function () {
        let barInProgress = document.querySelector('#progressBar');
        barInProgress.value += 10;
    });
}

/**
 * It stops timer when game ends.
 */
function stopTimer() {
    clearInterval(interval);
}

/**
 * Starts timer when game begins.
 */
const startTimer = () => {
    const minutes = document.querySelector("#minutes");
    const seconds = document.querySelector("#seconds");
    interval = setInterval(setTimeToElement, 1000);

    function setTimeToElement() {

        ++totalPlayedSeconds;
        seconds.innerHTML = splitTimeValues(totalPlayedSeconds % 60);
        minutes.innerHTML = splitTimeValues(parseInt(totalPlayedSeconds / 60));
    }

    const splitTimeValues = (value) => {
        let valueString = value + "";
        if (valueString.length < 2) {
            return "0" + valueString;
        } else {
            return valueString;
        }

    }
};

/**
 * Follows a point system logic where points are given for
 * difficulty. Each word found gives you points.
 * 
 * @param {string} difficultyLevel 
 */
const addScore = (difficultyLevel) => {
    const displayScore = document.querySelector("#score");
    if (difficultyLevel === "easy") {
        score += 10;
        $("#score").empty();
        displayScore.innerText = score.toString();
    } else if (difficultyLevel === "medium") {
        score += 25;
        $("#score").empty();
        displayScore.innerText = score.toString();
    } else if (difficultyLevel === "hard") {
        score += 50;
        $("#score").empty();
        displayScore.innerText = score.toString();
    }

};

/**
 * 
 * This is called to save game performance to database
 * only when game has completed. 
 * 
 * @param {Number} score 
 * @param {Number} totalPlayedSeconds 
 */
const saveCompletedGameToDatabase = async (score, totalPlayedSeconds) => {

    /**
     * Get user ID locally and game performance.
     */
    console.log(score)
    const userID = localStorage.getItem("id");
    const userLeaderboard = JSON.stringify({
        score: score,
        time: totalPlayedSeconds,
        category: category,
        user: userID,
    })

    /**
     * Add user leaderboard
     */
    await axios
        .post('https://api.kinectic.io/leaderboards', userLeaderboard, {
            headers: {
                // Overwrite Axios's automatically set Content-Type
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            // Handle success.
            console.log('Leaderboards', response.data);
            return response.data;
        })
        .catch(error => {
            // Handle error.
            console.log('An error occurred, whilst registering a user.', error.response);
            return error.response;
        });
}

/**
 * Play sound when word is found.
 */
const playSoundFoundWord = () => {
    foundWordSound.play();
}

/**
 * Play sound when game is completed.
 */
const playSoundCompletedPuzzle = () => {
    completedGameSound.play();
}

/**
 * Play sound when letter is selected.
 */
const playLetterSelectedSound = () => {
    letterSelectedSound.play();
}

/***
 * Displays a modal with game summary performance
 * and save it to database, then reloads the pages back to category selection.
 */
const endGameModal = () => {

    let completionBonus = 0, timeBonus = 0;
    const elTimeCompleted = document.querySelector("#timeCompleted");
    const elScoreAchieved = document.querySelector("#scoreAchieved");
    const elTimeBonusAmount = document.querySelector("#timeBonusAmount");
    const elCompletionlBonusAmount = document.querySelector("#completionBonusAmount");
    const elTotalBonusCollected = document.querySelector("#totalBonusCollected");
    const elTotalScore = document.querySelector("#totalScore");
    const minutes = document.querySelector("#minutes");
    const seconds = document.querySelector("#seconds");

    stopTimer();
    if (difficultyLevel === "easy") {
        completionBonus = 10;
    } else if (difficultyLevel === "medium") {
        completionBonus = 20;
    } else if (difficultyLevel === "hard") {
        completionBonus = 30;
    }

    if (totalPlayedSeconds <= 60 && difficultyLevel === "easy") {
        timeBonus = 50;
    } else if (totalPlayedSeconds <= 120 && difficultyLevel === "medium") {
        timeBonus = 150;
    } else if (totalPlayedSeconds <= 180 && difficultyLevel === "hard") {
        timeBonus = 200;
    }

    elTimeCompleted.innerText = minutes.innerText + ":" + seconds.innerText;
    elScoreAchieved.innerText = score.toString(10) + " points";
    elTimeBonusAmount.innerText = timeBonus.toString(10) + " points";
    elCompletionlBonusAmount.innerText = completionBonus.toString(10) + " points";
    elTotalBonusCollected.innerText = (timeBonus + completionBonus).toString(10) + " points";
    elTotalScore.innerText = (timeBonus + completionBonus + score).toString(10) + " points";
    saveCompletedGameToDatabase((timeBonus + completionBonus + score), totalPlayedSeconds);
    playSoundCompletedPuzzle();

    UIkit.modal("#endOfGameModal").show();
    UIkit.util.on('#endOfGameModal', 'click', function (e) {
        e.preventDefault();
        e.target.blur();
        location.reload();
    });
}

export { generateUIForPuzzle };
