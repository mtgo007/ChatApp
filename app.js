//require modules
var express = require('express')
var path = require('path');
var bodyParser = require('body-parser')
var mongojs = require('mongojs')
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);


//Mongo DB
var db = mongojs('127.0.0.1/chat', ['users', 'mensagens'])

//Retrieve mensages from db

//midleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//view engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

//static folder
app.use(express.static(path.join(__dirname, "public")))

//socket IO
let resp = {};
io.on('connection', function(socket){
    let messages;
    

    db.mensagens.find({}, function(err, docs){
        messages = docs;
        // console.log(docs);
        socket.emit('messages', {messages: messages});
    });

    socket.on('input', function(data){
        resp = data;
        console.log(data);
        db.mensagens.insert(data);
    })


    setInterval(function(){
        if(resp.mensagem!=undefined){
            console.log(resp);
            socket.emit('newMensage', resp);
        }
    },1000);
    
    
})

setInterval(function(){
    resp = {};
},1000)

//routers
app.get('/', function(req, res){
    res.render('index');
})

app.post('/users/sing', function(req, res){
    let user = req.body;
    
    db.users.find(user, function(err, doc) {
        console.log(doc);
        if(doc[0] != {}){
            res.render('chat', user);
        } else{
            res.send('error');
        }
    })
})

app.post('/users/add', function(req, res){
    let user = req.body;
    if(user.senha == user.confirmasenha){
        db.users.insert(user);
        res.render('chat', user);
    } else{
        res.send('error');
    }
})

server.listen(4000);

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
  });