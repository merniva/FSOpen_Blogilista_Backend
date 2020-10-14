const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./test_helper");
const app = require("../app");
const api = supertest(app);
const bcrypt = require("bcrypt");
const User = require("../models/user");

describe("When there is initially one user at db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("sekret", 10);
    const user = new User({ username: "root", passwordHash });

    await user.save();
  });

  test("Uuden käyttäjän luominen onnistui", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "testikauttaja",
      name: "Kauttaja Testi",
      password: process.env.PASSWORD1,
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test("Jos käyttäjänimi on varattu, palautetaan virheviesti+oikea statuskoodi", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "root",
      name: "Superuser",
      password: process.env.PASSWORD2,
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("`username` to be unique");

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd.length).toBe(usersAtStart.length);
  });

  test("Tyhjä käyttäjänimi palauttaa virheviestin+statuksen", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "",
      name: "Kauttaja Testi",
      password: process.env.PASSWORD1,
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("Käyttäjänimi on pakollinen tieto");

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd.length).toBe(usersAtStart.length);
  });

  test("Tyhjä salasana palauttaa virheviestin+statuksen", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "Validikayttis",
      name: "Kauttaja Testi",
      password: "",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("Salasana on pakollinen");

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd.length).toBe(usersAtStart.length);
  });

  test("Liian lyhyt käyttäjänimi palauttaa virheviestin+statuksen", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "Va",
      name: "Kauttaja Testi",
      password: process.env.PASSWORD2,
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain(
      "Käyttäjänimen tulee olla vähintään kolme merkkiä pitkä"
    );

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd.length).toBe(usersAtStart.length);
  });

  test("Liian lyhyt salasana palauttaa virheviestin+statuksen", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "Validikayttis",
      name: "Kauttaja Testi",
      password: "Ih",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain(
      "Salasanan tulee olla vähintään kolme merkkiä pitkä"
    );

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd.length).toBe(usersAtStart.length);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
