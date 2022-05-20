//express
const express = require("express");
const app = express();

// default port 8080
const PORT = 8080;

//body parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

//cookie session
const cookieSession = require("cookie-session");
app.use(cookieSession({ name: "session", keys: ["userID"] }));

//ejs
app.set("view engine", "ejs");

//helper functions
const { generateRandomString, urlsForUser, lookForEmail, getUserByEmail} = require("./helpers");

//password bcrypt
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "thusharan@hotmail.com",
    password: "$2a$10$pEP5YSNCSGJ13VN57afPQuHk7CrbfnzLrAfNQfkCIQvDtBJmVu7nC",
  }
};

//redirects to login if not signed in, or else /urls
app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login")
  } else {
    res.redirect("/urls");
  }
});

//Register GET & POST
app.get("/register", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.render("urls_registration", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const randomUserID = generateRandomString();
  const userObj = {
    id: randomUserID,
    email: req.body.email,
    password: bcrypt.hashSync(password, salt)
  };
  if (email === "" || password === "") {
    return res.status(400).send("Please provide a valid email and address!");
  }
  const userEmail = lookForEmail(email, users)
  if (userObj.email === "" || userObj.password === "") {
    res.status(400).send("Status Code: 400, Bad Request.");
  } else if (!userEmail) {
    users[randomUserID] = userObj 
    req.session.user_id = randomUserID //sets cookie session
    return res.redirect("/urls");
  } else {
    return res.status(400).send("Oops, looks like the email provided is already registed");
  };
  res.redirect("/urls")
});


//Login GET & POST
app.get("/login", (req, res) => {
  if (req.session.user_id) res.redirect('/urls');
  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userEmail = lookForEmail(email, users)
  const userPassword = getUserByEmail(userEmail, users)?.password
  if (email === userEmail && password) {
    if (bcrypt.compareSync(password, userPassword)) {
      for (let user in users) {
        if (users[user].email === userEmail) {
          req.session.user_id = user;
        }
      }
      res.redirect("/urls")
    }
  } else {
    res.status(403).send("Status code 403: Email or password is incorect")
  }
});

//Logout
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});


//urls routes
app.get("/urls", (req, res) => {
  const sessionUserID = req.session.user_id
  const templateVars = { urls: urlsForUser(req.session.user_id, urlDatabase), user: users[sessionUserID] };1
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_new", templateVars);
  if (req.session.user_id) {
    res.redirect("/login")
  } else {
    res.render("urls_new", templateVars)
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    res.status(400).send("Error 404: Not logged in");
  } else if (urlDatabase[req.params.shortURL].userID === req.session["user_id"]) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session["userID"]] };
    res.render("urls_show", templateVars);
  } else {
    res.status(400).send("Error 400: You aren't logged in");
  }
});

//edit fcn
app.post("/urls/:id", (req, res) => {
  console.log(req.body)
  if (urlDatabase[req.params.id].userID === req.session["user_id"]) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect('/urls');
  } else {
    res.status(403).send(`Error: ${statusCode} Try again`)
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL
  const userID = req.session["user_id"]
  urlDatabase[shortURL] = { longURL, userID }
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => { //removes URL resource
  if (urlDatabase[req.params.shortURL].userID === req.session["user_id"]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(403).send(`Error: ${statusCode} Please try again`)
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//listens to port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});