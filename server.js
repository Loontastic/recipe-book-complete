const express = require("express");
const cors = require("cors");
const { User, Recipe } = require("./model");
const server = express();

server.use(cors());
server.use(express.json({}));
server.use(express.static("static"));

let userPropertyList = ["name"];
let recipePropertyList = [
  "ingredientList",
  "instructions",
  "title",
  "cookTime",
  "difficulty",
  "tags",
  "description",
  "picture",
];
let requiredProperties = [
  "ingredientList",
  "instructions",
  "title",
  "cookTime",
  "difficulty",
];

//-----------------------PASSPORT-------------------------------
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const keys = require("./keys");
const cookieSession = require("cookie-session");

server.use(
  cookieSession({
    // milliseconds of a day
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_KEY],
  })
);
server.use(passport.initialize());
server.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL:
        "https://codeschool2121-recipe-book.herokuapp.com/auth/google/redirect",
    },
    (accessToken, refreshToken, profile, done) => {
      // passport callback function
      //check if user already exists in our db with the given profile ID
      User.findOne({ googleId: profile.id }).then((currentUser) => {
        console.log("THE PROFILE IS:", profile);
        if (currentUser) {
          //if we already have a record with the given profile ID
          done(null, currentUser);
        } else {
          console.log("PICTURE", profile.picture);
          //if not, create a new user
          new User({
            name: profile.displayName,
            googleId: profile.id,
            profilePic: profile._json.picture,
          })
            .save()
            .then((newUser) => {
              done(null, newUser);
              console.log("THIS IS A NEW USER I GUESS", newUser);
            });
        }
      });
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});
server.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile"],
  })
);
server.get(
  "/auth/google/redirect",
  passport.authenticate("google"),
  (req, res) => {
    res.redirect("../../");
  }
);
server.get("/auth/logout", (req, res) => {
  req.logout();
  res.redirect("../../");
});

//--------------------PASSPORT END--------------------------------

module.exports = server;

//get all users
server.get("/users", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  User.find({}, (err, user) => {
    if (err) {
      console.log(`there was an error finding all the users`);
      res
        .status(500)
        .send(
          JSON.stringify({ message: `unable to find the users`, error: err })
        );
      return;
    }
    res.status(200).json(user);
  });
});
//get user by logged in
server.get("/user", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (req.user) {
    res.status(200).json(req.user);
  } else {
    res.status(500).send(
      //User isn't logged in
      JSON.stringify({})
    );
  }
});
server.get("/user/:id", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  User.findById(req.params.id, (err, user) => {
    if (err) {
      console.log(`there was an error finding the user`);
      res.status(500).send(
        JSON.stringify({
          message: `unable to find user with id ${req.params.id}`,
          error: err,
        })
      );
      return;
    } else if (!user) {
      console.log(`there was an error finding the user`);
      res.status(500).send(
        JSON.stringify({
          message: `unable to find user with id ${req.params.id}`,
          error: "This user doesn't exist!",
        })
      );
      return;
    }
    res.status(200).json(user);
  });
});
//get all recipes / get recipes filtered by a parameter
server.get("/recipe", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  Recipe.find({}, (err, recipe) => {
    if (err) {
      console.log(`there was an error finding all the recipes`);
      res
        .status(500)
        .send(
          JSON.stringify({ message: `unable to find the recipes`, error: err })
        );
      return;
    }
    res.status(200).json(recipe);
  });
});

//get recipe by id
server.get("/recipe:id", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  Recipe.findById(req.params.id, (err, recipe) => {
    if (err) {
      console.log(`there was an error finding the recipe`);
      res.status(500).send(
        JSON.stringify({
          message: `unable to find recipe with id ${req.params.id}`,
          error: err,
        })
      );
      return;
    } else if (!recipe) {
      console.log(`there was an error finding the recipe`);
      res.status(500).send(
        JSON.stringify({
          message: `unable to find recipe with id ${req.params.id}`,
          error: "This recipe doesn't exist!",
        })
      );
      return;
    }
    res.status(200).json(recipe);
  });
});
//create a recipe
server.post("/recipe", (req, res) => {
  if (!req.user) {
    res.status(500).send(JSON.stringify({ message: "Error: Not logged in" }));
    return;
  }
  res.setHeader("Content-Type", "application/json");
  console.log(`creating a recipe with a body`, req.body);
  for (const property in requiredProperties) {
    if (
      req.body[recipePropertyList[property]] === "" ||
      req.body[recipePropertyList[property]] === 0 ||
      req.body[recipePropertyList[property]] === [""] ||
      req.body[recipePropertyList[property]] ===
        [
          {
            ingredientItem: "",
            quantity: "",
          },
        ]
    ) {
      res.status(500).send(
        JSON.stringify({
          message: "Unable to create recipe",
          error: "Description or name empty when creating recipe",
        })
      );
      return;
    }
  }
  let creatingRecipe = {
    title: "",
    user_id: req.user._id,
    user_name: req.user.name,
    cookTime: 0,
    ingredientList: [],
    instructions: [],
    difficulty: 0,
    description: "",
    picture: "",
    //may add default
    tags: [],
  };
  for (const property in recipePropertyList) {
    if (req.body[recipePropertyList[property]]) {
      creatingRecipe[recipePropertyList[property]] =
        req.body[recipePropertyList[property]];
    }
  }
  Recipe.create(creatingRecipe, (err, recipe) => {
    if (err) {
      console.log(`unable to create recipe`);
      res.status(500).json({
        message: "unable to create recipe",
        error: err,
      });
      return;
    }
    res.status(201).json(recipe);
  });
});
//patch recipe by id
server.patch("/recipe/:id/:uId", (req, res) => {
  if (!(req.user.id == req.params.uId)) {
    return;
  }
  res.setHeader("Content-Type", "application/json");
  let updateRecipe = {};
  for (const property in recipePropertyList) {
    if (req.body[recipePropertyList[property]]) {
      //Won't update if req body is false, null, or undefined
      //This isn't an issue for us since we don't use Booleans.
      updateRecipe[recipePropertyList[property]] =
        req.body[recipePropertyList[property]];
    }
  }
  Recipe.updateOne(
    { _id: req.params.id },
    updateRecipe,
    function (err, updateOneResponse) {
      if (err) {
        console.log(`there was an error`);
        res.status(500).send(
          JSON.stringify({
            message: `unable to find recipe with id ${req.params.id}`,
            error: err,
          })
        );
        return;
      } else if (updateOneResponse === 0) {
        res.status(404).send(
          JSON.stringify({
            message: `unable to find recipe with id ${req.params.id}`,
            error: "this recipe doesn't exist!",
          })
        );
        return;
      }
      res.status(200).send("Success updating!");
    }
  );
});
//patch user by id
server.patch("/user", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (!req.user) {
    res.status(500).send(JSON.stringify({ message: "Error: Not logged in" }));
    return;
  }
  let updateUser = {};
  if (req.body.pantry || req.body.pantry === []) {
    updateUser.pantry = req.body.pantry;
  }
  if (req.body.favorite_recipes || req.body.favorite_recipes === []) {
    updateUser.favorite_recipes = req.body.favorite_recipes;
  }
  User.updateOne(
    { _id: req.user.id },
    updateUser,
    function (err, updateOneResponse) {
      if (err) {
        console.log(`there was an error`);
        res.status(500).send(
          JSON.stringify({
            message: `unable to find user with id ${req.user.id}`,
            error: err,
          })
        );
        return;
      } else if (updateOneResponse === 0) {
        res.status(404).send(
          JSON.stringify({
            message: `unable to find user with id ${req.user.id}`,
            error: "this user doesn't exist!",
          })
        );
        return;
      }
      console.log("SUCcess!");
      console.log(updateUser);
      res.status(200).send(`Success updating!`);
    }
  );
});
//delete a user
server.delete("/user/:id", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  User.findByIdAndDelete(req.params.id, (err, user) => {
    if (err) {
      console.log(`there was an error`);
      res.status(500).send(
        JSON.stringify({
          message: `unable to find user with id ${req.params.id}`,
          error: err,
        })
      );
      return;
    } else if (!user) {
      res.status(500).send(
        JSON.stringify({
          message: `unable to find user with id ${req.params.id}`,
          error: "this user doesn't exist!",
        })
      );
      return;
    }
    res.status(200).json(user);
  });
});
//delete a recipe
server.delete("/recipe/:id/:userID", (req, res) => {
  if (!(req.params.userID == req.user.id)) {
    return;
  }
  res.setHeader("Content-Type", "application/json");
  Recipe.findByIdAndDelete(req.params.id, (err, recipe) => {
    if (err) {
      console.log(`there was an error`);
      res.status(500).send(
        JSON.stringify({
          message: `unable to find recipe with id ${req.params.id}`,
          error: err,
        })
      );
      return;
    } else if (!recipe) {
      res.status(500).send(
        JSON.stringify({
          message: `unable to find recipe with id ${req.params.id}`,
          error: "this recipe doesn't exist!",
        })
      );
      return;
    }
    res.status(200).json(recipe);
  });
});

server.get("/wipeUsers", (req, res) => {
  User.deleteMany({}, (err, users) => {
    if (err) {
      console.log("ERROR");
      res.status(500).send(
        JSON.stringify({
          message: "couldn't delete users",
          error: err,
        })
      );
      return;
    }
  });

  res.status(200).send("SUCCESS");
});
server.get("/wipeRecipes", (req, res) => {
  Recipe.deleteMany({}, (err, recipe) => {
    if (err) {
      console.log("ERROR");
      res.status(500).send(
        JSON.stringify({
          message: "couldn't delete recipes",
          error: err,
        })
      );
      return;
    }
  });

  res.status(200).send("SUCCESS");
});
