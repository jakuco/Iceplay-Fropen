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
    router.get('/:team_id', teamController.getTeamById);
    
    router.post(
      '/',
      [AuthMiddleware.validateJWT],
      //teamController.createTeam
    );

    router.put(
      '/:team_id',
      [AuthMiddleware.validateJWT],
      teamController.updateTeam
    );

    router.delete(
      '/:team_id',
      [AuthMiddleware.validateJWT],
      teamController.deleteTeam
    );

    return router;
  }
}
