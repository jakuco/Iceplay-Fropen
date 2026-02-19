import { Request, Response } from "express";
import { CustomError, PaginationDTO, CreateMatchDto } from "../../domain";
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

  const [error, createMatchDto] = CreateMatchDto.create(req.body);

  if (error) {
    return res.status(400).json({ message: error });
  }

  this.matchService.createMatch(createMatchDto!)
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

  public searchAllMatches = async (req: Request, res: Response) => {
    const { championship_id, state, date, match_id } = req.query;

    const filters: any = {};
    if (championship_id) filters.championship_id = Number(championship_id);
    if (state) filters.state = Number(state);
    if (match_id) filters.match_id = Number(match_id);
    if (date) {
      const start = new Date(date as string);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date as string);
      end.setHours(23, 59, 59, 999);
      filters.date = { $gte: start, $lte: end };
    }

    this.matchService.searchAllMatches(filters)
      .then(matches => res.status(200).json(matches))
      .catch(error => this.handleError(error, res));
  };


  public searchMatches = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, championship_id, state, date, match_id } = req.query;
    const [error, paginationDTO] = PaginationDTO.create(+page, +limit);

    if (error) return res.status(400).json({ error });

    const filters: any = {};
    if (championship_id) filters.championship_id = Number(championship_id);
    if (state) filters.state = Number(state);
    if (match_id) filters.match_id = Number(match_id);
    if (date) {
      const start = new Date(date as string);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date as string);
      end.setHours(23, 59, 59, 999);
      filters.date = { $gte: start, $lte: end };
    }

    const result = await this.matchService.searchMatches(paginationDTO!, filters);
    return res.status(200).json(result);
  } catch (error) {
    return this.handleError(error, res);
  }
};



}
