var app = require("express")();
var http = require('http').Server(app);

var io = require('socket.io')(http);

var mongoose = require('mongoose');   // For database manipulation with mongodb

var bodyParser = require('body-parser');

mongoose.connect('mongodb://kevinco26:chatmessages@ds039115.mongolab.com:39115/chatmessagesdb');

app.use(bodyParser.urlencoded({ extended: true })); 



// All the JSON objects in the database will look like the following Schema
var Schema = new mongoose.Schema({
  date:       String,     // When was the message sent
  message:  String,       // the message itself
  color:       String,    // Color of the user
  username: String,       // name of the person who sent it
  className:      String  // Where was that person sending the message (the room).
});

var entry = mongoose.model('messages',Schema);

var username;
var numUsers = 0;
app.get('/',function(req,res){
   res.sendFile(__dirname + '/formprueba.html');
});

app.get('/starsPrueba.jpg',function(req,res){
   res.sendFile(__dirname + '/starsPrueba.jpg');
});
app.get('/autogrow.js',function(req,res){
   res.sendFile(__dirname + '/autogrow.js');
});

var rooms = {};     // like a hash table to access later the number of users in a room
var room;


app.post('/class/:classID',function(req,res){
    // if (!req.params.className) {
    //      console.log("eror");
    //     return;
    // }
   res.sendFile(__dirname + '/index.html');
   // console.log(req.params.classID);
   // console.log(req.body.user.name);
   username=req.body.user.name;
   room = req.params.classID;
   if(!rooms[room])     // if it is undefinced(first time we add something to the array (a new room) then we set the number of users in that room to 0)
     rooms[room] = 0;
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

io.on('connection', function(socket){

  // When connected, retrieve everything from the database and send it to the front end html so that it can be populated and previous messages will appear

  var dataFromDB;
  var addedUser = false;
   socket.join(room);



   socket.on('chat message', function(data){
    // console.log(socket.username);

     io.to(socket.room).emit('chat message', {
      msg :data.msg,
      colorOfUser:data.colorOfUser,
      username: socket.username
     });
     // var dd = new Date();
     // console.log(dd);
    //  offset = -5.0

    // clientDate = new Date();
    // utc = clientDate.getTime() + (clientDate.getTimezoneOffset() * 60000);

    // serverDate = new Date(utc + (3600000*offset));

    // var newDate = serverDate.toLocaleString();
    var newDate = Date();
      new entry({
            date:      newDate,            // When was the message sent
            message:  data.msg,               // the message itself
            color:       data.colorOfUser,    // Color of the user
            username: socket.username,        // name of the person who sent it
            className:      socket.room 
          }).save(function(err,doc){
            if(err) return err;
          });

          console.log(newDate);

   });

 

    socket.on('add user', function(){
      if(addedUser)
        return;
      socket.room = room;
      socket.username = username;
      console.log(username + " is Connected" );
      rooms[socket.room]++;
      // console.log("Num users in room" + room + "is " + rooms[socket.room])
      addedUser = true;

      socket.to(socket.room).emit('login', {
        numUsers: rooms[room]
      });

      io.to(socket.room).emit('user joined', {
        username: socket.username,
        numUsers: rooms[socket.room]
        
      });
 
     });

    // Display db messages
    socket.on('display messages',function(){

      entry.find(function(err,docs){
      if(err) 
        return err;
      else{
       dataFromDB = docs;
     
       socket.emit('populate messages from DB',dataFromDB);
     }
    });

    });

    //Display notifications


    socket.on('display notifications',function(){
        socket.to(socket.room).broadcast.emit('display notifications client',{
          roomUser: socket.room
        });
    });

    



    socket.on('disconnect',function(){
      if(addedUser){
        var roomName = socket.room;
        rooms[roomName]--;

        socket.to(socket.room).broadcast.emit('user left', {
          username: socket.username,
          numUsers: rooms[roomName]
        });

      }

      console.log("user disconnected from room" + roomName + "Total users in this room: " + rooms[roomName] );

   });

    //User is typing
    socket.on('user typing',function(data){

      // send except sender
      socket.to(socket.room).broadcast.emit('user typing server',{
        username:socket.username,
        colorOfUser:data.colorOfUser
      });
    });
  
});

var port  = Number(process.env.PORT || 8080);

http.listen(port, function() {
  console.log('Server running at http://127.0.0.1:8080');
});
