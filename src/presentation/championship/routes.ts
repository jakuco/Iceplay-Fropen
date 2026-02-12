import { Router } from "express";
import { ChampionshipController } from "./controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { ChampionshipService } from "../services/championship.service";

export class ChampionshipRoutes {
  static get routes(): Router {
    const router = Router();
    const championshipService = new ChampionshipService();
    const championshipController = new ChampionshipController(championshipService);

    router.get("/", championshipController.getChampionships);
    router.get("/all", championshipController.getAllChampionships);
    router.get("/:championship_id", championshipController.getChampionshipById);

    router.post(
      "/",
      [AuthMiddleware.validateJWT],
      championshipController.createChampionship
    );

    router.put(
      "/:championship_id",
      [AuthMiddleware.validateJWT],
      championshipController.updateChampionship
    );

    router.delete(
      "/:championship_id",
      [AuthMiddleware.validateJWT],
      championshipController.deleteChampionship
    );

    return router;
  }
}
