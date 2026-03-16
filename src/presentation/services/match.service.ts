import { MatchModel } from "../../data/mongo/models/match.model";
import { ChampionshipModel } from "../../data/mongo/models/championship.model";
import { TeamModel } from "../../data/mongo/models/team.model";
import { CustomError, PaginationDTO, CreateMatchDto, UpdateMatchDto } from "../../domain";
import { toMatchDto } from "../../domain/dto/match/match.mapper";
import { MatchDto } from "../../domain/dto/match/match.dto";

export class MatchService {

  constructor() {}

  async createMatch(createMatchDto: CreateMatchDto) {

    const matchExist = await MatchModel.findOne({ id: (createMatchDto as any).match_id ?? (createMatchDto as any).id });

    if (matchExist) {
      throw CustomError.badRequest("Match already exists");
    }

    try {

      const match = await MatchModel.create({
        ...createMatchDto
      });

      return {
        id: match.id,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        scheduledDate: match.scheduledDate,
        status: match.status,
      };

    } catch (err) {
      throw CustomError.internalServer(`${err}`);
    }
  }

  async getMatches(paginationDTO: PaginationDTO) {
    const { page, limit } = paginationDTO;

    const [totalMatches, matches]: [number, any[]] = await Promise.all([
      MatchModel.countDocuments().exec(),
      MatchModel.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec() as Promise<any[]>
    ]);

    return {
      page,
      limit,
      total: totalMatches,
      next: (page * limit < totalMatches)
        ? `/api/matches?page=${page + 1}&limit=${limit}`
        : null,
      prev: (page - 1 > 0)
        ? `/api/matches?page=${page - 1}&limit=${limit}`
        : null,
      matches: matches.map(m => toMatchDto(m as any))
    };
  }

  async getAllMatches(): Promise<MatchDto[]> {
    const matches = await MatchModel.find().lean().exec() as any[];
    return matches.map(m => toMatchDto(m));
  }


  async getMatchById(id: number) {

    const match = await MatchModel.findOne({ id }).lean().exec();

    if (!match) {
      throw CustomError.badRequest("Match not found");
    }

    return {
      id: match.id,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      scheduledDate: match.scheduledDate,
      status: match.status,
    };
  }

  async updateMatch(id: number, updateMatchDto: UpdateMatchDto) {

    const match = await MatchModel.findOne({ id });

    if (!match) {
      throw CustomError.badRequest("Match not found");
    }

    try {

      Object.assign(match, updateMatchDto);
      await match.save();

      return {
        id: match.id,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        scheduledDate: match.scheduledDate,
        status: match.status,
      };

    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async deleteMatch(id: number) {

    const match = await MatchModel.findOneAndDelete({ id });

    if (!match) {
      throw CustomError.badRequest("Match not found");
    }

    return {
      message: "Match deleted successfully",
      id,
    };
  }

  async searchMatches(
    paginationDTO: PaginationDTO,
    filters: { championship_id?: number; state?: number; date?: any; match_id?: number }
  ) {

    const { page, limit } = paginationDTO;

    try {

      const [totalMatches, matches]: [number, any[]] = await Promise.all([
        MatchModel.countDocuments(filters as any).exec(),
        MatchModel.find(filters as any)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean()
          .exec() as Promise<any[]>
      ]);

      const results = await Promise.all(
        matches.map(async (m) => {
          const homeTeam = await TeamModel.findOne({ id: m.homeTeamId }).lean();
          const awayTeam = await TeamModel.findOne({ id: m.awayTeamId }).lean();

          return {
            match: `${homeTeam?.name || "Home"} vs ${awayTeam?.name || "Away"}`,
            date: m.scheduledDate,
            location: m.venue || "Unknown",
            status: m.status,
          };
        })
      );

      return {
        page,
        limit,
        total: totalMatches,
        next: (page * limit < totalMatches)
          ? `/api/matches/search?page=${page + 1}&limit=${limit}`
          : null,
        prev: (page - 1 > 0)
          ? `/api/matches/search?page=${page - 1}&limit=${limit}`
          : null,
        matches: results
      };

    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async searchAllMatches(filters: { championship_id?: number; state?: number; date?: any; match_id?: number }) {

    try {

      const matches = await MatchModel.find(filters as any).lean().exec() as any[];

      const results = await Promise.all(
        matches.map(async (m) => {
          const homeTeam = await TeamModel.findOne({ id: m.homeTeamId }).lean();
          const awayTeam = await TeamModel.findOne({ id: m.awayTeamId }).lean();

          return {
            match: `${homeTeam?.name || "Home"} vs ${awayTeam?.name || "Away"}`,
            date: m.scheduledDate,
            location: m.venue || "Unknown",
            status: m.status,
          };
        })
      );

      return results;

    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
}
