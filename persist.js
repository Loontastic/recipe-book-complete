const mongoose = require("mongoose")
function connect(callback) {
    let connectionString = `mongodb+srv://tilder_2021:myCoolPassword@cluster0.jpjzl.mongodb.net/recipeBook?retryWrites=true&w=majority`
    console.log("Connecting to server...")
    mongoose.connect(
        connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).catch((err) =>{
        console.log("There was an error connecting to mango: ", err);
    })
    mongoose.connection.once('open', callback)
}

module.exports = connect;