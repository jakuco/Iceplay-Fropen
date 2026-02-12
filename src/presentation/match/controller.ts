import { Request, Response } from "express";
import { CustomError, PaginationDTO } from "../../domain";
import { MatchService } from "../services/match.service";

export class MatchController {

  constructor(private readonly matchService: MatchService) {}

  private handleError(err: unknown, res: Response) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }

  public createMatch = async (req: Request, res: Response) => {
    if (!req.body?.match_id) {
      return res.status(400).json({ message: "match_id is required" });
    }

    this.matchService.createMatch(req.body)
      .then(match => res.status(201).json(match))
      .catch(error => this.handleError(error, res));
  };

  public getMatches = async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const [error, paginationDTO] = PaginationDTO.create(+page, +limit);

    if (error) return res.status(400).json({ error });

    this.matchService.getMatches(paginationDTO!)
      .then(matches => res.status(200).json(matches))
      .catch(error => this.handleError(error, res));
  };

  public getAllMatches = async (_req: Request, res: Response) => {
    this.matchService.getAllMatches()
      .then(matches => res.status(200).json(matches))
      .catch(error => this.handleError(error, res));
  };



  public getMatchById = async (req: Request, res: Response) => {
    const match_id = Number(req.params.match_id);

    if (isNaN(match_id)) {
      return res.status(400).json({ message: "match_id must be a number" });
    }

    this.matchService.getMatchById(match_id)
      .then(match => res.status(200).json(match))
      .catch(error => this.handleError(error, res));
  };

  public updateMatch = async (req: Request, res: Response) => {
    const match_id = Number(req.params.match_id);

    if (isNaN(match_id)) {
      return res.status(400).json({ message: "match_id must be a number" });
    }

    this.matchService.updateMatch(match_id, req.body)
      .then(match => res.status(200).json(match))
      .catch(error => this.handleError(error, res));
  };

  public deleteMatch = async (req: Request, res: Response) => {
    const match_id = Number(req.params.match_id);

    if (isNaN(match_id)) {
      return res.status(400).json({ message: "match_id must be a number" });
    }

    this.matchService.deleteMatch(match_id)
      .then(result => res.status(200).json(result))
      .catch(error => this.handleError(error, res));
  };
}
