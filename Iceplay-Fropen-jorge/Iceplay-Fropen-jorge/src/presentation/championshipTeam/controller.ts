import { Request, Response } from "express";
import { CustomError, PaginationDTO } from "../../domain";
import { ChampionshipTeamService } from "../services/championshipTeam.service";

export class ChampionshipTeamController {

  constructor(private readonly championshipTeamService: ChampionshipTeamService) {}

  private handleError(err: unknown, res: Response) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }

  public createChampionshipTeam = async (req: Request, res: Response) => {
    if (!req.body?.team_id || !req.body?.championship_id) {
      return res.status(400).json({ message: "team_id and championship_id are required" });
    }

    this.championshipTeamService.createChampionshipTeam(req.body)
      .then(ct => res.status(201).json(ct))
      .catch(error => this.handleError(error, res));
  };

  public getChampionshipTeams = async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const [error, paginationDTO] = PaginationDTO.create(+page, +limit);

    if (error) return res.status(400).json({ error });

    this.championshipTeamService.getChampionshipTeams(paginationDTO!)
      .then(cts => res.status(200).json(cts))
      .catch(error => this.handleError(error, res));
  };

  public getAllChampionshipTeams = async (_req: Request, res: Response) => {
    this.championshipTeamService.getAllChampionshipTeams()
      .then(cts => res.status(200).json(cts))
      .catch(error => this.handleError(error, res));
  };

  public getChampionshipTeamById = async (req: Request, res: Response) => {
    const { id } = req.params;

    this.championshipTeamService.getChampionshipTeamById(id)
      .then(ct => res.status(200).json(ct))
      .catch(error => this.handleError(error, res));
  };

  public updateChampionshipTeam = async (req: Request, res: Response) => {
    const { id } = req.params;

    this.championshipTeamService.updateChampionshipTeam(id, req.body)
      .then(ct => res.status(200).json(ct))
      .catch(error => this.handleError(error, res));
  };

  public deleteChampionshipTeam = async (req: Request, res: Response) => {
    const { id } = req.params;

    this.championshipTeamService.deleteChampionshipTeam(id)
      .then(result => res.status(200).json(result))
      .catch(error => this.handleError(error, res));
  };
}
