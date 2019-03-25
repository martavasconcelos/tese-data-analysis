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
    createTable(responseJson);
    for (let i = 0; i < responseJson.records.length - 1; i++) {
        for (var j = i + 1; j < responseJson.records.length; j++) {

            let session1 = responseJson.records[i]._fields[0];
            let seq1 = responseJson.records[i]._fields[1];
            let session2 = responseJson.records[j]._fields[0];
            let seq2 = responseJson.records[j]._fields[1];

            if (session1 !== session2) {

                /* processing(responseJson.records[i]._fields[0],
                     responseJson.records[i]._fields[1],
                     responseJson.records[j]._fields[0],
                     responseJson.records[j]._fields[1]); */

                let similarity = getSimilarity(seq1, seq2)
                let tr = document.getElementById(session2);

                let thSimilarity = document.createElement("th");
                thSimilarity.appendChild(document.createTextNode(similarity));
                tr.appendChild(thSimilarity);

            }
        }
    }
    let table = document.getElementById("table");

    //exportTableToCSV(table,"similarity");
}

function createTable(responseJson) {
    for (let i = 0; i < responseJson.records.length; i++) {
        let session = responseJson.records[i]._fields[0];

        let tableFirstRow = document.getElementById("session");
        let th = document.createElement("th");
        th.appendChild(document.createTextNode(session));
        tableFirstRow.appendChild(th);

        let table = document.getElementById("table");

        let tr = document.createElement("tr");
        let thSession = document.createElement("th");
        thSession.appendChild(document.createTextNode(session));

        tr.setAttribute("id", session);

        tr.appendChild(thSession);
        table.appendChild(tr);
    }
}

function getSimilarity(seq1, seq2) {
    let sequences = sameLength(seq1, seq2);
    console.log("sequences: ", sequences);

    let distance = 0;

    for (let i = 0; i < sequences.seq1.length; i += 1) {
        if (sequences.seq1[i] !== sequences.seq2[i]) {
            distance += 1;
        }
    }

    return distance;
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

function sameLength( seq1, seq2) {

      if(seq1.length === seq2.length){
          return {seq1: seq1, seq2: seq2};
      }
      else{
          let seq1Copy = [...seq1];
          let seq2Copy = [...seq2];
          let shortest = getShortest(seq1Copy, seq2Copy);
          let longest = (shortest === seq1Copy ? seq2Copy : seq1Copy);

          while (shortest.length !== longest.length){
              shortest.push(0);
          }
          return {seq1: shortest, seq2: longest};
      }
}



function getShortest(seq1, seq2) {
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
