import { Router } from 'express';
import { AuthRoutes } from './auth/routes';
import { ChampionshipRoutes } from './championship/routes';
import { TeamRoutes } from './team/routes';
import { FileRoutes } from './files/routes';

export class AppRoutes {


  static get routes(): Router {

    const router = Router();
    
    // Definir las rutas
    router.use('/api/auth', AuthRoutes.routes );
    //router.use('/api/categories', CategoryRoutes.routes );
    //router.use('/api/players', PlayerRoutes.routes);
    router.use('/api/teams', TeamRoutes.routes);
    //router.use('/api/coaches', CoachRoutes.routes);
    //router.use('/api/matches', MatchRoutes.routes);
    router.use('/api/championships', ChampionshipRoutes.routes);
    //router.use('/api/championshipTeams', ChampionshipTeamRoutes.routes);
    //router.use('/api/matchPlayers', MatchPlayerRoutes.routes);
    router.use('/api/files', FileRoutes.routes);
    return router;
  }


}

