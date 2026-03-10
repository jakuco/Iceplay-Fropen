import { MatchModel } from "../../data/mongo/models/match.model";
import { ChampionshipModel } from "../../data/mongo/models/championship.model";
import { TeamModel } from "../../data/mongo/models/team.model";
import { CustomError, PaginationDTO, CreateMatchDto, UpdateMatchDto } from "../../domain";
import { toMatchDto } from "../../domain/dto/match/match.mapper";
import { MatchDto } from "../../domain/dto/match/match.dto";

export class MatchService {

  constructor() {}

  async createMatch(createMatchDto: CreateMatchDto) {

    const matchExist = await MatchModel.findOne({ match_id: createMatchDto.match_id });

    if (matchExist) {
      throw CustomError.badRequest("Match already exists");
    }

    try {

      const match = await MatchModel.create({
        ...createMatchDto
      });

      return {
        id: match.id,
        match_id: match.match_id,
        championship_id: match.championship_id,
        home_team_id: match.home_team_id,
        away_team_id: match.away_team_id,
        date: match.date,
        state: match.state,
        match_events: match.match_events
      };

    } catch (err) {
      throw CustomError.internalServer(`${err}`);
    }
  }

  async getMatches(paginationDTO: PaginationDTO) {
    const { page, limit } = paginationDTO;

    const [totalMatches, matches] = await Promise.all([
      MatchModel.countDocuments().exec(),
      MatchModel.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .exec()
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
      matches: matches.map(m => toMatchDto(m))
    };
  }

  async getAllMatches(): Promise<MatchDto[]> {
    const matches = await MatchModel.find().exec();
    return matches.map(m => toMatchDto(m));
  }


  async getMatchById(match_id: number) {

    const match = await MatchModel.findOne({ match_id }).lean().exec();

    if (!match) {
      throw CustomError.badRequest("Match not found");
    }

    return {
      id: match._id,
      match_id: match.match_id,
      championship_id: match.championship_id,
      home_team_id: match.home_team_id,
      away_team_id: match.away_team_id,
      date: match.date,
      state: match.state,
      match_events: match.match_events
    };
  }

  async updateMatch(match_id: number, updateMatchDto: UpdateMatchDto) {

    const match = await MatchModel.findOne({ match_id });

    if (!match) {
      throw CustomError.badRequest("Match not found");
    }

    try {

      Object.assign(match, updateMatchDto);
      await match.save();

      return {
        id: match.id,
        match_id: match.match_id,
        championship_id: match.championship_id,
        home_team_id: match.home_team_id,
        away_team_id: match.away_team_id,
        date: match.date,
        state: match.state,
        match_events: match.match_events
      };

    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async deleteMatch(match_id: number) {

    const match = await MatchModel.findOneAndDelete({ match_id });

    if (!match) {
      throw CustomError.badRequest("Match not found");
    }

    return {
      message: "Match deleted successfully",
      match_id
    };
  }

  async searchMatches(
    paginationDTO: PaginationDTO,
    filters: { championship_id?: number; state?: number; date?: any; match_id?: number }
  ) {

    const { page, limit } = paginationDTO;

    try {

      const [totalMatches, matches]: [number, any[]] = await Promise.all([
        MatchModel.countDocuments(filters).exec(),
        MatchModel.find(filters)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean()
          .exec() as Promise<any[]>
      ]);

      const results = await Promise.all(
        matches.map(async (m) => {
          const championship = await ChampionshipModel.findOne({ championship_id: m.championship_id }).lean();
          const homeTeam = await TeamModel.findOne({ team_id: m.home_team_id }).lean();
          const awayTeam = await TeamModel.findOne({ team_id: m.away_team_id }).lean();

          return {
            championship_name: championship?.name || "Unknown Championship",
            match: `${homeTeam?.name || "Home"} vs ${awayTeam?.name || "Away"}`,
            date: m.date,
            location: "Estadio Ejemplo",
            state: m.state,
            events: m.match_events || []
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

      const matches = await MatchModel.find(filters).lean().exec();

      const results = await Promise.all(
        matches.map(async (m) => {
          const championship = await ChampionshipModel.findOne({ championship_id: m.championship_id }).lean();
          const homeTeam = await TeamModel.findOne({ team_id: m.home_team_id }).lean();
          const awayTeam = await TeamModel.findOne({ team_id: m.away_team_id }).lean();

          return {
            championship_name: championship?.name || "Unknown Championship",
            match: `${homeTeam?.name || "Home"} vs ${awayTeam?.name || "Away"}`,
            date: m.date,
            location: "Estadio Ejemplo",
            state: m.state,
            events: m.match_events || []
          };
        })
      );

      return results;

    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
}
