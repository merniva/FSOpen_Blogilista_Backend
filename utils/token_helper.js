const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const tokenHelper = async (name) => {
    const passwordHash = await bcrypt.hash(process.env.PASSWORD3, 10);
    const user = new User({ username: name, passwordHash });
    const userForToken = {
      username: user.username,
      id: user._id,
    };
    const token = jwt.sign(userForToken, process.env.SECRET);
    return {token, user};
}

module.exports = tokenHelper;
  
