import "./config/env.js";

import app from "./app.js";
import { connectDb } from "./config/db.js";
import logger from "./utils/logger.js";

const port = process.env.PORT || 3000;

connectDb()
  .then(() => {
    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    logger.error("Failed to connect to MongoDB", { error: err });
    process.exit(1);
  });
