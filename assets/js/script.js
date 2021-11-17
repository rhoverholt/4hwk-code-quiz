/****************************************/
// Define global constants and variables
/****************************************/

// The amount of time available to answer questions or see correct/wrong
    const startTime = 90; // number of seconds to take the entire quiz
    let timeRemaining;
    const timeDisplayAnswerVeracity = 4; // number of seconds to display the correct/wrong status
    let isNewAnswer; // make sure each answer has the full 2 seconds to display and is not overwritten by a previous answer's stop time.

// The name of the answer button class and the start of it's ID
    const answerBtn = "answer-btn";

// The name of the key for local storage:
    const localStorageKey = "quiz-score";

// The actual questions to be asked
    const question1 = {
        questionText: "Commonly used data types DO NOT include:",
        answerChoices: ["strings", "booleans", "alerts", "numbers"],
        answerIndex: 2
    };

    const question2 = {
        questionText: "The condition in an if / else statement in enclosed within _______.",
        answerChoices: ["quotes", "curly brackets", "parenthesis", "square brackets"],
        answerIndex: 1
    };

    const question3 = {
        questionText: "Arrays in JavaScript can be used to store _______.",
        answerChoices: ["numbers and strings", "other arrays", "booleans", "all of the above", "none of the above"],
        answerIndex: 3
    }

    const question4 = {
        questionText: "String values must be enclosed within _______ when being assigned to variables",
        answerChoices: ["commas", "curly brackets", "quotes", "parenthesis"],
        answerIndex: 2
    }

    const question5 = {
        questionText: "A very useful tool used during development and debugging for printing content to the debugger is:",
        answerChoices: ["JavaScript", "terminal / bash", "for loops", "console.log"],
        answerIndex: 3
    }

    const questions = [question1, question2, question3, question4, question5];

// The key element pointers
    const navQuizScoreArea = document.getElementById('nav-quiz-score');
    const timerArea = document.getElementById('timer-container');
    const mainArea = document.getElementById('main-container');
    const bodyArea = document.querySelector('body');

// Is the quiz underway and was the last question correct or not
    let isQuiz = false;
    let gradedText = null;
    let answerTimer = null;

/**************************************************************************/
// The routines used on initial screen load
// Upon screen entry/refresh, initialize the screen to it's beginning state.
/**************************************************************************/

init();

function init() {
    
    timeRemaining = startTime;

    displayChallengeScreen();
    displayViewQuizScores(true);
    displayTimer(startTime);
}

function displayChallengeScreen() {
    let initChallengeHTML = "<h2>Coding Quiz Challenge</h2>"
        + "<p>Try to answer the following code-related questions within the time limit.  "
        + "Keep in mind that incorrect answers will penalize your score/time by ten seconds!</p>"
        + "<button id='start-quiz-btn'>Start Quiz</button>";
    mainArea.innerHTML = initChallengeHTML;
}

// This can be called to show (true) or hide (false) the View Quiz Scores option
function displayViewQuizScores(isShown) {
    if (typeof isShown != "boolean") {
        errorMsg("displayViewQuizScores ERROR: invalid input");
        return;
    }

    if (isShown) {
        navQuizScoreArea.innerHTML = "<button id='nav-btn'>View Quiz Scores</button>"
    } else {
        navQuizScoreArea.innerHTML = "";
    }
}

function displayTimer(time) {
    if (time === null) {
        timerArea.innerHTML = "";
        return;
    } 

    intTime = parseInt(time);
    if (isNaN(intTime)) {
        timerArea.innerHTML = "";
        errorMsg("displayTimer ERROR: invalid input");
        return;
    } 
    
    timerArea.innerHTML = `<span id="time-hdr">Time: </span>${time}`;
}


function startTimer() {
    // Sets interval in variable
    var timerInterval = setInterval(function() {

        if (!isQuiz) {
            clearInterval(timerInterval);
            return;
        }

        timeRemaining--;

        if (timeRemaining < 0) {timeRemaining = 0}

        displayTimer(timeRemaining);
  
        if (timeRemaining === 0) {
        // Stops execution of action at set interval
        clearInterval(timerInterval);
        // Calls function to end the quiz
        endQuiz();
        }
  
    }, 1000);
}


/**************************************/
// Setup Event Handlers via Delegation
/**************************************/

bodyArea.addEventListener("click", processClick);

// Define Event Handler Functions
function processClick(event) {
    var element = event.target;

    switch (element.id) {
        case "start-quiz-btn":
            startQuiz();
            break;
        case "nav-btn":
            viewQuizScores();
            break;
        case "submit-initials":
            submitInitials(event);
            break;
        case "clear-quiz-scores-btn":
            clearQuizScores();
            break;
        case "go-back-btn":
            init();
            break;
        default:
                checkAnswerBtn(event); // if it was an answer button, it gets processed; otherwise, ignored. 
            break;
    }
}

/**************************************/
// Handle the start-quiz-btn logic
/**************************************/

function startQuiz() {
    // Pose a random question -- it's the first, so no worries about repeats
    isQuiz = true;
    displayViewQuizScores(false);
    poseQuestion(Math.floor(Math.random() * questions.length), []);
    startTimer(startTime);
}

function endQuiz() {
    isQuiz = false;

    if (timeRemaining < 1) {
        gradedText = "Timed Out";
        var hdrText = "Time's up!"
    } else {
        var hdrText = "All Done!"
    }

    let endQuizMessage = "<h2>" + hdrText + "</h2>"
    + "<p></p><p>Your final score is " + timeRemaining + ". </p>"
    + "<form id='initial-entry-form'>Enter Initials: <input type='text' id=user-initials>"
    + "<input id='submit-initials' type='submit' value='SUBMIT' /></form>"
    + `<p id='answer-feedback'>Previous Answer: ${gradedText}</p>`;

    mainArea.innerHTML = endQuizMessage;

    let inputFocus = document.getElementById('user-initials');
    inputFocus.focus();
}

function submitInitials(event) {
    event.preventDefault();

    var userEntry = document.getElementById("user-initials");
    
    var userInitials = userEntry.value;
    
    if (userInitials === "") {
        alert("Please enter your initials");
        return;
    } 

    let currentDate = new Date();

    var userObject = createQuizScore(userInitials, timeRemaining, displayDate(currentDate), displayTime(currentDate));

    var quizScores = JSON.parse(localStorage.getItem(localStorageKey));

    if (quizScores === null) {
        quizScores = [userObject];
    } else {
        quizScores.push(userObject);
    }

    // Input has been received, let's add this to our list of scores
    localStorage.setItem(localStorageKey, JSON.stringify(quizScores));

    renderQuizScores(quizScores);
}

function createQuizScore(userInitials, score, date, time) {
    let quizScore = {
        userInitials: userInitials,
        userScore: score,
        scoreDate: date,
        scoreTime: time
    }

    return quizScore;
}


// This is only called when the user clicks to view the quiz scores
function viewQuizScores() {
    var quizScores = JSON.parse(localStorage.getItem(localStorageKey));
    displayViewQuizScores(false);
    renderQuizScores(quizScores);
}

function renderQuizScores(quizScores) {
    
    let quizScoresHTML = "<h2>Quiz Scores</h2>";

    if (quizScores === null) {
        quizScoresHTML += "<p>There are no quizzes stored at this time</p>";
        quizScoresHTML += "<button id='go-back-btn'>Go Back</button><button id='clear-quiz-scores-btn' disabled>Clear Quiz Scores</button>";
        
    } else {
        quizCount = 0;

        quizScoresHTML += "<table id='score-table'> <tr> <th>Initials</th> <th>Score</th> </tr>"
        while (quizCount < quizScores.length) {
            // Show the quizzes from last to first, in decreasing time order
            thisScore = quizScores[quizScores.length - 1 - quizCount++];
            quizScoresHTML += `<tr><td>${thisScore.userInitials}</td><td>${thisScore.userScore}</td></tr>`
        }
        quizScoresHTML += "</table></br><button id='go-back-btn'>Go Back</button><button id='clear-quiz-scores-btn'>Clear Quiz Scores</button>";
    }

    mainArea.innerHTML = quizScoresHTML;
}

function clearQuizScores() {
    localStorage.removeItem(localStorageKey);
    renderQuizScores(null);
}

// Must be called with an object matching Date()    
function displayDate(date) {
    return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
}

// Must be called with an object matching Date()    
function displayTime(date) {
    return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
} 

function poseQuestion(index, prevAsked) {
    // The questions have been setup as constant objects at the top.
    // they contain 3 properties: questionText, answerChoices (array), and answer Index (the index to the correct answer)

    // verify that index is an integer between 0 and the number of available questions:
    if (!(typeof index === 'number') && (index % 1 === 0) && (index >=0) && (index <= (questions.length - 1))) {
        errorMsg(`poseQuestion called with index ${index}`);
    };

    var thisQuestion = questions[index];
    var thisAnswer = 0;
    
    questionHTML = `<p class="question-header">${thisQuestion.questionText}</p>`;

    prevAsked.push(index);

    while (thisAnswer < thisQuestion.answerChoices.length) {
        questionHTML += `<button id="${answerBtn}-${thisAnswer}" class="${answerBtn}" data-prev-asked="${JSON.stringify(prevAsked)}">${thisQuestion.answerChoices[thisAnswer]}</button>`;
        thisAnswer++;
    }

    // Add a section at the bottom to display correct on wrong if a question's already been answered

    if (gradedText != null) {
        questionHTML += `<p id='answer-feedback'>Previous Answer: ${gradedText}</p>`
    }

    mainArea.innerHTML = questionHTML;
}

/*********************************************************/
// Perform the logic when a user answers a question
/*********************************************************/

function checkAnswerBtn(event) {
    let element = event.target;

    // if it wasn't an answer button, escape.
    if (answerBtn != element.id.slice(0,answerBtn.length)) {
        return false;
    }

    // get the question information from the answer chosen
    let answerChosen = element.id.substring(answerBtn.length + 1);
    let prevAsked = JSON.parse(element.getAttribute ("data-prev-asked"));
    let questionAnswered = prevAsked[prevAsked.length - 1];

    // if the answer timer for the previous question is still going, turn it off -- screen text will be overlayed when checking this answer.
    if (answerTimer != null) {
        console.log(`answerTimer Cleared: ${answerTimer}`);
        clearTimeout(answerTimer);
        answerTimer = null;
    } else {
        console.log(`Answer Timer is null: ${answerTimer}`);
    }
   
    // did they get the answer right?
    if (questions[questionAnswered].answerIndex == answerChosen) { //  yes, they got it right!
        gradedText = "Correct";

    } else { // no, they got the question wrong

        gradedText = "Wrong";
        timeRemaining -= 10;
        if (timeRemaining < 0) {timeRemaining = 0}
    
        // Display the new time immediately; otherwise it feels strange to user
        displayTimer(timeRemaining);
    }

    // Set a timeout so the answer feedback only stays on the screen for a short time.
    // Note, this gets cleared above if the user answered a new question before the timer expired.
        answerTimer = setTimeout(function() {
        document.getElementById('answer-feedback').remove();
    }, timeDisplayAnswerVeracity * 1000);

    
 // pose the next question -- it will handle if this was the last one.
    var nextQuestionIndex = poseNextQuestion(prevAsked);

    if (nextQuestionIndex === false) {
        // All questions have been answered
        endQuiz();
        return true;
    }

    poseQuestion(nextQuestionIndex,prevAsked);
    return true;
}

function poseNextQuestion(prevAsked) {
    
    if (prevAsked.length >= questions.length) {
        // no more questions to ask, we're done!
        return false;
    }

    let remainingQuestions = [];

    // look at the index for each possible question
    var questionIndex = 0
    while (questionIndex < questions.length) {

        var isAsked = false;
        var askedIndex = 0;
        // compare every asked question to see if this indexed question has been asked.
        while (!isAsked && askedIndex < prevAsked.length) {
            if (prevAsked[askedIndex] === questionIndex) {
                isAsked = true;
            }
            askedIndex++;
        }

        if (!isAsked) {
            remainingQuestions.push(questionIndex);
        }
        questionIndex++;
    }

    if (remainingQuestions.length != (questions.length - prevAsked.length)) {
        errorMsg("Remaining question count mismath");
        return;
    }

    return remainingQuestions[Math.floor(Math.random() * remainingQuestions.length)];
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