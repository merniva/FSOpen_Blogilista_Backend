const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  let initialValue = 0;
  const total = blogs.reduce(
    (acc, {likes}) => acc + likes,
    initialValue
  );
  return total;
};

const favoriteBlog = (blogs) => {
  let initialValue = 0;
  const mostPoints = blogs.reduce(
    (acc, {likes}) => Math.max(acc, likes),
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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};
