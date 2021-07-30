var app = new Vue({
  el: "#app",
  vuetify: new Vuetify(),
  data: {
    server_url: "https://codeschool2121-recipe-book.herokuapp.com",
    user: {
      name: "Jerald",
    },
    page: "recipes",
    pantryPage: "default",
    searchBar: "",
    drawer: false,
    heart: false,
    pantryFilterSelect: 2,
    advance: false,
    searchDifficulty: [],
    searchTime: [],
    searchAdv: "closed",
    difficulties: [
      { name: "Beginner", v: 0 },
      { name: "Below Average", v: 1 },
      { name: "Average", v: 2 },
      { name: "Skilled", v: 3 },
      { name: "Advanced", v: 4 },
    ],
    itemsCustom: [
      "tilder",
      "Programming",
      "Vue",
      "1",
      "2",
      "3",
      "4",
      "5",
      "Vuetify",
    ],
    model: [],
    search: null,
    // hamburgerShow: false,

    times: [
      {
        UIstring: "00:30 or Less",
        value: [0, 30],
      },
      {
        UIstring: "00:30 to 1:30",
        value: [30, 90],
      },
      {
        UIstring: "1:30 to 3:00",
        value: [90, 180],
      },
      {
        UIstring: "3:00 to 5:00",
        value: [180, 300],
      },
      {
        UIstring: "5:00 or More",
        value: [300, -1],
      },
    ],
    recipes: [
      {
        // optional
        picture: "",
        // mandatory
        title: "Recipe Title",
        // automatically will display
        username: "User1234",
        // optional
        description: "This is an description",
        // mandatory
        difficulty: "Test",
        // mandatory
        cookTime: 30,
        // mandatory
        ingredientList: [
          {
            ingredientItem: "Eggs",
            quantity: 3,
          },
          {
            ingredientItem: "Flour",
            quantity: 3,
          },
        ],
        // mandatory
        instructions: [
          "Put air in a bowl",
          "Mix air with eggs and flour.",
          "Put in the microwave for 5 minutes.",
          "Pray.",
        ],
      },
    ],
    new_title: "",
    new_difficulty: "",
    new_cookTime_minutes: 0,
    new_cookTime_hours: 0,
    new_ingredients: [
      {
        ingredientItem: "",
        quantity: "",
      },
    ],
    new_instructions: [""],
    // optional
    new_picture: "",
    new_description: "",
    userIngredients: [],
    favoritedRecipes: [],
    new_userIngredients: [""],
    new_tags: [],
    loggedInUser: {},
    selectedUser: {},
    filteredRecipes: [],
  },
  created: function () {
    this.getRecipes();
    this.getLoggedInUser();
    //this.getUserFavorites();
    console.log("HI, I'm peppa Pig", this.loggedInUser);
  },
  methods: {
    toshiTest: function (myObject) {
      console.log(myObject);
    },
    uploadPantry: function (ingredients) {
      console.log("ANGRY");
      fetch(this.server_url + "/user", {
        method: "PATCH",
        body: JSON.stringify({ pantry: ingredients }),
        headers: {
          "Content-Type": "application/json",
        },
        //options for fetch
      }).then(function () {
        //code
      });
    },
    downloadPantry: function () {
      this.userIngredients = this.loggedInUser.pantry;
    },
    uploadFavorites: function (recipes) {
      console.log(recipes);
      fetch(this.server_url + "/user", {
        method: "PATCH",
        body: JSON.stringify({ favorite_recipes: recipes }),
        headers: {
          "Content-Type": "application/json",
        },
        //options for fetch
      }).then(function () {
        //code
      });
    },
    downloadFavorites: function () {
      this.favoritedRecipes = this.loggedInUser.favorite_recipes;
    },
    favoriteRecipeLogic: function (recipe) {
      let is_included = false;
      for (const index in this.favoritedRecipes) {
        if (this.favoritedRecipes[index]._id == recipe._id) {
          is_included = true;
          console.log("true");
          this.favoritedRecipes.splice(index, 1);
        }
      }
      if (!is_included) {
        console.log("MADE IT  ");
        this.favoritedRecipes.push(recipe);
        console.log("false");
      }
      this.uploadFavorites(this.favoritedRecipes);
    },
    isFavorite: function (recipe) {
      for (const index in this.favoritedRecipes) {
        if (this.favoritedRecipes[index]._id == recipe._id) {
          return true;
        }
      }
      return false;
    },
    favoriteStyling: function (recipe) {
      if (this.isFavorite(recipe)) {
        return "red";
      }
      return "gray";
    },
    getRecipes: function () {
      fetch(this.server_url + "/recipe").then(function (response) {
        response.json().then(function (data) {
          app.recipes = data;
          app.filterLogic();
          app.items = app.setAllTags();
        });
      });
    },
    deleteRecipe: function (id, uId) {
      console.log(uId);
      console.log("BIG ID:", this.server_url + "/recipe/" + id + "/" + uId);
      if (confirm("Are you Sure you want to DELETE your Recipe?")) {
        fetch(this.server_url + "/recipe/" + id + "/" + uId, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          //options for fetch
        }).then(function () {
          app.getRecipes();
        });
      }
    },
    clear_inputs: function () {
      this.new_title = "";
      this.new_difficulty = "";
      this.new_cookTime_hours = 0;
      this.new_cookTime_minutes = 0;
      this.new_ingredients = [
        {
          ingredientItem: "",
          quantity: "",
        },
      ];
      this.new_instructions = [""];
      // clear optional inputs
      this.new_picture = "";
      this.new_description = "";
      this.new_tags = [""];
      this.page = "recipes";
    },
    createRecipe: function () {
      console.log("new difficulty", this.new_difficulty);
      if (this.checkValidFormInput()) {
        console.log("SUCCESS");
        var new_recipe = {
          // mandatory inputs
          title: this.new_title,
          difficulty: this.new_difficulty + 1,

          cookTime:
            parseInt(this.new_cookTime_hours) * 60 +
            parseInt(this.new_cookTime_minutes),
          ingredientList: this.new_ingredients,
          instructions: this.new_instructions,
          username: this.new_username,
          // optional inputs
          tags: this.new_tags,
          picture: this.new_picture,
          description: this.new_description,
        };
        // push the new thread to threads list
        fetch(this.server_url + "/recipe", {
          method: "POST",
          body: JSON.stringify(new_recipe),
          headers: {
            "Content-Type": "application/json",
          },
          //options for fetch
        }).then(function () {
          app.getRecipes();
          app.clear_inputs();
        });
        // clear mandatory inputs
      } else {
        //Logic for when data isn't formatted correctly
        if (this.new_cookTime_hours === 0 && new_cookTime_minutes === 0) {
        }
      }
    },
    switchPage: function (page_name) {
      this.page = page_name;
    },
    switchPantryPage: function (pantryPage_name) {
      this.pantryPage = pantryPage_name;
    },
    btnClickSearchAdv: function (pantryPage_name) {
      this.pantryPage = pantryPage_name;
    },
    checkValidFormInput: function () {
      if (
        this.new_title === "" ||
        parseInt(this.new_cookTime_minutes) +
          parseInt(this.new_cookTime_hours) * 60 <=
          0 ||
        this.new_difficulty === ""
      ) {
        return false;
      }
      for (const ingredient in this.new_ingredients) {
        if (
          this.new_ingredients[ingredient] === "" ||
          this.new_ingredients[ingredient].quantity === ""
        ) {
          return false;
        }
      }
      for (const instruction in this.new_instructions) {
        if (this.new_instructions[instruction] === "") {
          return false;
        }
      }
      console.log(
        "TIME IS",
        parseInt(this.new_cookTime_minutes) +
          parseInt(this.new_cookTime_hours) * 60
      );
      return true;
    },
    //Oohwaoh, FILTERS BEGIN!!
    filterByParameter(callback, recipeList) {
      returnRecipes = [];
      for (const recipe in recipeList) {
        if (callback(recipeList[recipe])) {
          returnRecipes.push(recipeList[recipe]);
        }
      }
      return returnRecipes;
    },
    pantryFilterStrict(item) {
      let proxyIngredients = [];
      for (const index in this.userIngredients) {
        proxyIngredients.push(this.userIngredients[index].toLowerCase());
      }
      console.log(proxyIngredients);
      for (const i in item.ingredientList) {
        let included = false;
        for (const j in proxyIngredients) {
          if (
            item.ingredientList[i].ingredientItem
              .toLowerCase()
              .includes(proxyIngredients[j])
          ) {
            included = true;
          }
        }
        if (!included) {
          return false;
        }
      }
      return true;
    },
    pantryFilterLenient(item) {
      let proxyIngredients = [];
      for (const index in this.userIngredients) {
        proxyIngredients.push(this.userIngredients[index].toLowerCase());
      }
      console.log(proxyIngredients);
      for (const i in item.ingredientList) {
        for (const j in proxyIngredients) {
          if (
            item.ingredientList[i].ingredientItem
              .toLowerCase()
              .includes(proxyIngredients[j])
          ) {
            return true;
          }
        }
      }
      return false;
      /*
            let proxyIngredients = []
            console.log("YO MAMA")
            for (const index in this.userIngredients){
                proxyIngredients.push(this.userIngredients[index].toLowerCase())
            }
            for (const index in item.ingredientList){
                if (proxyIngredients.includes(item.ingredientList[index].ingredientItem.toLowerCase())){
                    return true
                }
            }
            return false
            */
    },
    timeFilter(item) {
      try {
        if (
          (item.cookTime >= this.searchTime[0] &&
            (this.searchTime[1] == -1 ||
              item.cookTime <= this.searchTime[1])) ||
          this.searchTime.length == 0
        ) {
          return true;
        }
        return false;
      } catch {
        console.log("FAILS");
        return true;
      }
    },
    difficultyFilter(item) {
      //this.selectedDifficulties is a placeholder
      if (
        this.searchDifficulty.includes(item.difficulty) ||
        this.searchDifficulty.length == 0
      ) {
        return true;
      }
      return false;
    },
    searchBarFilter(item) {
      //this.searchbar is a placeholder
      //ingredients, title, tags
      let mySearchList = this.searchBar.split(" ");
      truthCheckList = [true];
      for (const parameter in mySearchList) {
        let word = mySearchList[parameter].toLowerCase();
        //name filter & ingredients filter
        let wordCheck = item.title.toLowerCase().includes(word);
        let ingredientCheck = false;
        for (const ingredient in item.ingredientList) {
          if (
            item.ingredientList[ingredient].ingredientItem
              .toLowerCase()
              .includes(word) ||
            item.ingredientList[ingredient].quantity
              .toLowerCase()
              .includes(word)
          ) {
            ingredientCheck = true;
          }
        }
        //tags filter
        let tagCheck = false;
        for (const tag in item.tags) {
          let myTag = item.tags[tag];
          if (myTag.includes(word)) {
            tagCheck = true;
          }
        }
        truthCheckList.push(wordCheck || ingredientCheck || tagCheck);
      }
      return truthCheckList.every((check) => check === true);
    },
    deepCopy: function (myObject) {
      return JSON.parse(JSON.stringify(myObject));
    },
    googleLogIn: function () {
      window.location = this.server_url + "/auth/google";
    },
    googleLogOut: function () {
      window.location = this.server_url + "/auth/logout";
    },
    getLoggedInUser: function () {
      if (!this.loggedIn) {
        fetch(this.server_url + "/user").then(function (response) {
          response.json().then(function (data) {
            app.loggedInUser = data;
            console.log("MyData", data);
            app.downloadPantry();
            app.downloadFavorites();
          });
        });
        console.log(this.loggedInUser);
      }
      return this.loggedInUser;
    },
    getSpecificUser: function (id) {
      if (!id) {
        this.selectedUser = "";
        return;
      }
      console.log("THIS IS THE THIS USER", this.selectedUser);
      console.log("MY ID IS", id);
      fetch(this.server_url + "/user/" + id).then(function (response) {
        response.json().then(function (data) {
          console.log("MY DATA AAAAAAAA", data);
          app.selectedUser = data;
        });
      });
    },
    isLoggedIn: function () {
      if (this.loggedInUser._id) {
        return true;
      }
      return false;
    },
    filterLogic() {
      returnRecipes = this.recipes;
      returnRecipes = this.filterByParameter(
        this.searchBarFilter,
        returnRecipes
      );
      if (this.advance) {
        this.filterByParameter(this.difficultyFilter, returnRecipes);
        this.filterByParameter(this.timeFilter, returnRecipes);
        if (this.pantryFilterSelect == 0) {
          this.filterByParameter(this.pantryFilterStrict, returnRecipes);
        } else if (this.pantryFilterSelect == 1) {
          this.filterByParameter(this.pantryFilterLenient, returnRecipes);
        }
      }
      this.filteredRecipes = returnRecipes;
    },
    setAllTags() {
      console.log("WAWAAWAWAWAW");

      this.itemsCustom = [];
      for (const i in this.recipes) {
        for (const j in this.recipes[i].tags) {
          if (!this.itemsCustom.includes(this.recipes[i].tags[j])) {
            this.itemsCustom.push(this.recipes[i].tags[j]);
          }
        }
      }
    },
  },
  computed: {
    emptyPantry: function () {
      for (const index in this.userIngredients) {
        if (this.userIngredients[index]) {
          return false;
        }
      }
      return true;
    },
  },
  watch: {
    model(val) {
      if (val.length > 5) {
        this.$nextTick(() => this.model.pop());
      }
    },
  },
});
// Error with difficulty when submitting createRecipe(). Look into later
