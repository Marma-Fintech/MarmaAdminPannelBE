const express=require('express');
const mongoose = require('mongoose');
const router = require('./src/routes/allroutes'); // Import event routes
const morgan=require('morgan');

require('dotenv').config()

const app=express();
const port=7000;

app.use(express.json());

// Serve static files from 'uploads' directory
//app.use('/uploads', express.static('uploads'));


app.get('/', (req,res)=>{
    res.json('server running');
})

// Use event routes
app.use(router);

// Connect to MongoDB
mongoose
.connect(process.env.DBURL, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log(
    '*********🛡️ 🔍  Successfully Connected to MongoDB 🛡️ 🔍 **********'
  )
})
.catch(err => {
  console.error('MongoDB Connection Failure', err)
})

app.use(morgan(':method :url :status'));


app.listen(port,()=>{
    console.log(`server running on ${port}`);
})