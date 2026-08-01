const express = require('express');
const app=express();
require('dotenv').config();
const path=require('path');

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get('/',(req,res)=>{
    res.send("Hello World");
});