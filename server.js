const express = require('express');
// const chat = require('./chat.js')
const mongoose = require('mongoose');
const Register = require('./users.js');
const bodyParser = require('body-parser');
const socket = require('socket.io')
const socketIO = require('socket.io');

const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/isRealString');
const {Users} = require('./utils/users');


const app = express();
const ejs = require('ejs');
const PORT = process.env.PORT || 5555;  

const server =  app.listen(PORT, ()=> console.log(`Server started on http://localhost:${PORT}/`))
let io = socketIO(server);
let users = new Users();

const uri = "mongodb+srv://AdminBloodhub:IeowaMIAljoPPgEE@bloodhubcluster.z5jed.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error',error => console.log(error));
db.once('open', ()=> console.log("Mongoose Online & Connected"));

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));


app.get(['/'], function (req,res){
    res.render('index');
})

app.get(['/about'], function (req,res){
    res.render('about');
})


app.get('/register', function (req,res){
    res.render('register');
})

app.post('/login', async(req,res)=>{
    
    try {
        const user = req.body.user;
        const password = req.body.password;

      const userLogin = await Register.findOne({username:user});

      if (userLogin.pass === password){

        let search = await Register.find({aoe:"Marketing"})
        const ae = "Marketing"

        console.log(userLogin)

     

        app.post('/search', async (req,res)=>{
            let sData = req.body.aoe;
            let search = await Register.find({aoe:{$regex: sData,$options:'$j'}})
            .then(data=>{
                res.render('searched', {data:data,aoe:sData,user:userLogin})
            })
        })
        


        app.get("/logout",(req,res)=>{
            res.redirect("/");
        });

        app.get("/chat", (req,res)=>{
            res.render("chatLogin",{d:userLogin})
        })
        
        res.render("loggedIn",{data:userLogin,search:search,abcd:ae})
        
      }else{
        res.render('indexError')
      }
        
    } catch (error) {
        res.render('index')
    }
})

app.post('/room', (req, res) => {
    roomname = req.body.roomname;
    username = req.body.username;
    res.redirect(`/room?username=${username}&roomname=${roomname}`)
})


//Rooms
app.get('/room', (req, res)=>{
    res.render('room')
    chat()
})


    io.on('connection', (socket) => {
      console.log("A new user just connected");
    
      socket.on('join', (params, callback) => {
        if(!isRealString(params.name) || !isRealString(params.room)){
          return callback('Name and room are required');
        }
    
        socket.join(params.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room);
    
        io.to(params.room).emit('updateUsersList', users.getUserList(params.room));
        // socket.emit('newMessage', generateMessage('Admin', `Welocome to ${params.room}!`));
    
       // socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', "New User Joined!"));
    
        callback();
      })
    
      socket.on('createMessage', (message, callback) => {
        let user = users.getUser(socket.id);
    
        if(user && isRealString(message.text)){
            io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
        }
        callback('This is the server:');
      })
    
    
      socket.on('disconnect', () => {
        let user = users.removeUser(socket.id);
    
        if(user){
          io.to(user.room).emit('updateUsersList', users.getUserList(user.room));
        //  io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left ${user.room} chat room.`))
        }
      });
    });




app.post('/signup', async (req,res)=>{
    try {

        const pass = req.body.pass1;
        const cpass = req.body.pass2;

        if( pass === cpass){

            const registerUser = new Register({
                username: req.body.username,
                name:req.body.name,
                dob:req.body.dob,
                email:req.body.email,
                occupation:req.body.occupation,
                aoe:req.body.interest,
                pass:req.body.pass1,
                repass:req.body.pass2,
                gender:req.body.gender
            })

           const register = await registerUser.save();
           res.status(201).render("index")

        }else{
            res.render('register')
        }

    } catch (error) {
        res.render('register')
    }
})





