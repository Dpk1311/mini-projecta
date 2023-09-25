const express = require('express')
const app = express()


app.use(express.static('public'));
app.set('view engine', 'ejs')



app.get('/',(req,res)=>{
    res.render('user/home')
})






app.listen(4000,()=>{
    console.log('Server is at port 4000');
})