var express = require('express');
var app = express();
var path = require('path');
var server_config = require('./config/server.json');

app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/dist'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

var server = app.listen(server_config.port, function () {
  console.log('server running at http://localhost:' + server.address().port);
});