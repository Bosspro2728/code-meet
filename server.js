const express = require('express')
const app = express()
const bodyP = require('body-parser')
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const compiler = require("compilex")
const options = {stats: true}

compiler.init(options)
app.use(bodyP.json())
app.use("/node_modules/codemirror",express.static("C:/Users/Teodor/Desktop/project/node_modules/codemirror"))

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

app.post("/compile", (req, res)=>{
  var code = req.body.code
  var input = req.body.input
  var lang = req.body.lang
  try {
    if(lang=="Cpp"){
      if(!input){
        var envData = { OS : "windows" , cmd : "g++", options:{timeout:10000} }; // (uses g++ command to compile )
        compiler.compileCPP(envData , code , function (data) {
          if (data.output) {
            res.send(data);
          }
          else{
            res.send({output: data.error});
          }
          compiler.flush(function(){
            console.log("deleted")
          })
        });
      }
      else{ 
        var envData = { OS : "windows" , cmd : "g++", options:{timeout:10000} }; // (uses g++ command to compile )
        compiler.compileCPPWithInput(envData , code , input , function (data) {
          if (data.output) {
            res.send(data);
          }
          else{
            res.send({output: data.error});
          }
          compiler.flush(function(){
            console.log("deleted")
          })
        });
      }
    }
    else if(lang=="Java"){
      if(!input){
        var envData = { OS : "windows", options:{timeout:10000}}; 
        compiler.compileJava( envData , code , function(data){
          if (data.output) {
            res.send(data);
          }
          else{
            res.send({output: data.error});
          }
          compiler.flush(function(){
            console.log("deleted")
          })
        }); 
      }
      else{
        var envData = { OS : "windows",options:{timeout:10000}}; 
        compiler.compileJavaWithInput( envData , code , input ,  function(data){
          if (data.output) {
            res.send(data);
          }
          else{
            res.send({output: data.error});
          }
          compiler.flush(function(){
            console.log("deleted")
          })
        });
      }
    }
    else  if(lang == "Python"){
      if(!input){
        var envData = { OS : "windows",options:{timeout:10000}}; 
        compiler.compilePython( envData , code , function(data){
          if (data.output) {
            res.send(data);
          }
          else{
            res.send({output: data.error});
          }
          compiler.flush(function(){
            console.log("deleted")
          })
        });    
      }
      else{
        var envData = { OS : "windows", options:{timeout:10000}}; 
        compiler.compilePythonWithInput( envData , code , input ,  function(data){
          if (data.output) {
            res.send(data);
          }
          else{
            res.send({output: "error"});
          }       
          compiler.flush(function(){
            console.log("deleted")
          })
        });
      }
    }
  } catch (error) {
    console.log("error")
  }
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    console.log(io.sockets.adapter.rooms);
    console.log("Server-side roomId",roomId)
    try {
      const room = socket.to(roomId);
      console.log("Room:", room); // Check if room is defined
      const broadcast = room.broadcast;
      console.log("Broadcast:", broadcast); // Check if broadcast is defined
      socket.to(roomId).emit('user-connected', userId);//.broadcast
    } catch (error) {
      console.error('Error emitting user-connected event:', error);
    }

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId)//.broadcast
    })
  })
})

server.listen(3000)


