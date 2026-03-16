import { Request, Response } from "express";
import { CustomError, PaginationDTO } from "../../domain";
import { ChampionshipService } from "../services/championship.service";
import { ChampionshipSetupService } from "../services/championship-setup.service";
import { FixtureService } from "../services/fixture.service";
import { ChampionshipSetupDTO, EnrollTeamsDTO } from "../../domain/dto/championship/championship-setup.dto";
import { GenerateFixtureDTO } from "../../domain/dto/fixture/generate-fixture.dto";

export class ChampionshipController {

  private readonly setupService = new ChampionshipSetupService();
  private readonly fixtureService = new FixtureService();

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
    const { page = 1, limit = 10, organizationId } = req.query;
    const [error, paginationDTO] = PaginationDTO.create(+page, +limit);

    if (error) return res.status(400).json({ error });

    const orgId = organizationId ? Number(organizationId) : undefined;
    if (organizationId && isNaN(orgId!)) {
      return res.status(400).json({ message: "organizationId must be a number" });
    }

    this.championshipService.getChampionships(paginationDTO!, orgId)
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

  public setupChampionship = async (req: Request, res: Response) => {
    const { error, data } = ChampionshipSetupDTO.validate(req.body);
    if (error) return res.status(400).json({ message: error });

    this.setupService.setupChampionship(data!)
      .then(result => res.status(201).json(result))
      .catch(err => this.handleError(err, res));
  };

  public enrollTeams = async (req: Request, res: Response) => {
    const championshipId = Number(req.params.id);
    if (isNaN(championshipId)) return res.status(400).json({ message: "id must be a number" });

    const { error, data } = EnrollTeamsDTO.validate(req.body);
    if (error) return res.status(400).json({ message: error });

    this.setupService.enrollTeams(championshipId, data!.teams)
      .then(result => res.status(201).json(result))
      .catch(err => this.handleError(err, res));
  };

  public getChampionshipDetail = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "id must be a number" });

    this.setupService.getChampionshipDetail(id)
      .then(result => res.status(200).json(result))
      .catch(err => this.handleError(err, res));
  };

  // ── Fixture endpoints ──────────────────────────────────────────────────────

  public generateFixture = async (req: Request, res: Response) => {
    const championshipId = Number(req.params.id);
    if (isNaN(championshipId)) return res.status(400).json({ message: "id must be a number" });

    const { error, data } = GenerateFixtureDTO.validate(req.body);
    if (error) return res.status(400).json({ message: error });

    this.fixtureService.generateFixture(championshipId, data!)
      .then(result => res.status(201).json(result))
      .catch(err => this.handleError(err, res));
  };

  public getFixture = async (req: Request, res: Response) => {
    const championshipId = Number(req.params.id);
    if (isNaN(championshipId)) return res.status(400).json({ message: "id must be a number" });

    const phaseId = req.query.phaseId ? Number(req.query.phaseId) : undefined;
    const round   = req.query.round   ? Number(req.query.round)   : undefined;

    this.fixtureService.getFixture(championshipId, { phaseId, round })
      .then(result => res.status(200).json(result))
      .catch(err => this.handleError(err, res));
  };
}
