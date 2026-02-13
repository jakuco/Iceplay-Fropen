import { Router } from "express";
import { MatchController } from "./controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { MatchService } from "../services/match.service";

export class MatchRoutes {
  static get routes(): Router {
    const router = Router();
    const matchService = new MatchService();
    const matchController = new MatchController(matchService);

    router.get("/search", matchController.searchMatches);
    router.get("/", matchController.getMatches);
    router.get("/all", matchController.getAllMatches);
    router.get("/:match_id", matchController.getMatchById);
    //router.get("/search", matchController.searchMatches);


    router.post(
      "/",
      [AuthMiddleware.validateJWT],
      matchController.createMatch
    );

    router.put(
      "/:match_id",
      [AuthMiddleware.validateJWT],
      matchController.updateMatch
    );

    router.delete(
      "/:match_id",
      [AuthMiddleware.validateJWT],
      matchController.deleteMatch
    );

    return router;
  }
}
