const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv');
const db = require('./config/db.js');
const product = require('./routes/product.js')
const user = require('./routes/user.js')
const cloudinary = require('cloudinary').v2;


dotenv.config();

cloudinary.config({ //=> cloudinary konfigürasyonu
    cloud_name: 'du0z2rnjf', 
    api_key: '342817829165293', 
    api_secret: '***************************' 
  });

const app = express(); //=> express app oluşturulması

app.use(cors())
app.use(bodyParser.json({limit: "30mb", extended: true})) //=> middlewarelar
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}))
app.use(cookieParser())

app.use('/', product) //=> routes
app.use('/', user)

db(); //=> mongoDB connection 

const PORT = 4000; //=> belirli bir port üzerinden listen edilmesi
app.listen(PORT, () => {
    console.log("server is running on port 4000")
})