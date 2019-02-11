let finalData = [];
let finalTestData = [];
let recordsBySession = [];
let testDoc = "";

function getData() {
    const xhr = new XMLHttpRequest();

    xhr.open('GET', 'http://localhost:3000/data', true);
    xhr.onload = function () {
        callbackFromDatabase(xhr.response);
    };
    xhr.send('');
}


function callbackFromDatabase(response) {
    let reponseJson = JSON.parse(response);
    console.log("response: ", reponseJson);
    groupBySession(reponseJson);
}

function groupBySession(response) {
    response.records.forEach((record) => {
        const sessionValue = record._fields[0].properties.session;
        if (!checkSessionIsPresent(sessionValue)) {
            recordsBySession.push({
                session: sessionValue,
                actions: [{type: record._fields[0].properties.action, path: record._fields[0].properties.value}]
            });
        }
        else {
            let sameSessionRecord = recordsBySession.filter(record => {
                return record.session === sessionValue
            });
            sameSessionRecord[0].actions.push({type: record._fields[0].properties.action, path: record._fields[0].properties.value})
        }
    });
    console.log("recordsBySession: ", recordsBySession);
}

function checkSessionIsPresent(session) {
    let present = false;
    recordsBySession.forEach((recordBySession) => {
        if (session === recordBySession.session) {
            present = true;
        }
    });
    return present;
}
function getPatterns(){
    //console.log( _.isEqual(remoteJSON, localJSON) );

}
function getPatterns_deprecate() {
    const data = [{action: 'click', path: '#test'}, {action: 'click', path: '#test'}, {
        action: 'click',
        path: '#button'
    },];
    console.log("data: ", data);
    data.forEach((currentPath) => {
        let counter = 0;
        let add = true;
        data.forEach((path) => {
            if (currentPath.action === path.action && currentPath.path === path.path) {
                counter++;
            }
        });

        finalData.forEach((path) => {
            if (currentPath.action === path.flow.action && currentPath.path === path.flow.path) {
                add = false;
            }
        });
        if (add) {
            finalData.push({flow: {action: currentPath.action, path: currentPath.path}, count: counter})
        }

    });
    console.log("finalData: ", finalData);
    print(finalData);
}


function print(data) {
    let ul = document.getElementById("list");
    ul.innerHTML = "";

    data.forEach((path) => {
        let li = document.createElement("li");
        li.appendChild(document.createTextNode(path.flow.action + " " + path.flow.path + " -> " + path.count + " time(s)"));
        li.setAttribute("class", "element"); // added line
        ul.appendChild(li);
    });
}


function getTests_deprecate() {
    finalData.forEach((path) => {
        finalTestData.push({command: "driver.findElement(By.xpath(" + path.flow.path + ").click()" + "\n"});
    });
    printTest(finalTestData);
}


function getTests() {
    recordsBySession.forEach((recordBySession) => {
       recordBySession.actions.forEach((action) =>{
           let testCommand = `driver.findElement(By.xpath(${action.path})`;
           if (action.type === "click"){
               testCommand += `.click(); \n`;
            }
            else if (action.type === "input"){
               testCommand += `.click(); \n`;

           }
           console.log(testCommand);
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
