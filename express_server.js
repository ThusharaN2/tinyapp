const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  }
}

function generateRandomString() { //unique shortURL
  let randomString = "";
  const randomChar = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  while (randomString.length < 6) {
    randomString += randomChar[Math.floor(Math.random() * randomChar.length)];
  }
  return randomString;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: res.cookie.user_id };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`)
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
const longURL = urlDatabase[req.params.shortURL].longURL;
res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let templateVars = {user: res.cookie.user_id }
  res.render("registration",templateVars);
});

app.post("/register",(req,res) => {
  const randomUserID = generateRandomString();
  users[randomUserID] = {
    id: randomUserID,
    email: req.body.email,
    password: req.body.password,
  }
  console.log(users);
  res.cookie("user_id", randomUserID);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  res.cookie("user_id", users.user_id);
  res.redirect('/urls')
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls');
})

app.get("/urls/new", (req, res) => {
  const templateVars = {user: res.cookie.user_id}
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL:urlDatabase[req.params.shortURL], user: res.cookie.user_id};
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => { //removes URL resource
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


