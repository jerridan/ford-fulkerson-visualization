var express = require('express');
var app = express();
var path = require('path');

// app.set('views', __dirname);
// app.set('view engine', 'html');

app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/dist'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

var server = app.listen(3000, function () {
  console.log('server running at http://localhost:' + server.address().port);
});