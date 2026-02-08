import { Router } from 'express';
import { AuthRoutes } from './auth/routes';
import { CategoryRoutes } from './category/routes';
import { PlayerRoutes } from "./player/routes";
import { TeamRoutes } from "./team/routes";

export class AppRoutes {


  static get routes(): Router {

    const router = Router();
    
    // Definir las rutas
    router.use('/api/auth', AuthRoutes.routes );
    router.use('/api/categories', CategoryRoutes.routes );
    router.use('/api/players', PlayerRoutes.routes);
    router.use('/api/teams', TeamRoutes.routes);
    return router;
  }


}

