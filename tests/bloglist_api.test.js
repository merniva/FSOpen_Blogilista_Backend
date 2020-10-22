const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("../utils/test_helper");
const tokenHelper = require("../utils/token_helper");
const app = require("../app");
const api = supertest(app);
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const Blog = require("../models/blog");

describe("Blogien haku", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
    const promiseArray = blogObjects.map((blog) => blog.save());
    await Promise.all(promiseArray);
  });

  test("Lista blogeista json-muodossa", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("Testataan id-kentän olemassaolo", async () => {
    const listOfBlogs = await helper.blogsInDb();
    const blogToCheck = listOfBlogs[0];
    expect(blogToCheck.id).toBeDefined();
  });

  describe("Blogin lisäys", () => {
    test("blogin onnistunut lisäys", async () => {
      const { token, user } = await tokenHelper("jestikayttis");
      await user.save();
      const newBlog = {
        title: "Mlogi",
        author: "Mihminen",
        url: "www.ma.fi",
        likes: 7,
      };
      await api
        .post("/api/blogs")
        .send(newBlog)
        .set("Authorization", `bearer ${token}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      const lengthAtEnd = await helper.blogsInDb();
      expect(lengthAtEnd).toHaveLength(helper.initialBlogs.length + 1);

      const contents = lengthAtEnd.map((list) => list.title);
      expect(contents).toContain("Mlogi");
    });

    test("jos likesille ei anneta arvoa, arvo -> 0", async () => {
      const { token, user } = await tokenHelper("testikayttis");

      await user.save();
      const newBlog = {
        title: "Vlogi",
        author: "Vihminen",
        url: "www.va.fi",
        likes: "",
      };
      const currentBlogs = await helper.blogsInDb();
      const currentContents = currentBlogs.map((list) => list.likes);
      expect(currentContents).not.toContain(0);
      await api
        .post("/api/blogs")
        .send(newBlog)
        .set("Authorization", `bearer ${token}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      const lengthAtEnd = await helper.blogsInDb();
      expect(lengthAtEnd).toHaveLength(helper.initialBlogs.length + 1);

      const contents = lengthAtEnd.map((list) => list.likes);
      expect(contents).toContain(0);
    });

    test("jos titleä tai urlia ei löydy, palautetaan 400", async () => {
      const { token, user } = await tokenHelper("kustikayttis");
      await user.save();
      const newBlog = {
        title: "",
        author: "Sihminen",
        url: "",
        likes: "8",
      };
      await api
        .post("/api/blogs")
        .send(newBlog)
        .set("Authorization", `bearer ${token}`)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      const lengthAtEnd = await helper.blogsInDb();
      expect(lengthAtEnd).toHaveLength(helper.initialBlogs.length);
    });

    test("blogin lisäys ilman tokenia ei onnistu", async () => {
      const passwordHash = await bcrypt.hash(process.env.PASSWORD3, 10);
      const user = new User({ username: "salainenkayttis", passwordHash });
      const token = null;
      await user.save();
      const newBlog = {
        title: "Blogi",
        author: "Bihminen",
        url: "www.ba.fi",
        likes: 7,
      };
      await api
        .post("/api/blogs")
        .send(newBlog)
        .set("Authorization", `bearer ${token}`)
        .expect(401)
        .expect("Content-Type", /application\/json/);

      const lengthAtEnd = await helper.blogsInDb();
      expect(lengthAtEnd).toHaveLength(helper.initialBlogs.length);
    });
  });

  describe("Blogin poisto", () => {
    test("blogin onnistunut poisto", async () => {
      const lengthAtStart = await helper.blogsInDb();
      const blogToDelete = lengthAtStart[0];

      await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

      const lengthAtEnd = await helper.blogsInDb();

      expect(lengthAtEnd).toHaveLength(helper.initialBlogs.length - 1);

      const contents = lengthAtEnd.map((list) => list.title);
      expect(contents).not.toContain(blogToDelete.title);
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
});
