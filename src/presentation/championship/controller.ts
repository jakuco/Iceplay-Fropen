import { Request, Response } from "express";
import { CustomError, PaginationDTO } from "../../domain";
import { ChampionshipService } from "../services/championship.service";

export class ChampionshipController {

  constructor(private readonly championshipService: ChampionshipService) {}

  private handleError(err: unknown, res: Response) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }

  public createChampionship = async (req: Request, res: Response) => {
    if (!req.body?.name) {
      return res.status(400).json({ message: "Name is required" });
    }

    this.championshipService.createChampionship(req.body)
      .then(championship => res.status(201).json(championship))
      .catch(error => this.handleError(error, res));
  };

  public getChampionships = async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const [error, paginationDTO] = PaginationDTO.create(+page, +limit);

    if (error) return res.status(400).json({ error });

    this.championshipService.getChampionships(paginationDTO!)
      .then(championships => res.status(200).json(championships))
      .catch(error => this.handleError(error, res));
  };

  public getAllChampionships = async (_req: Request, res: Response) => {
    this.championshipService.getAllChampionships()
      .then(championships => res.status(200).json(championships))
      .catch(error => this.handleError(error, res));
  };

  public getChampionshipById = async (req: Request, res: Response) => {
    const championship_id = Number(req.params.championship_id);

    if (isNaN(championship_id)) {
      return res.status(400).json({ message: "championship_id must be a number" });
    }

    this.championshipService.getChampionshipById(championship_id)
      .then(championship => res.status(200).json(championship))
      .catch(error => this.handleError(error, res));
  };

  public updateChampionship = async (req: Request, res: Response) => {
    const championship_id = Number(req.params.championship_id);

    if (isNaN(championship_id)) {
      return res.status(400).json({ message: "championship_id must be a number" });
    }

    this.championshipService.updateChampionship(championship_id, req.body)
      .then(championship => res.status(200).json(championship))
      .catch(error => this.handleError(error, res));
  };

  public deleteChampionship = async (req: Request, res: Response) => {
    const championship_id = Number(req.params.championship_id);

    if (isNaN(championship_id)) {
      return res.status(400).json({ message: "championship_id must be a number" });
    }

    this.championshipService.deleteChampionship(championship_id)
      .then(result => res.status(200).json(result))
      .catch(error => this.handleError(error, res));
  };

  
}
