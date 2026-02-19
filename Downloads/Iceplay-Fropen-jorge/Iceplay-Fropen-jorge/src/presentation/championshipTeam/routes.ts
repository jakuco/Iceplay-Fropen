import { Router } from "express";
import { ChampionshipTeamController } from "./controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { ChampionshipTeamService } from "../services/championshipTeam.service";

export class ChampionshipTeamRoutes {
  static get routes(): Router {
    const router = Router();
    const championshipTeamService = new ChampionshipTeamService();
    const championshipTeamController = new ChampionshipTeamController(championshipTeamService);

    router.get("/", championshipTeamController.getChampionshipTeams);
    router.get("/all", championshipTeamController.getAllChampionshipTeams);
    router.get("/:id", championshipTeamController.getChampionshipTeamById);

    router.post(
      "/",
      [AuthMiddleware.validateJWT],
      championshipTeamController.createChampionshipTeam
    );

    router.put(
      "/:id",
      [AuthMiddleware.validateJWT],
      championshipTeamController.updateChampionshipTeam
    );

    router.delete(
      "/:id",
      [AuthMiddleware.validateJWT],
      championshipTeamController.deleteChampionshipTeam
    );

    return router;
  }
}
