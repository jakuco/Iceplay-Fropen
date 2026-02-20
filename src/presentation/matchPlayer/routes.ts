import { Router } from "express";
import { MatchPlayerController } from "./controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { MatchPlayerService } from "../services/matchPlayer.service";

export class MatchPlayerRoutes {
  static get routes(): Router {
    const router = Router();
    const matchPlayerService = new MatchPlayerService();
    const matchPlayerController = new MatchPlayerController(matchPlayerService);

    router.get("/", matchPlayerController.getMatchPlayers);
    router.get("/all", matchPlayerController.getAllMatchPlayers);
    router.get("/:player_id/:match_id", matchPlayerController.getMatchPlayerById);

    router.post(
      "/",
      [AuthMiddleware.validateJWT],
      matchPlayerController.createMatchPlayer
    );

    router.put(
      "/:player_id/:match_id",
      [AuthMiddleware.validateJWT],
      matchPlayerController.updateMatchPlayer
    );

    router.delete(
      "/:player_id/:match_id",
      [AuthMiddleware.validateJWT],
      matchPlayerController.deleteMatchPlayer
    );

    return router;
  }
}
