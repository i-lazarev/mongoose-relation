const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// connect to mongo db with all this strange options
// so you do not get all these annyoing warnings on connecting
mongoose.connect(
  "mongodb://localhost/users_db",
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  },
  err => {
    if (!err) {
      console.log("MongoDB Connection succeeded");
    } else {
      console.log("Error on DB connection: " + err);
    }
  }
);

// Create User Model
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    roles: [String]
  })
);

const Todo = mongoose.model(
  "Todo",
  new mongoose.Schema({
    title: { type: String, required: true },
    status: {
      type: String,
      enum: ["OPEN", "IN PROCESS", "ON HOLD", "CANCELED"],
      default: "OPEN"
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  })
);
// parse incoming JSON data (from fetch or browser client)
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/user/:id/todos/seed", (req, res, next) => {
  User.findById(req.params.id).then(user => {
    if (!user) {
      return next(`This user not exist`);
    }
    console.log(user);
    Todo.insertMany([
      { title: "Wake up", user: user._id },
      { title: "Drink coffe", status: "IN PROCESS", user: user._id },
      { title: "Go to Sleep", status: "CANCELED", user: user._id }
    ]).then(todo => res.send(todo));
  });
});

app.get("/users/seed", (req, res) => {
  // array of users to create
  let users = [
    { email: "admin@dci.de", password: "admin", roles: ["Admin"] },
    { email: "user1@dci.de", password: "pw1", roles: ["Guest"] },
    { email: "user2@dci.de", password: "pw2", roles: ["Reader", "Editor"] }
  ];

  // hash password for each user (using bcrypt)
  let usersHashed = users.map(user => {
    user.password = bcrypt.hashSync(user.password, 10);
    return user;
  });

  // insert users into MongoDB
  User.insertMany(usersHashed).then(usersNew => res.send(usersNew));
});

app.get("/todos", (req, res) => {
  Todo.find()
    .populate("user")
    .then(todo => res.send(todo));
});
//creating a todo
app.post("/todo/create", (req, res, next) => {
  console.log(req.body);
  User.findById(req.body.user)
    .then(user => {
      if (!user) {
        return next(`This user not exist`);
      }
      Todo.create({ title: req.body.title, user: user._id }).then(todo =>
        res.send(todo)
      );
    })
    .catch(err => next(err));
});
//updating a todo
app.patch("/todo/update/:id", (req, res) => {
  Todo.findOneAndUpdate(req.params.id, req.body, { new: true }).then(todo =>
    res.send(todo)
  );
});

//delete a todo
app.delete("/todo/delete/:id", (req, res) => {
  Todo.findOneAndDelete(req.params.id).then(res.send("the todo was deleted"));
});

// handle incoming LOGIN requests here....
app.post("/login", (req, res, next) => {
  // find user
  User.findOne({ email: req.body.email })
    .then(user => {
      // user with this email not found? => error
      if (!user) {
        return next(`Authentication failed`);
      }
      // compare passwords using bcrypt.compare() function
      bcrypt.compare(req.body.password, user.password).then(success => {
        // user password does not match password from login form? => error
        if (!success) {
          return next(`Authentication failed`);
        }
        // create JWT token by signing
        let secret = "jwt-master-secret";
        let token = jwt.sign(
          { id: user.id, email: user.email }, // WHAT data to sign
          secret, // signing key
          { expiresIn: "1h" } // expiry time
        );

        // return token
        res.send({ token }); // => same as: { "token": token }
      });
    })
    .catch(err => next(err));
});

let port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}!`);
});

//Run app, then load http://localhost:port in a browser to see the output.
