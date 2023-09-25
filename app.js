const express = require('express')
const app = express()
const path = require('path')


app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')



app.get('/',(req,res)=>{
    res.render('user/home')
})






app.listen(4000,()=>{
    console.log('Server is at port 4000');
})