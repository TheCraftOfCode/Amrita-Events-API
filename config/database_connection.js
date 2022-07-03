const mongoose = require('mongoose');
module.exports = function(){
    const DatabaseConnection = mongoose.connect(
        process.env.DBCONN
    );
    DatabaseConnection.then(() => {
        console.log("Database connection was successful!");
    });
    DatabaseConnection.catch((error) => {
        console.log(`Database connection refused`, error);
    });
}