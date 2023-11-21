const express = require('express')
const session = require('express-session');
const app = express()
const path = require('path')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nocache = require('nocache')
const dotenv = require('dotenv');;
dotenv.config();
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(nocache())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));

const clientrouter = require('./routes/clientRoutes')
const adminrouter = require('./routes/adminRoutes')

app.use(session({
    secret: 'your-secret-key', // Change this to a secure secret
    resave: false,
    saveUninitialized: false,
}));


const PORT = process.env.PORT;
const dbURI = process.env.DB_URI;

mongoose.connect(dbURI)
.then(()=>{ 
    console.log('Database Connected');
})
.catch(()=>{
    console.log('Failed to connect');
})


app.use('/',clientrouter)
app.use('/',adminrouter)
app.use('*', (req, res) => {
    res.status(404).send('Error: Page not found');
  });
  
 

app.listen(PORT,()=>{
    console.log('Server is at port 4000');
})