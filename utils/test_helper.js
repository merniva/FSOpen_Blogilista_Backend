const Blog = require("../models/blog");
const User = require("../models/user");

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

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

module.exports = {
  initialBlogs,
  blogsInDb,
  usersInDb,
};
