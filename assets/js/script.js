/****************************************/
// Define global constants and variables
/****************************************/

// The amount of time available to answer the questions
    const startTime = 30;
    let timeRemaining = startTime;

// The name of the answer button class and the start of it's ID
    const answerBtn = "answer-btn";

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

// The element pointers
    const navHighScoreArea = document.getElementById('nav-high-score');
    const timerArea = document.getElementById('timer-container');
    const mainArea = document.getElementById('main-container');
    const bodyArea = document.querySelector('body');

// Is the quiz underway (should the timer be counting down?)
    isQuiz = false;

// Text for whether the last answer was correct or not
    gradedText = "";


/**************************************************************************/
// The routines used on initial screen load
// Upon screen entry/refresh, initialize the screen to it's beginning state.
/**************************************************************************/

init();

function init() {
    displayChallengeScreen();
    displayViewHighScores(true);
    displayTimer(startTime);
}

function displayChallengeScreen() {
    let initChallengeHTML = "<h2>Coding Quiz Challenge</h2>"
        + "<p>Try to answer the following code-related questions within the time limit.  "
        + "Keep in mind that incorrect answers will penalize your score/time by ten seconds!</p>"
        + "<button id='start-quiz-btn'>Start Quiz</button>";
    mainArea.innerHTML = initChallengeHTML;
}

// This can be called to show (true) or hide (false) the View High Scores option
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
        return;
    } 

    intTime = parseInt(time);
    if (isNaN(intTime)) {
        timerArea.innerHTML = "";
        errorMsg("displayTimer ERROR: invalid input");
        return;
    } 
    
    timerArea.innerHTML = `Time: ${time}`;
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
//        case "nav-btn":
//           showHighScores();
//            console.log("Nav button pressed!");
//            break;
        default:
            if (!checkAnswerBtn(event)) {
                console.log("What?! " + element.id + " was clicked?");
            }
            break;
    }
}

/**************************************/
// Handle the start-quiz-btn logic
/**************************************/

function startQuiz() {
    // Pose a random question -- it's the first, so no worries about repeats
    isQuiz = true;
    poseQuestion(Math.floor(Math.random() * questions.length), []);
//    startTimer(startTime);
}

function endQuiz() {
    isQuiz = false;
    console.log(`End Quiz Called.  Score = ${timeRemaining}`);

    // If they got the last question wrong, this updates the timer to include the penalty
    displayTimer(timeRemaining);

    let endQuizMessage = "<h2>All Done!</h2>"
    + "<p></p><p>Your final score is " + timeRemaining + ". </p>";

    mainArea.innerHTML = endQuizMessage;
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

    console.log(`poseQuestion - Index: ${index}. prevAsked: ${prevAsked}`);
    
    questionHTML = `<p class="question-header">${thisQuestion.questionText}</p>`;

    prevAsked.push(index);

    while (thisAnswer < thisQuestion.answerChoices.length) {
        questionHTML += `<button id="${answerBtn}-${thisAnswer}" class="${answerBtn}" data-prev-asked="${JSON.stringify(prevAsked)}">${thisQuestion.answerChoices[thisAnswer]}</button>`;
        thisAnswer++;
    }

    // Add a section at the bottom to display correct on wrong
    questionHTML += `<p class='answer-feedback'>${gradedText}</p>`
    mainArea.innerHTML = questionHTML;
}

/*********************************************************/
// Perform the logic when a user answers a question
/*********************************************************/

function checkAnswerBtn(event) {
    var element = event.target;

    if (answerBtn != element.id.slice(0,answerBtn.length)) {
        return false;
    }

    // get the question information from the answer chosen
    let answerChosen = element.id.substring(answerBtn.length + 1);
    let prevAsked = JSON.parse(element.getAttribute ("data-prev-asked"));
    let questionAnswered = prevAsked[prevAsked.length - 1];
    
    // did they get the answer right?
    if (questions[questionAnswered].answerIndex == answerChosen) {
        console.log(`Congratulations, you answered question ${questionAnswered} correctly!`);
        correctAnswer();
    } else {
        console.log(`Sorry, you answered question ${questionAnswered} wrong.`);
        wrongAnswer();       
    }

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

function correctAnswer() {
    gradedText = "Previous Answer: Correct";
}

function wrongAnswer() {

    timeRemaining -= 10;
    if (timeRemaining < 0) {timeRemaining = 0}

    gradedText = "Previous Answer: Wrong";
}    

function poseNextQuestion(prevAsked) {
    
    if (prevAsked.length >= questions.length) {
        // no more questions to ask, we're done!
        console.log(`Congratulations on answering all of the questions!`);
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