import { Request, Response } from "express";
import { CustomError, PaginationDTO } from "../../domain";
import { CoachService } from "../services/coach.service";

export class CoachController {

  constructor(private readonly coachService: CoachService) {}

  private handleError(err: unknown, res: Response) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }

  public createCoach = async (req: Request, res: Response) => {
    if (!req.body?.name) {
      return res.status(400).json({ message: "Name is required" });
    }

    this.coachService.createCoach(req.body)
      .then(coach => res.status(201).json(coach))
      .catch(error => this.handleError(error, res));
  };

  public getCoaches = async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const [error, paginationDTO] = PaginationDTO.create(+page, +limit);

    if (error) return res.status(400).json({ error });

    this.coachService.getCoaches(paginationDTO!)
      .then(coaches => res.status(200).json(coaches))
      .catch(error => this.handleError(error, res));
  };

  public getCoachById = async (req: Request, res: Response) => {
    const coach_id = Number(req.params.coach_id);

    if (isNaN(coach_id)) {
      return res.status(400).json({ message: "coach_id must be a number" });
    }

    this.coachService.getCoachById(coach_id)
      .then(coach => res.status(200).json(coach))
      .catch(error => this.handleError(error, res));
  };

  public updateCoach = async (req: Request, res: Response) => {
    const coach_id = Number(req.params.coach_id);

    if (isNaN(coach_id)) {
      return res.status(400).json({ message: "coach_id must be a number" });
    }

    this.coachService.updateCoach(coach_id, req.body)
      .then(coach => res.status(200).json(coach))
      .catch(error => this.handleError(error, res));
  };

  public deleteCoach = async (req: Request, res: Response) => {
    const coach_id = Number(req.params.coach_id);

    if (isNaN(coach_id)) {
      return res.status(400).json({ message: "coach_id must be a number" });
    }

    this.coachService.deleteCoach(coach_id)
      .then(result => res.status(200).json(result))
      .catch(error => this.handleError(error, res));
  };
}
