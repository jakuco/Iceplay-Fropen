import { Router } from "express";
import { CoachController } from "./controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { CoachService } from "../services/coach.service";

export class CoachRoutes {
  static get routes(): Router {
    const router = Router();
    const coachService = new CoachService();
    const coachController = new CoachController(coachService);

    router.get("/", coachController.getCoaches);
    router.get("/:coach_id", coachController.getCoachById);

    router.post(
      "/",
      [AuthMiddleware.validateJWT],
      coachController.createCoach
    );

    router.put(
      "/:coach_id",
      [AuthMiddleware.validateJWT],
      coachController.updateCoach
    );

    router.delete(
      "/:coach_id",
      [AuthMiddleware.validateJWT],
      coachController.deleteCoach
    );

    return router;
  }
}
