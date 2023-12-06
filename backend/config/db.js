//database bağlantısı

const mongoose = require('mongoose')

const db = () => {
    mongoose.connect('mongodb+srv://recepcelik:brf1622002@cluster0.u7tkwp8.mongodb.net/', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log("mongoDB is connected !!!")
    })
    .catch((err) => {
        console.log(err)
    })
}

module.exports = db