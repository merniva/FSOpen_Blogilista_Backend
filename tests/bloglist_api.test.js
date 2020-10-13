const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Blog = require("../models/blog");

const api = supertest(app);

const initialBlogs = [
  {
    title: "Mukava blogi",
    author: "Mukava ihminen",
    url: "www.mukava.fi",
    likes: 17,
  },
  {
    title: "Blogi",
    author: "Mun",
    url: "www.mua.fi",
    likes: 18,
  },
];
beforeEach(async () => {
  await Blog.deleteMany({});
  let blogObject = new Blog(initialBlogs[0]);
  await blogObject.save();
  blogObject = new Blog(initialBlogs[1]);
  await blogObject.save();
});

test("lista blogeista json-muodossa", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("blogin onnistunut lisäys", async () => {
  const newBlog = {
    title: "Mlogi",
    author: "Mihminen",
    url: "www.ma.fi",
    likes: 7,
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  const res = await api.get("/api/blogs");

  const contents = res.body.map((list) => list.url);

  expect(res.body).toHaveLength(initialBlogs.length + 1);
});

afterAll(() => {
  mongoose.connection.close();
});
