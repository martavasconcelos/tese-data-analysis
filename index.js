let finalData = [];
let finalTestData = [];
let recordsBySession = [];
let testDoc = "";

/* Database Requests */
function getData() {
    const xhr = new XMLHttpRequest();

    xhr.open('GET', 'http://localhost:3000/data', true);
    xhr.onload = function () {
        callbackFromDatabase(xhr.response);
    };
    xhr.send('');
}

function getSession(type) {

    const xhr = new XMLHttpRequest();

    xhr.open('GET', 'http://localhost:3000/session', true);
    xhr.onload = function () {
        if (type === 2) {
            callbackFromGetSessionToActionTypes(xhr.response);
        }
    };
    xhr.send('');
}

function getGoal() {
    let path = document.getElementById("goal").value;
    let ul = document.getElementById("list");
    ul.innerHTML = "";
    const xhr = new XMLHttpRequest();

    xhr.open('POST', 'http://localhost:3000/goal', true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify({
        path: path,
    }));
    xhr.onload = function () {
        callbackFromGoal(xhr.response);
    };
}
function getActionTypes(session) {
    let ul = document.getElementById("list");
    ul.innerHTML = "";
    const xhr = new XMLHttpRequest();

    xhr.open('POST', 'http://localhost:3000/actiontype', true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify({
        session1: session,
    }));
    xhr.onload = function () {
        callbackFromActionTypes(xhr.response);
    };
}


function getPathIdBySession() {
    let path = document.getElementById("goal").value;
    let ul = document.getElementById("list");
    ul.innerHTML = "";
    const xhr = new XMLHttpRequest();

    xhr.open('GET', 'http://localhost:3000/pathid', true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(''));
    xhr.onload = function () {
        getMostCommon(xhr.response);
    };
}

/* Data treatment */

function getMostCommon(response) {
    let responseJson = JSON.parse(response);
    console.log("path id by session: ", responseJson.records);

    for (let i = 0; i < responseJson.records.length - 1; i++) {
        for (var j = i + 1; j < responseJson.records.length; j++) {
            if (responseJson.records[i]._fields[0] !== responseJson.records[j]._fields[0]) {
                console.log(responseJson.records[i]._fields[0]);
                console.log(responseJson.records[j]._fields[0]);
                checkLength(responseJson.records[i]._fields[1], responseJson.records[j]._fields[1]);
            }
        }
    }
}
/*
function getSimilarity() {

    const xhr = new XMLHttpRequest();

    xhr.open('POST', 'http://localhost:3000/actiontype', true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify({
        session1: session,
    }));
    xhr.onload = function () {
        callbackFromActionTypes(xhr.response);
    };
}*/

function checkLength(seq1, seq2) {
    if(seq1.length === seq2.length){
        console.log("same length seq1: ", seq1);
        console.log("same length seq2: ", seq2);
        getSimilarity(seq1, seq2);
    }
    else{
        let seq1Copy = [...seq1];
        let seq2Copy = [...seq2];
        let shortest = getShortest(seq1Copy, seq2Copy);
        let longest = (shortest === seq1Copy ? seq2Copy : seq1Copy);

        while (shortest.length !== longest.length){
            shortest.push(0);
        }

        console.log("shortest: ", shortest);
        console.log("longest: ", longest);
    }

}

function getSimilarity(seq1, seq2){
    return 1;
}

function getShortest(seq1, seq2){
    return seq1.length > seq2.length ? seq2 : seq1;
}

function callbackFromGoal(response) {
    let responseJson = JSON.parse(response);
    console.log("goal: ", responseJson);

    for (let i = 0; i < responseJson.records.length - 1; i++) {
        if (responseJson.records[i]._fields[3]) {
            printGoal(responseJson.records[i]._fields[0]);
        }
    }
}


function callbackFromGetSessionToActionTypes(response) {
    let responseJson = JSON.parse(response);
    console.log("sessions: ", responseJson.records);

    for (let i = 0; i < responseJson.records.length - 1; i++) {
        getActionTypes(responseJson.records[i]._fields[0]);
    }
}

function callbackFromMostCommon(response) {
    let responseJson = JSON.parse(response);
    let similarity = responseJson.records[0]._fields[4];
    console.log("Similar: ", similarity);
    if (similarity > document.getElementById("threshold").value) {
        printSimilarity(responseJson.records[0]._fields[0], responseJson.records[0]._fields[2], similarity);
    }
}



function callbackFromActionTypes(response) {
    let responseJson = JSON.parse(response);
    let numberOfActions = responseJson.records[0]._fields[1].low;
    console.log("response: ", numberOfActions);
    if (numberOfActions > document.getElementById("actionTypes").value) {
        printActionTypes(responseJson.records[0]._fields[0], numberOfActions);
    }
}

/* Print functions */

// todo: generalizar um funçao de print
function printSimilarity(session1, session2, similarity) {
    let ul = document.getElementById("list");
    let li = document.createElement("li");
    li.appendChild(document.createTextNode(session1 + " and " + session2 + " -> " + similarity));
    li.setAttribute("class", "element"); // added line
    ul.appendChild(li);
}

function printActionTypes(session, numberOfTypes) {
    let ul = document.getElementById("list");
    let li = document.createElement("li");
    li.appendChild(document.createTextNode(session + " -> " + numberOfTypes));
    li.setAttribute("class", "element"); // added line
    ul.appendChild(li);
}
function printGoal(session) {
    let ul = document.getElementById("list");
    let li = document.createElement("li");
    li.appendChild(document.createTextNode(session));
    li.setAttribute("class", "element"); // added line
    ul.appendChild(li);
}


function getTests() {
    recordsBySession.forEach((recordBySession) => {
        recordBySession.actions.forEach((action) => {
            let testCommand = `driver.findElement(By.xpath(${action.path})`;
            if (action.type === "click") {
                testCommand += `.click(); \n`;
            }
            else if (action.type === "input") {
                testCommand += `.click(); \n`;

            }
            testDoc += testCommand;
        });
    });
    console.log("tests: ", testDoc);
}


function printTest(data) {
    let ul = document.getElementById("list");
    ul.innerHTML = "";
    data.forEach((test) => {
        let li = document.createElement("li");
        li.appendChild(document.createTextNode(test.command));
        li.setAttribute("class", "element"); // added line
        ul.appendChild(li);
    });
}
