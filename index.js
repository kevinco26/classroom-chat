var app = require("express")();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true })); 

var numUsers = 0;
var username;
var nsp = io.of('/');

app.get('/',function(req,res){
	 res.sendFile(__dirname + '/formprueba.html');
});

app.get('/starsPrueba.jpg',function(req,res){
	 res.sendFile(__dirname + '/starsPrueba.jpg');
});

app.post('/index.html',function(req,res){
	 res.sendFile(__dirname + '/index.html');
	 console.log(req.body.user.name);
	 username=req.body.user.name;
   nsp = io.of('/');

});


app.post('/math141',function(req,res){
   
   res.sendFile(__dirname + '/index.html');
   console.log(req.body.user.name);
   username=req.body.user.name;
   nsp = io.of('/math141');


});

/*
  Stack overflow link 

  http://stackoverflow.com/questions/10058226/send-response-to-all-clients-except-sender-socket-io

   // sending to sender-client only
 socket.emit('message', "this is a test");

 // sending to all clients, include sender
 io.emit('message', "this is a test");

 // sending to all clients except sender
 socket.broadcast.emit('message', "this is a test");

 // sending to all clients in 'game' room(channel) except sender
 socket.broadcast.to('game').emit('message', 'nice game');

 // sending to all clients in 'game' room(channel), include sender
 io.in('game').emit('message', 'cool game');

 // sending to sender client, only if they are in 'game' room(channel)
 socket.to('game').emit('message', 'enjoy the game');

 // sending to all clients in namespace 'myNamespace', include sender
 io.of('myNamespace').emit('message', 'gg');

 // sending to individual socketid
 socket.broadcast.to(socketid).emit('message', 'for your eyes only');

*/

nsp.on('connection', function(socket){

  var addedUser = false;

   socket.on('chat message', function(data){
   	// console.log(socket.username);
     nsp.emit('chat message', {
     	msg :data.msg,
     	colorOfUser:data.colorOfUser,
     	username: socket.username
     });
 	 });

    socket.on('add user', function(){
    	if(addedUser)
    		return;
    	socket.username = username;
    	console.log(username + " is Connected" );
    	++numUsers;
    	addedUser = true;

    	socket.emit('login', {
	      numUsers: numUsers
	    });

	    socket.broadcast.emit('user joined', {
	      username: socket.username,
	      numUsers: numUsers
	    });
 
     });

    socket.on('disconnect',function(){
    	if(addedUser){
    		--numUsers;

    		socket.broadcast.emit('user left', {
	        username: socket.username,
	        numUsers: numUsers
	      });

    	}

    	console.log("user disconnected");
	 });

    //User is typing
    socket.on('user typing',function(){

      // send except sender
      socket.broadcast.emit('user typing server',{
        username:socket.username
      });
    });
  
});


http.listen(8080, function() {
  console.log('Server running at http://127.0.0.1:8080');
});