import { Request, Response } from "express";
import { CustomError, PaginationDTO } from "../../domain";
import { PlayerService } from "../services/player.service";

export class PlayerController {

  constructor(private readonly playerService: PlayerService) {}

  private handleError(err: unknown, res: Response) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }

  public createPlayer = async (req: Request, res: Response) => {

    if (!req.body?.name)
      return res.status(400).json({ message: "Name is required" });

    if (!req.body?.lastname)
      return res.status(400).json({ message: "Lastname is required" });

    this.playerService.createPlayer(req.body)
      .then(player => res.status(201).json(player))
      .catch(error => this.handleError(error, res));
  };

  public getPlayerById = async (req: Request, res: Response) => {

    const player_id = Number(req.params.id);

    if (isNaN(player_id)) {
      return res.status(400).json({ message: "player_id must be a number" });
    }

    this.playerService.getPlayerById(player_id)
      .then(player => res.status(200).json(player))
      .catch(error => this.handleError(error, res));
  };

  public getPlayers = async (req: Request, res: Response) => {

    const { page = 1, limit = 10 } = req.query;

    const [error, paginationDTO] = PaginationDTO.create(+page, +limit);

    if (error)
      return res.status(400).json({ error });

    this.playerService.getPlayers(paginationDTO!)
      .then(players => res.status(200).json(players))
      .catch(error => this.handleError(error, res));
  };

  public updatePlayer = async (req: Request, res: Response) => {

    const player_id = Number(req.params.id);

    if (isNaN(player_id)) {
      return res.status(400).json({ message: "player_id must be a number" });
    }

    this.playerService.updatePlayer(player_id, req.body)
      .then(player => res.status(200).json(player))
      .catch(error => this.handleError(error, res));
  };

  public deletePlayer = async (req: Request, res: Response) => {

    const player_id = Number(req.params.id);

    if (isNaN(player_id)) {
      return res.status(400).json({ message: "player_id must be a number" });
    }

    this.playerService.deletePlayer(player_id)
      .then(result => res.status(200).json(result))
      .catch(error => this.handleError(error, res));
  };
}
