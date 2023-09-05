const mongoose = require('mongoose')

const connectDB = (url) => {
    return mongoose
        .connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then((res)=>{
            console.log('Database connected');
        }).catch((err)=>{
            console.log(`Error : ${err}`);
        })
}

module.exports = connectDB