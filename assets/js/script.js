/***************************************************************************************************************/
// Author: Rich Overholt
// 
// Document Organization:
//
// 1. Define global constants and variables
// 2. Utility functions usable by all routines
// 3. Global event listener, delegating as needed
//
// Following are the workflow phases (and the order of this file)
// 4. Phase 1 - Initial startup and refresh
// 5. Phase 2 - Starting and running a quiz
// 6. Phase 3 - Entering score initials at quiz end
// 7. Phase 4 - Viewing quiz scores
//
/***************************************************************************************************************/

/***************************************************************************************************************/
// 1. Define global constants and variables
/***************************************************************************************************************/

    const startTime = 90; // number of seconds to take the entire quiz
    let timeRemaining = 90; // Time remaining to complete the quiz
    const timeDisplayAnswerVeracity = 4; // number of seconds to display the correct/wrong status
    let isNewAnswer; // make sure each answer has the full time from above to display and is not overwritten by a previous answer's stop time.

    const answerBtn = "answer-btn"; // The name of the answer button class and the start of it's ID
    const localStorageKey = "quiz-score"; // The name of the key for local storage:

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

// The list of askable questions -- note, this becomes randomized for the user later
    const questions = [question1, question2, question3, question4, question5];

// Pointers to the key elements
    const navQuizScoreArea = document.getElementById('nav-quiz-score');
    const timerArea = document.getElementById('timer-container');
    const mainArea = document.getElementById('main-container');
    const bodyArea = document.querySelector('body');

    let isQuiz = false; // Is the quiz underway
    let gradedText = null; // Was the last question correct or not
    let answerTimer = null; // Has the display time for gradedText expired or not (to cancel the timer as needed)

/***************************************************************************************************************/
// End of 1. Define global constants and variables
/***************************************************************************************************************/
/***************************************************************************************************************/
// 2. Utility functions usable by all routines
/***************************************************************************************************************/

// Called to show (true) or hide (false) the View Quiz Scores option
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

// Called to display (or hide when time === null) the timer and it's remaining time.
function displayTimer(time) {

    // Hide the view quiz scores navigation during the quiz
    if (time === null) {
        timerArea.innerHTML = "";
        return;
    } 

    // Error out if time is not an integer >= 0.
    intTime = parseInt(time);
    if (isNaN(intTime) || time < 0 ) {
        timerArea.innerHTML = "";
        errorMsg("displayTimer ERROR: invalid input");
        return;
    } 
    
    // Display the specified time 
    timerArea.innerHTML = `<span id="time-hdr">Time: </span>${time}`;
}

// This function is primarily for debugging, if the code works well it should never be called...
function errorMsg(msg) {
    if (typeof msg != "string") {
        console.log(msg);
        msg="Unspecified Error";
    }
    console.log(msg);
    alert(msg + "Page will refresh and any progress will be lost.");
    init(); // Refresh the screen to the beginning of the process.
}

/***************************************************************************************************************/
// End of 2. Utility functions usable by all routines
/***************************************************************************************************************/
/***************************************************************************************************************/
// 3. Global event listener, delegating as needed
/***************************************************************************************************************/

bodyArea.addEventListener("click", processClick);

// Define Event Handler Functions
// The individual functions are in the phase of the code pertinent to the action
function processClick(event) {
    var element = event.target;

    switch (element.id) {
        case "start-quiz-btn": // This button is setup in phase 1
            startQuiz(); // This starts the quiz with details shown in phase 2
            break;
        case "nav-btn": // This button becomes available at startup/refresh, but disappears during the quiz
            viewQuizScores(); // This is phase 4, so the listening function is towards the end.
            break;
        case "submit-initials": // This button is created at the start of Phase 3 once the last answer has completed or they've timed out.
            submitInitials(event); // This logic is included in phase 3.
            break;
        case "clear-quiz-scores-btn": // Phase 3 button to remove all stored scores
            clearQuizScores(); // Phase 3
            break;
        case "go-back-btn": // This button gets displayed in phase 4
            init(); // This refreshes the page, returning to phase 1.
            break;
        default:
            checkAnswerBtn(event); // Determine if a phase 2 answer was chosen
        break;
    }
}

/***************************************************************************************************************/
// End of 3. Global event listener, delegating as needed
/***************************************************************************************************************/
/***************************************************************************************************************/
// 4. Phase 1 - Initial startup and refresh
/***************************************************************************************************************/

init();

function init() {
    
    timeRemaining = startTime;

    // display the main area startup screen
    // this also creates the button that starts the quiz and is listened for in phase 2
    mainArea.innerHTML = "<h2>Coding Quiz Challenge</h2>"
        + "<p>Try to answer the following code-related questions within the time limit.  "
        + "Keep in mind that incorrect answers will penalize your score/time by ten seconds!</p>"
        + "<button id='start-quiz-btn'>Start Quiz</button>";
    
    displayViewQuizScores(true); // show the view quiz menu option
    displayTimer(startTime); // display the time allowed for the quiz
}

/***************************************************************************************************************/
// End of 4. Phase 1 - Initial startup and refresh
/***************************************************************************************************************/
/***************************************************************************************************************/
// 5. Phase 2 - Starting and running a quiz
/***************************************************************************************************************/

function startQuiz() {
    // Pose a random question -- it's the first, so no worries about repeats
    isQuiz = true;
    displayViewQuizScores(false);
    poseQuestion(Math.floor(Math.random() * questions.length), []);  // Note, the questions come in random order each time.
    startTimer(startTime);
}

// start the timer for the quiz
function startTimer() {
    // Sets interval in variable
    var timerInterval = setInterval(function() {

        if (!isQuiz) { // if the quiz has ended, clear the Interval and exit
            clearInterval(timerInterval);
            return;
        }

        // as the quiz is still going, note that 1 second has elapsed
        timeRemaining--;

        // require the time remaining to be positive or 0
        if (timeRemaining < 0) {timeRemaining = 0}

        displayTimer(timeRemaining); // show the time to the user
  
        if (timeRemaining === 0) {
            // Stops execution of the timer
            clearInterval(timerInterval);
            // Calls the function to end the quiz and initiate phase 3
            endQuiz();
        }
  
    }, 1000);
}

// This function is called with an index to a question and a list of previously asked questions (the calling functions handle whether or not to repeat a question)
// The index question is posed to the user and the prevAsked list is stored in a data- attribute within the HTML to be used by the event handler when creating the next question
function poseQuestion(index, prevAsked) {
    // The questions have been setup as constant objects at the top.
    // they contain 3 properties: questionText, answerChoices (array), and answer Index (the index to the correct answer)

    // verify that index is an integer between 0 and the number of available questions:
    if (!(typeof index === 'number') && (index % 1 === 0) && (index >=0) && (index <= (questions.length - 1))) {
        errorMsg(`poseQuestion called with invalid index: ${index}`);
    };

    var thisQuestion = questions[index]; // get a pointer to the actual question object
    var thisAnswerChoice = 0; // This is an index to iterate over the possible answer choices
    
    // Build the screen HTML, starting with the actual question text
    questionHTML = `<p class="question-header">${thisQuestion.questionText}</p>`;

    // add this current question to the given list of already asked questions -- used as a data- attribute below
    prevAsked.push(index);

    while (thisAnswerChoice < thisQuestion.answerChoices.length) {
        questionHTML += `<button id="${answerBtn}-${thisAnswerChoice}" class="${answerBtn}" data-prev-asked="${JSON.stringify(prevAsked)}">${thisQuestion.answerChoices[thisAnswerChoice++]}</button>`;
        // Note, counter incremented above with thisAnswerChoice++
    }

    // Add a section at the bottom to display correct on wrong if a question's already been answered
    if (gradedText != null) { // There is no previous answer when displaying the first question!
        questionHTML += `<p id='answer-feedback'>Previous Answer: ${gradedText}</p>`
    }

    // Post the built HTML to the screen document
    mainArea.innerHTML = questionHTML;
}

// This is the event handler capturing the click on any question answer choice.
// Note, this is called for any click not otherwise specified, so may include random screen clicks which should be ignored
// The function should output a boolean stating whether an Answer Button was clicked or not.
function checkAnswerBtn(event) {
    let element = event.target;

    // if it wasn't an answer button, simply escape.
    // for example, this returns false whenever it's not an action button, looking for ${answerBtn}-0, ${answerBtn}-1, ${answerBtn}* etc.
    if (answerBtn != element.id.slice(0,answerBtn.length)) {
        return false;
    }

    // get the question information from the answer chosen
    let answerChosen = element.id.substring(answerBtn.length + 1); // maybe a data attribute would have been most intuitive...but this works fine and efficiently
    let prevAsked = JSON.parse(element.getAttribute ("data-prev-asked"));
    let questionAnswered = prevAsked[prevAsked.length - 1];

    // if the answer timer for the previous question is still going, turn it off -- screen text will be overlayed when checking this answer.
    if (answerTimer != null) {
        clearTimeout(answerTimer);
        answerTimer = null;
    }
   
    // did they get the answer right?
    if (questions[questionAnswered].answerIndex == answerChosen) { //  yes, they got it right!
        gradedText = "Correct";

    } else { // no, they got the question wrong

        gradedText = "Wrong";

        // penalize the user 10 seconds for their wrong answer
        timeRemaining -= 10;
        if (timeRemaining < 0) {timeRemaining = 0}
    
        // Display the new time immediately; otherwise it feels strange to user
        displayTimer(timeRemaining);
    }

    // Set a timeout so the answer feedback only stays on the screen for a short time.
    // Note, this gets cleared above if the user answers a new question before the timer expires.
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
// Input: a list of asked questions
// Output: false when all questions have been asked
// Output: a randomly selected unasked question if one exists
    
    if (prevAsked.length >= questions.length) {
        // no more questions to ask, we're done!
        return false;
    }

    let remainingQuestions = [];

    // look at the index for each possible question
    // This first loops through all the available questions and then, for each, loops through the asked questions to find a match
    // If there is no match, than this question hasn't yet been asked!
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

        // If the question hadn't been asked, then add it to the list of available questions to ask.
        if (!isAsked) {
            remainingQuestions.push(questionIndex);
        }
        questionIndex++;
    }

    if (remainingQuestions.length != (questions.length - prevAsked.length)) {
        // if the loops above work properly, this code should never execute!
        errorMsg("Remaining question count mismath");
        return;
    }

    // return a random, unasked question
    return remainingQuestions[Math.floor(Math.random() * remainingQuestions.length)];
}

/***************************************************************************************************************/
// End of 5. Phase 2 - Starting and running a quiz
/***************************************************************************************************************/
/***************************************************************************************************************/
// 6. Phase 3 - Entering score initials at quiz end
/***************************************************************************************************************/

// Called at the end of phase 2 either when the user answers all questions or time expires
// Displays the score and asks user to enter their initials.
function endQuiz() {
    isQuiz = false; // note that the quiz is no longer underway

    // Display the new screen to the user via setting mainArea.HTML
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

    // set the target to the input field so user can just start typing instead of clicking first.
    document.getElementById('user-initials').focus();
}

// Event handler function to process the entry of the users initials
function submitInitials(event) {
    event.preventDefault();

    var userEntry = document.getElementById("user-initials");
    
    var userInitials = userEntry.value;
    
    // If the user clicks submit without entering initials, display a non-modal error message
    if (userInitials === "") {
        const errorMsg = "Initials must be entered to save and continue"
        prevErrorMsg = document.getElementById('empty-initials-error-msg');

        // If they continuously click without enter initials, alternate coloring on the error message.
        if (prevErrorMsg === null) {
            mainArea.innerHTML += `<p id='empty-initials-error-msg' class='white-red'>${errorMsg}</p>`
        } else {
            var msgClass = ((prevErrorMsg.classList.contains("white-red")) ? 'red-white' : 'white-red');
            prevErrorMsg.remove();
            mainArea.innerHTML += `<p id='empty-initials-error-msg' class='${msgClass}'>${errorMsg}</p>`;
        }
        return;
    } 

    var userObject = {
        userInitials: userInitials,
        userScore: timeRemaining
    }
    
    var priorQuizScores = JSON.parse(localStorage.getItem(localStorageKey));

    if (priorQuizScores === null) {
        priorQuizScores = [userObject];
    } else {
        priorQuizScores.push(userObject);
    }

    // Input has been received, let's add this to our list of scores
    localStorage.setItem(localStorageKey, JSON.stringify(priorQuizScores));

    // Now show the information to the user via the priorQuizScores list
    renderQuizScores(priorQuizScores);
}

// Display the quiz scores from the input (which matches current local storage...so any current one and all historic ones)
function renderQuizScores(quizScores) {

    // Setup the page text and it's action buttons
    let quizScoresHTML = "<h2>Quiz Scores</h2>";

    if (quizScores === null) { // If no history exists, show this on the screen

        quizScoresHTML += "<p>There are no quizzes stored at this time</p>";
        quizScoresHTML += "<button id='go-back-btn'>Go Back</button><button id='clear-quiz-scores-btn' disabled>Clear Quiz Scores</button>";
        
    } else { // Since history exists, build it into the page text

        // Add a header row first
        quizScoresHTML += "<table id='score-table'> <tr> <th>Initials</th> <th>Score</th> </tr>"

        // Start at 0 and iterate through the entire list
        quizCount = 0; // keep track of how many quizzes we've already built into the text
        while (quizCount < quizScores.length) {
            // Show the quizzes from most recent to oldest, e.g. reverse of the order they were pushed
            thisScore = quizScores[quizScores.length - 1 - quizCount++];  // Note the increase to our counter
            quizScoresHTML += `<tr><td>${thisScore.userInitials}</td><td>${thisScore.userScore}</td></tr>`
        }
        // Close out the table and append the action buttons
        quizScoresHTML += "</table></br><button id='go-back-btn'>Go Back</button><button id='clear-quiz-scores-btn'>Clear Quiz Scores</button>";
    }

    // Post the information to the screen!
    mainArea.innerHTML = quizScoresHTML;
}

// Event handler to erase the quiz score history as requested -- remove the items and redisplay the screen.
function clearQuizScores() {
    localStorage.removeItem(localStorageKey);
    renderQuizScores(null);
}

/**************************************************
// These are obsolete as they are now unused.
// But I will retain the code in case I wish to 
// reimplement later.
/**************************************************

// Must be called with an object matching Date() 
function displayDate(date) {
    return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
}

// Must be called with an object matching Date()    
function displayTime(date) {
    return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
} 
/**************************************************/

/***************************************************************************************************************/
// 6. Phase 3 - Entering score initials at quiz end
/***************************************************************************************************************/
/***************************************************************************************************************/
// 7. Phase 4 - Viewing quiz scores
/***************************************************************************************************************/

// This is the event handler for the menu click to view the quiz scores
// renderQuizScores() from Phase 3 performs the bulk of the functionality 
function viewQuizScores() {
    var quizScores = JSON.parse(localStorage.getItem(localStorageKey));
    displayViewQuizScores(false);
    renderQuizScores(quizScores);
}

/***************************************************************************************************************/
// End of 7. Phase 4 - Viewing quiz scores
/***************************************************************************************************************/



