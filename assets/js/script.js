// Define global constants and variables
const startTime = 30;

let navHighScoreArea = document.getElementById('nav-high-score');
let timerArea = document.getElementById('timer-container');
let mainArea = document.getElementById('main-container');
let bodyArea = document.querySelector('body');

// Upon screen entry/refresh, initialize the screen to it's beginning state.
init();

// Setup Event Handlers via Delegation
bodyArea.addEventListener("click", processClick);


// Define Event Handler Functions
function processClick(event) {
    var element = event.target;

    switch (element.id) {
        case "start-quiz-btn":
            console.log("Start button pressed!");
            break;
        case "nav-btn":
            console.log("Nav button pressed!");
            break;
        default:
            console.log("What?! " + element.id + " was clicked?");
    }
}

function init() {
    displayChallengeScreen();
    displayViewHighScores(true);
    displayTimer(startTime);
}

function displayChallengeScreen() {
    let initChallengeHTML = "<h2>Coding Quiz Challenge</h2>"
        + "<p>Are you prepared to answer 5 multiple choice coding questions?</p>"
        + "<p>You have 30 seconds to answer as best you can.</p>"
        + "<p></p>"
        + "<button id='start-quiz-btn'>Start Quiz</button";

    mainArea.innerHTML = initChallengeHTML;
}

function displayViewHighScores(isShown) {
    if (typeof isShown != "boolean") {
        errorMsg("displayViewHighScores ERROR: invalid input");
        return;
    }

    if (isShown) {
        navHighScoreArea.innerHTML = "<button id='nav-btn'>View High Scores</button>"
    } else {
        navHighScoreArea.innerHTML = "";
    }
}

function displayTimer(time) {
    if (time === null) {
        timerArea.innerHTML = "";
    } else {
        intTime = parseInt(time);
        if (isNaN(intTime)) {
            timerArea.innerHTML = "";
            errorMsg("displayTimer ERROR: invalid input");
        } else {
            timerArea.innerHTML = `Time: ${time}`;
        }
    }
}

function errorMsg(msg) {
    if (typeof msg != "string") {
        console.log(msg);
        msg="Unspecified Error";
    }
    console.log(msg);
    alert(msg + "Page will refresh and any progress will be lost.");
    init();
}