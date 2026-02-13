import { Request, Response } from "express";
import { CustomError, PaginationDTO } from "../../domain";
import { MatchPlayerService } from "../services/matchPlayer.service";

export class MatchPlayerController {

  constructor(private readonly matchPlayerService: MatchPlayerService) {}

  private handleError(err: unknown, res: Response) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }

  public createMatchPlayer = async (req: Request, res: Response) => {
    if (!req.body?.player_id || !req.body?.match_id) {
      return res.status(400).json({ message: "player_id and match_id are required" });
    }

    this.matchPlayerService.createMatchPlayer(req.body)
      .then(mp => res.status(201).json(mp))
      .catch(error => this.handleError(error, res));
  };

  public getMatchPlayers = async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const [error, paginationDTO] = PaginationDTO.create(+page, +limit);

    if (error) return res.status(400).json({ error });

    this.matchPlayerService.getMatchPlayers(paginationDTO!)
      .then(mps => res.status(200).json(mps))
      .catch(error => this.handleError(error, res));
  };

  public getAllMatchPlayers = async (_req: Request, res: Response) => {
    this.matchPlayerService.getAllMatchPlayers()
      .then(mps => res.status(200).json(mps))
      .catch(error => this.handleError(error, res));
  };

  public getMatchPlayerById = async (req: Request, res: Response) => {
    const player_id = Number(req.params.player_id);
    const match_id = Number(req.params.match_id);

    if (isNaN(player_id) || isNaN(match_id)) { 
        return res.status(400).json({ 
            message: "player_id and match_id must be numbers" 
        }); 
    }

    this.matchPlayerService.getMatchPlayer(player_id, match_id)
      .then(mp => res.status(200).json(mp))
      .catch(error => this.handleError(error, res));
  };

  public updateMatchPlayer = async (req: Request, res: Response) => {
    const player_id = Number(req.params.player_id);
    const match_id = Number(req.params.match_id);

    if (isNaN(player_id) || isNaN(match_id)) {
        return res.status(400).json({ message: "player_id and match_id must be numbers" });
    }

    this.matchPlayerService.updateMatchPlayer(player_id, match_id, req.body)
        .then(mp => res.status(200).json(mp))
        .catch(error => this.handleError(error, res));
    };

    public deleteMatchPlayer = async (req: Request, res: Response) => {
    const player_id = Number(req.params.player_id);
    const match_id = Number(req.params.match_id);

    if (isNaN(player_id) || isNaN(match_id)) {
        return res.status(400).json({ message: "player_id and match_id must be numbers" });
    }

    this.matchPlayerService.deleteMatchPlayer(player_id, match_id)
        .then(result => res.status(200).json(result))
        .catch(error => this.handleError(error, res));
    };
    

}
