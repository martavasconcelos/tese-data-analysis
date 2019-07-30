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

var driver = neo4j.driver('bolt://10.227.107.156', neo4j.auth.basic('neo4j', 'tese2018'));

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
});


app.get('/actiontype', function (req, res) {
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
        .run('MATCH (n:OBJECT) WITH n.session as sessionId, collect(n.pathId) AS pathArray ' +
            'RETURN sessionId, pathArray')
        .then(function (result) {
            res.json(result);
        })
        .catch(function (err) {
            console.log(err)
        })
});

app.get('/url', function (req, res) {
    session
        .run('MATCH (n) WITH DISTINCT n.url as url, count(n.url) AS count RETURN url, count ORDER BY count desc')
        .then(function (result) {
            res.json(result);
        })
        .catch(function (err) {
            console.log(err)
        })
});

app.post('/url', function (req, res) {
    session
        .run('MATCH (n) where n.url={urlParam} WITH DISTINCT n.session as sessionId RETURN sessionId', {
            urlParam: req.body.url
        })
        .then(function (result) {
            res.json(result);
        })
        .catch(function (err) {
            console.log(err)
        })
});

app.get('/urlsession', function (req, res) {
    session
        .run('MATCH (n:OBJECT) WITH n.session as sessionId, collect( DISTINCT n.url) AS urlArray, count( DISTINCT n) AS count ' +
            'RETURN sessionId, urlArray, count ORDER BY count DESC')
        .then(function (result) {
            res.json(result);
        })
        .catch(function (err) {
            console.log(err)
        })
});

app.get('/pathsession', function (req, res) {
    session
        .run('MATCH (n:OBJECT) WITH n.session as sessionId, collect( DISTINCT n.pathId) AS pathIdArray, count( DISTINCT n) AS count ' +
            'RETURN sessionId, pathIdArray, count ORDER BY count DESC')
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
            'WITH x.session as sessionId, count(x.sessionId) AS count, originalNode ' +
            'RETURN sessionId, count, originalNode.elementPos as nodePosition, count = originalNode.elementPos as lastNode', {
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