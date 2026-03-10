import { Request, Response } from "express";
import { CustomError, PaginationDTO, CreateTeamDto } from "../../domain";
import { TeamService } from "../services/team.service";

export class TeamController {

  constructor(private readonly teamService: TeamService) {}

  private handleError(err: unknown, res: Response){
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }

  public createTeam = async (req: Request, res: Response) => {

    const [error, createTeamDto] = CreateTeamDto.create(req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    this.teamService.createTeam(createTeamDto!)
      .then(team => res.status(201).json(team))
      .catch(error => this.handleError(error, res));
  };

  public getTeams = async (req: Request, res: Response) => {

    const { page = 1, limit = 10 } = req.query;

    const [error, paginationDTO] = PaginationDTO.create(+page, +limit);

    if (error)
      return res.status(400).json({ error });

    this.teamService.getTeams(paginationDTO!)
      .then(teams => res.status(200).json(teams))
      .catch(error => this.handleError(error, res));
  };

  public getAllTeams = async (_req: Request, res: Response) => {
    this.teamService.getAllTeams()
      .then(teams => res.status(200).json(teams))
      .catch(error => this.handleError(error, res));
  };

  public getTeamById = async (req: Request, res: Response) => {

    const team_id = Number(req.params.team_id);

    if (isNaN(team_id)) {
      return res.status(400).json({ message: "team_id must be a number" });
    }

    this.teamService.getTeamById(team_id)
      .then(team => res.status(200).json(team))
      .catch(error => this.handleError(error, res));
  };

  public updateTeam = async (req: Request, res: Response) => {

    const team_id = Number(req.params.team_id);

    if (isNaN(team_id)) {
      return res.status(400).json({ message: "team_id must be a number" });
    }

    this.teamService.updateTeam(team_id, req.body)
      .then(team => res.status(200).json(team))
      .catch(error => this.handleError(error, res));
  };

  public deleteTeam = async (req: Request, res: Response) => {

    const team_id = Number(req.params.team_id);

    if (isNaN(team_id)) {
      return res.status(400).json({ message: "team_id must be a number" });
    }

    this.teamService.deleteTeam(team_id)
      .then(result => res.status(200).json(result))
      .catch(error => this.handleError(error, res));
  };
}
