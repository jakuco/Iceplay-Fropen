import { Router } from 'express';
import { TeamController } from './controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { TeamService } from '../services/team.service';

export class TeamRoutes {

  static get routes(): Router {

    const router = Router();
    const teamService = new TeamService();
    const teamController = new TeamController(teamService);

    router.get('/', teamController.getTeams);
    router.get('/all', teamController.getAllTeams);

    router.post(
      '/',
      [AuthMiddleware.validateJWT],
      teamController.createTeam
    );

    return router;
  }
}
