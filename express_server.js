const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieSession= require("cookie-session");
app.use(cookieSession({name: "session", keys: ["userID"]}));
app.set("view engine", "ejs");
const { generateRandomString, urlsForUser, lookForEmail} = require("./helpers");
const bcrypt = require("bcryptjs");

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
  }
};

app.get("/", (req, res) => {
  if(!req.session.userID) {
res.redirect("/login")
  }
  res.send("Hello!");
});


app.get("/login", (req, res) => {
  const templateVars = {user: users[req.session.user_id]};
  res.render("urls_login",templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {user: users[req.session.user_id] };
  res.render("urls_registration",templateVars);
});

app.post("/register",(req,res) => {
  const email = req.body.email
  const password = req.body.password
  const randomUserID = generateRandomString();
const userObj = {
  id: randomUserID,
      email: req.body.email,
      password: bycript.hashSync(password, ponyBoy)
    };
const userEmail = lookForEmail(email, users)
  if (userObj.email === "" || userObj.password === "") {
    res.status(400).send("Status Code: 400, Bad Request.");
  } else if (!userEmail) {
    console.log(users);
    res.session("user_id", randomUserID);
    res.redirect("/urls");
  } else {
    return res.status(400).send("Oops, looks like the email provided is already registed");
    };
    res.redirect("/urls")
  });


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlsForUser(req.session.userID, urlDatabase), user: users[req.session.user_id] };
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.session.user_id]};
    res.render("urls_new",templateVars);
    if (!req.session.userID) {
      res.redirect("/login")
    } else {
      res.render("urls_new", templateVars)
    }
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    res.status(400).send("Error 404: Not logged in");
  } else if (urlDatabase[req.params.shortURL].userID === req.session["userID"]) {
    const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session["userID"]]};
    res.render("urls_show", templateVars);
  } else {
    res.status(400).send("Error 400: You aren't logged in");
  }
});



app.post("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id].userID === req.session["userID"]) {
  let longURL = req.body.longURL
  console.log(longURL)
  urlDatabase[req.params.id.longURL] = req.body.longURL;
  res.redirect('/urls');
  } else {
    res.status(403).send(`Error: ${statusCode} Try again`)
  }
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const shortURL = generateRandomString();
  const longURL = req.body.longURL
  const userID = req.session["userID"]
  urlDatabase[shortURL] = {longURL, userID}
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => { //removes URL resource
  console.log(`${req.params.shortURL} DELETE`)
  if(urlDatabase[req.params.shortURL].userID === req.session["userID"]){
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
} else {
  res.status(403).send(`Error: ${statusCode} Please try again`)
}
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userEmail = lookForEmail(email, users)
if (email === userEmail && password) {
  if (bcrypt.compareSync(password, users.password)){
    const userId = lookForEmail(email, users)
    res.session("user_id", users.user_id)
    res.redirect("/urls")
} else {
  res.status(403).send("Status code 403: Email or password is incorect")
}
} else {
  res.status(403).semd("Status Cide 403: Email not registered")
}
});
    
app.post("/logout", (req, res) => {
  res.session('user_id');
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});