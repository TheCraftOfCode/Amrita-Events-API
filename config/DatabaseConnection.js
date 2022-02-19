const mongoose = require('mongoose');
module.exports = function(){
    mongoose.connect('mongodb://localhost/amrita-events-api', { useNewUrlParser: true });
    mongoose.connection.on('error', function(err){
        console.log('Mongoose connection error: ' + err);
    });
    mongoose.connection.on('open', function(){
        console.log('Mongoose connected successfully');
    });
}