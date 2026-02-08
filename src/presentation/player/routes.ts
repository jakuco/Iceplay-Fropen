import { Router } from 'express';
import { PlayerController } from './controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { PlayerService } from '../services/player.service';

export class PlayerRoutes {

  static get routes(): Router {

    const router = Router();
    const playerService = new PlayerService();
    const playerController = new PlayerController(playerService);

    // Definir las rutas
    router.get('/', playerController.getPlayers);
    router.post(
      '/',
      [AuthMiddleware.validateJWT],
      playerController.createPlayer
    );

    return router;
  }
}
