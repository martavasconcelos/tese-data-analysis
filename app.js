var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var neo4j = require('neo4j-driver').v1;

var app = express();

//View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var driver = neo4j.driver('bolt://10.227.107.156', neo4j.auth.basic('neo4j', 'tese2018'),
    {
        maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
        maxConnectionPoolSize: 50,
        connectionAcquisitionTimeout: 2471310 // 120 seconds
    });

var session = driver.session();

app.get('/data', function (req, res) {
    session
        .run('MATCH(n) RETURN n')
        .then(function (result) {
            res.json(result);
        })
        .catch(function (err) {
            console.log(err)
        })
});

app.get('/allsessions', function (req, res) {
    session
        .run('MATCH (n:OBJECT) RETURN n.session, count(n.session) AS count ORDER BY count desc')
        .then(function (result) {
            res.json(result);
        })
        .catch(function (err) {
            console.log(err)
        })
});

app.post('/session', function (req, res) {
    session
        .run('MATCH (n) where n.session={sessionParam} return n', {
            sessionParam: req.body.session
        })
        .then(function (result) {
            res.json(result);
        })
        .catch(function (err) {
            console.log(err)
        })
})
;


app.get('/actiontype', function (req, res) {
    console.log("-----");
    session
        .run('MATCH (n:OBJECT) RETURN n.session, size(collect(DISTINCT n.action)), collect(DISTINCT n.action)', {
        })
        .then(function (result) {
            res.json(result);
        })
        .catch(function (err) {
            console.log(err)
        })
});

app.get('/path', function (req, res) {
    session
        .run('MATCH (n:OBJECT) WITH n.session as session, collect(n.pathId) AS n1Vector ' +
            'RETURN session, n1Vector')
        .then(function (result) {
            res.json(result);
        })
        .catch(function (err) {
            console.log(err)
        })
});

app.post('/element', function (req, res) {
    session
        .run('Match (n:OBJECT {path: {pathParam}}) ' +
            'WITH n as originalNode, n.session as sessionId ' +
            'Match (x:OBJECT {session: sessionId}) ' +
            'WITH x.session as session, count(x.session) AS count, originalNode ' +
            'RETURN session, count, originalNode.elementPos as nodePosition, count = originalNode.elementPos as lastNode', {
            pathParam: req.body.path,
        })
        .then(function (result) {
            res.json(result);
        })
        .catch(function (err) {
            console.log(err)
        })
});

app.listen(3001);
console.log('Server Started on Port 3001');

module.exports = app;