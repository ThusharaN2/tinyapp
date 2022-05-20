function generateRandomString() { //unique shortURL
  let randomString = "";
  const randomChar = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  while (randomString.length < 6) {
    randomString += randomChar[Math.floor(Math.random() * randomChar.length)];
  }
  return randomString;
}

//finds user by email in db
// const getUserByEmail = (email, database) => {
//   for (const key in database) {
//     if (database[key].email === email) {
//       return database[key];
//     }
//   }
//   return undefined;
// };

//fcn makes sure that the email is same as email in db
const lookForEmail = (email, database) => {
  for (let user in database) {
    if (email === database[user].email) {
      return database[user];
    }
  }
  return undefined;
};

//accesses the urls for the user
const urlsForUser = (id, database) => {
  const userURLs = {};
  for (const url in database) {
    if (id === database[url].userID) {
      userURLs[url] = database[url];
    }
  }
  return userURLs;
};

module.exports = { generateRandomString, urlsForUser, lookForEmail}