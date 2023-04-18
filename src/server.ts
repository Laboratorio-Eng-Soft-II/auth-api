require("dotenv").config();
import express, { Response } from "express";
import { Routes } from "./routes";
import config from "config";
import validateEnv from "./utils/validate-env";
import { AppDataSource } from "./utils/data-source";
import cors from "cors";

AppDataSource.initialize()
  .then(async () => {
    // VALIDATE ENV
    validateEnv();

    const app = express();

    // MIDDLEWARE

    // 1. Body parser
    app.use(express.json());

    // 2. Logger

    // 3. Cookie Parser

    // 4. Cors
    app.use(cors());

    // ROUTES
    Routes.forEach((route) => {
      (app as any)[route.method](
        route.route,
        (req: Request, res: Response, next: Function) => {
          const result = new (route.controller as any)()[route.action](
            req,
            res,
            next
          );
          if (result instanceof Promise) {
            result.then((result) =>
              result !== null && result !== undefined
                ? res.send(result)
                : undefined
            );
          } else if (result !== null && result !== undefined) {
            res.json(result);
          }
        }
      );
    });

    // HEALTH CHECKER
    app.get("/api/healthchecker", async (_, res: Response) => {
      res.status(200).json({
        status: "success",
        message: "healthy",
      });
    });

    // UNHANDLED ROUTE

    // GLOBAL ERROR HANDLER

    const port = config.get<number>("port");
    app.listen(port);

    console.log(`Server started on port: ${port}`);
  })
  .catch((error) => console.log(error));
