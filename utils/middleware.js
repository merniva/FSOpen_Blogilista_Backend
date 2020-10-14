const logger = require("./logger");

const requestLogger = (req, res, next) => {
  logger.info("Method:", req.method);
  logger.info("Path:  ", req.path);
  logger.info("Body:  ", req.body);
  logger.info("---");
  next();
};

const errorHandler = (error, req, res, next) => {
  if (error.name === "CastError" && error.kind === "ObjectId") {
    return res.status(400).send({ error: "Vääränlainen id!" });
  } else if (error.name === "NOT_FOUND") {
    return res.status(404).end();
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  } else if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Virheellinen token!",
    });
  }

  logger.error(error.message);

  next(error);
};

module.exports = {
  requestLogger,
  errorHandler,
};
