import { MatchModel } from "../../data/mongo/models/match.model";
import { ChampionshipModel } from "../../data/mongo/models/championship.model";
import { TeamModel } from "../../data/mongo/models/team.model";

import { CustomError, PaginationDTO } from "../../domain";

type CreateMatchDTO = any;

export class MatchService {

  constructor() {}

  async createMatch(createMatchDTO: CreateMatchDTO) {
    const matchExist = await MatchModel.findOne({ match_id: createMatchDTO.match_id });

    if (matchExist) {
      throw CustomError.badRequest("Match already exists");
    }

    try {
      const match = new MatchModel({ ...createMatchDTO });
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
    } catch (err) {
      throw CustomError.internalServer(`${err}`);
    }
  }

  async getMatches(paginationDTO: PaginationDTO) {
    const { page, limit } = paginationDTO;

    try {
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
        matches
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getAllMatches() {
    try {
      const matches = await MatchModel.find().lean().exec();
      return matches.map(m => ({
        id: m.id,
        match_id: m.match_id,
        championship_id: m.championship_id,
        home_team_id: m.home_team_id,
        away_team_id: m.away_team_id,
        date: m.date,
        state: m.state,
        match_events: m.match_events
      }));
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
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

  async updateMatch(match_id: number, data: any) {
    const match = await MatchModel.findOne({ match_id });

    if (!match) {
      throw CustomError.badRequest("Match not found");
    }

    try {
      Object.assign(match, data);
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
  async searchMatches(filters: { championship_id?: number; state?: number; date?: Date }) {
    const query: any = {}; 
    if (filters.championship_id) query.championship_id = filters.championship_id; 
    if (filters.state !== undefined) query.state = filters.state; 
    if (filters.date) { 
      // ejemplo: buscar por día exacto 
      const start = new Date(filters.date); 
      start.setHours(0, 0, 0, 0); 
      const end = new Date(filters.date); 
      end.setHours(23, 59, 59, 999); 
      query.date = { $gte: start, $lte: end }; 
    } 
    try { 
      const matches = await MatchModel.find(query).lean().exec(); 
      // enriquecer con datos de campeonato y equipos 
      const results = await Promise.all( matches.map(async (m) => {
        const championship = await ChampionshipModel.findOne({ 
          championship_id: m.championship_id }).lean(); 
        const homeTeam = await TeamModel.findOne({ team_id: m.home_team_id }).lean(); 
        const awayTeam = await TeamModel.findOne({ team_id: m.away_team_id }).lean(); 
        return { 
          championship_name: championship?.name || "Unknown Championship",
          match: `${homeTeam?.name || "Home"} vs ${awayTeam?.name || "Away"}`, 
          date: m.date, location: "Estadio Ejemplo", 
          // aquí puedes reemplazar con el campo real cuando lo definas 
          state: m.state 
        }; 
      }) 
    ); 
    return results; } catch (error) { throw CustomError.internalServer(`${error}`); } }
}
