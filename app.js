//require modules
var express = require('express')
var path = require('path');
var bodyParser = require('body-parser')
var mongojs = require('mongojs')
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(4000);

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
io.on('connection', function(socket){
    
    db.mensagens.find({}, function(err, docs){
        // messages = docs;
        // console.log(docs);
        socket.emit('messages', {messages: docs});
    });

    socket.on('input', function(data){
        console.log(data);
        io.sockets.emit('newMensage', data);
        db.mensagens.insert(data);
    })


})

//routers
app.get('/', function(req, res){
    res.render('index');
})

app.post('/users/sing', function(req, res){
    let user = req.body;
    
    db.users.find(user, function(err, doc) {
        console.log(doc);
        if(doc.length>0){
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
        res.redirect('/');
    } else{
        res.send('error');
    }
})


app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
  });