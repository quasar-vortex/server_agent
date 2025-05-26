import express from "express";
import errorMiddleware from "./middleware/errorMiddleware";
import routers from "./routes";
import dotenv from "dotenv";

dotenv.config();

export const apiBaseUrl = `/api/v${process.env.API_VERSION || 1}`;

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get(`${apiBaseUrl}/health`, (req, res, next) => {
  res.status(200).json({ message: "Health Check Passed!" });
});
app.use(`${apiBaseUrl}/logs`, routers.logRouter);
app.use(`${apiBaseUrl}/servers`, routers.serverRouter);

app.use(errorMiddleware);

const main = async () => {
  app.listen(PORT, () => {
    console.log(`Server Running On: ${PORT}`);
  });
};

main();
