const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./test_helper");
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
      const passwordHash = await bcrypt.hash(process.env.PASSWORD3, 10);
      const user = new User({ username: "salakayttis", passwordHash });
      const userForToken = {
        username: user.username,
        id: user._id,
      };
      const token = jwt.sign(userForToken, process.env.SECRET);
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
