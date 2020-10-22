const lodash = require("lodash");

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  let initialValue = 0;
  const total = blogs.reduce((acc, { likes }) => acc + likes, initialValue);
  return total;
};

const favoriteBlog = (blogs) => {
  let initialValue = 0;
  const mostPoints = blogs.reduce(
    (acc, { likes }) => Math.max(acc, likes),
    initialValue
  );
  const result = blogs.find(({ likes }) => likes === mostPoints);
  const topBlog = {
    title: result.title,
    author: result.author,
    likes: result.likes,
  };
  return topBlog;
};

const mostBlogs = (blogs) => {
  const groupedBlogs = lodash.groupBy(blogs, "author");
  const sums = Object.entries(groupedBlogs).map(([key, value]) => ({
    author: key,
    blogs: value.length,
  }));
  const largest = lodash.orderBy(sums, ["blogs"], ["desc"]);
  return largest[0];
};

const mostLikes = (blogs) => {
  const groupedBlogs = lodash.groupBy(blogs, "author");
  const likes = Object.entries(groupedBlogs).map(([key, value]) =>
    value.reduce(
      (acc, current) => {
        return {
          author: acc.author,
          likes: acc.likes + current.likes,
        };
      },
      { author: key, likes: 0 }
    )
  );
  const topLiked = lodash.orderBy(likes, ["likes"], ["desc"]);
  return topLiked[0];
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
