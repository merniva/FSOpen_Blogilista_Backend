const blogsRouter = require("express").Router();
const Blog = require("../models/blog");

/*
 *
 * 5 tehtävää tekemättä!
 * 4.6 + 4.7 + 4.9 + 4.11 + 4.12
 */

blogsRouter.get("/", async (req, res) => {
  const blogs = await Blog.find({});
  res.json(blogs.map((blog) => blog.toJSON()));
});



blogsRouter.post("/", async (req, res) => {
  const body = req.body;

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  });

  const savedBlog = await blog.save();
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
  const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, { new: true });
      res.json(updatedBlog);
});


module.exports = blogsRouter;
