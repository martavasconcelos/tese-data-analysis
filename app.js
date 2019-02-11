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
    .run('MATCH(n) RETURN n LIMIT 5')
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