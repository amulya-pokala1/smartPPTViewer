var express = require('express');
var app = new express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');

server.listen(3000);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use('/assets/jquery', express.static(__dirname + '/node_modules/jquery/dist/'))

var users = [];
var chat="";
io.on("connection", function(socket){

  socket.emit('welcome','Socket #'+ socket.id);
  
  socket.on("user_onboard", function(user)
  {
    users.push({id : socket.id, name : user.name});   
    socket.join(socket.id); 
    socket.emit("user_onboard",{"id":socket.id, "msg": chat});
    io.sockets.emit("refresh_users", users);   //  socket.broadcast.emit will emit all clients except this connected socket
  });
  socket.on("global_chat",function(obj){
    console.log(obj);
    chat=obj.msg;
    io.sockets.emit("global_chat", obj); 
  })
  socket.on("slide_update", function (slideIndex) {
    io.sockets.emit("slide_update", slideIndex);
  });

  socket.on("chat_ppt", function(obj){
    io.sockets.emit("chat_ppt",obj);
  })
  socket.on("chat_msg", function(chatObj){
   
    var user=  users.filter(x=>x.id === socket.id);
    console.log(user[0].name);
    socket.in(chatObj.to).emit("chat_msg",{ from : user[0].name,  msg :  chatObj.msg, fid: chatObj.from}); 

  });

  socket.on("disconnect", function(data)
  {
    users = users.filter(x=>x.id!== socket.id);
    io.sockets.emit("refresh_users", users);  
  });  

});




