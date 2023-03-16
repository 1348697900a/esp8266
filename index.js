// const express = require('express');
// import express from 'express'
// const bodyParser = require('body-parser');

// const app = express();
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false}));

// app.get('/getID', function (req, res) {
//     setTimeout(() => {
//         const ID = String(Math.floor(Math.random()*127));
//         const obj = {
//             code:0,
//             id:ID
//         }
//         console.log(JSON.stringify(obj))
//         res.send(JSON.stringify(obj))
//     },100)
   
// })
// app.post("/addUser",(req,res) => {
//     //console.log(req);
//     console.log(req.body.ID);
//     res.send("receive ID:");
// })
// app.listen(8081, function () {
 
//   console.log('server start!');
 
// })
const arr = ['list'];
arr.reduce((cur,pre) => {
  console.log(cur);
  console.log(pre);
},{})