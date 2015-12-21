var app = require("express")();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true })); 

var numUsers = 0;
var username;
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

});

io.on('connection', function(socket){

  var addedUser = false;

   socket.on('chat message', function(data){
   	// console.log(socket.username);
     io.emit('chat message', {
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
  
});


http.listen(8080, function() {
  console.log('Server running at http://127.0.0.1:8080');
});