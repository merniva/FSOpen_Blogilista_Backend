const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.get("/", async (req, res) => {
  const users = await User.find({}).populate("blogs", {
    url: 1,
    author: 1,
    title: 1,
    id: 1,
  });
  res.json(users.map((u) => u.toJSON()));
});

usersRouter.post("/", async (req, res) => {
  const body = req.body;
  if (!body.username) {
    return res.status(400).json({ error: "Käyttäjänimi on pakollinen tieto!" });
  } else if (!body.password) {
    return res.status(400).json({ error: "Salasana on pakollinen!" });
  } else if (body.username.length < 3) {
    return res
      .status(400)
      .json({
        error: "Käyttäjänimen tulee olla vähintään kolme merkkiä pitkä!",
      });
  } else if (body.password.length < 3) {
    return res
      .status(400)
      .json({ error: "Salasanan tulee olla vähintään kolme merkkiä pitkä!" });
  }
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  });

  const savedUser = await user.save();

  res.json(savedUser);
});

module.exports = usersRouter;
