const mongoose = require("mongoose");



recipeSchema = mongoose.Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, ref:"User"},
    user_name: String,
    title: String,
    cookTime: Number,
    favorited_users: Array,
    ingredientList: Array,
    instructions: Array,
    difficulty: Number,
    //above is mandatory
    //below is optional
    description: String,
    picture: String,
    tags: Array,
})
userSchema = mongoose.Schema({
    name: String,
    googleId: String,
    profilePic: String,
    pantry: Array, 
    favorite_recipes: Array,
})

const User = mongoose.model("User", userSchema)
const Recipe = mongoose.model("Recipe", recipeSchema)

module.exports = {
    User,
    Recipe
}