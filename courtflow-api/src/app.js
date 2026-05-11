import "./config/env.js";

import express from "express";
import cors from "cors";

import apiRoutes from "./routes/index.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";
import requestLogger from "./middleware/requestLogger.js";
import responseHandler from "./middleware/responseHandler.js";


const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(responseHandler);

app.use("/api", apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
