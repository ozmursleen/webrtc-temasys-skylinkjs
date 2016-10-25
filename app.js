
var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);

server.listen(process.env.PORT || 4000, '0.0.0.0',function(){
	console.log('listening at port 4000');		
});

app.use(express.static(__dirname + '/public'));

app.get('/',function(req,res){
	res.sendFile('index.html');
});