const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

/*
 *
 * 6 tehtävää tekemättä!
 * 4.6 + 4.7 + 4.11 + 4.12 + 4.20 + 4.21
 */

const getTokenFrom = req => {
  const authorization = req.get("authorization")
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.substring(7)
  }
  return null;
}

blogsRouter.get("/", async (req, res) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1, id: 1})
  res.json(blogs.map((blog) => blog.toJSON()));
});

blogsRouter.post("/", async (req, res) => {
  const body = req.body;

  const token = getTokenFrom(req);
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: "Token on väärä tai puuttuu kokonaan!" })
  }
  const user = await User.findById(decodedToken.id);

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  res.json(savedBlog.toJSON());
});

blogsRouter.delete("/:id", async (req, res) => {
  await Blog.findByIdAndRemove(req.params.id);
  res.status(204).end();
});

blogsRouter.put("/:id", async (req, res) => {
  const body = req.body;
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  };
  const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, {
    new: true,
  });
  res.json(updatedBlog);
});

module.exports = blogsRouter;
