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
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var driver = neo4j.driver('bolt://10.227.107.156', neo4j.auth.basic('neo4j', 'tese2018'));
var session = driver.session();

app.get('/data', function(req, res) {
  session
    .run('MATCH(n) RETURN n')
    .then(function(result) {
        res.json(result);
    })
    .catch(function(err) {
      console.log(err)
    })
});

app.get('/session', function(req, res) {
  session
    .run('MATCH (n:OBJECT) RETURN n.session, count(n.session) AS count ORDER BY count desc')
    .then(function(result) {
        res.json(result);
    })
    .catch(function(err) {
      console.log(err)
    })
});

app.get('/pathid', function(req, res) {
  session
    .run('MATCH (n:OBJECT) n.session as session, collect(n.pathId) AS n1Vector ' +
        'return session, n1Vector')
    .then(function(result) {
        res.json(result);
    })
    .catch(function(err) {
      console.log(err)
    })
});

app.post('/jaccard', function(req, res) {
    console.log("...........", req.body.session1);
    console.log("...........", req.body.session2);
  session
    .run('Match (n:OBJECT {session: {session1Param}}) ' +
        'WITH n.session as nSession, collect(n.pathId) AS n1Vector ' +
        'Match (p:OBJECT {session: {session2Param}}) ' +
        'WITH p.session as pSession, nSession, n1Vector, collect(p.pathId) AS n2Vector ' +
        'RETURN nSession as nSession, n1Vector as n1, pSession as pSession, n2Vector as n2, algo.similarity.jaccard(n1Vector, n2Vector) AS similarity', {
        session1Param: req.body.session1,
        session2Param: req.body.session2,
    })
    .then(function(result) {
        res.json(result);
    })
    .catch(function(err) {
      console.log(err)
    })
});

app.post('/actiontype', function(req, res) {
    console.log("...........", req.body.session1);
  session
    .run('Match (n:OBJECT {session: {session1Param}}) ' +
        'WITH n.session as session, collect(DISTINCT n.action) AS n1Vector ' +
        'RETURN session, size(n1Vector)', {
        session1Param: req.body.session1,
    })
    .then(function(result) {
        res.json(result);
    })
    .catch(function(err) {
      console.log(err)
    })
});

// todo test
app.post('/goal', function(req, res) {
  session
    .run('Match (n:OBJECT {path: {pathParam}}) ' +
        'WITH n as originalNode, n.session as sessionId ' +
        'Match (x:OBJECT {session: sessionId}) ' +
        'WITH x.session as session, count(x.session) AS count, originalNode ' +
        'RETURN session, count, originalNode.elementPos as nodePosition, count = originalNode.elementPos as lastNode', {
        pathParam: req.body.path,
    })
    .then(function(result) {
        res.json(result);
    })
    .catch(function(err) {
      console.log(err)
    })
});

app.listen(3000);
console.log('Server Started on Port 3000');

module.exports = app;