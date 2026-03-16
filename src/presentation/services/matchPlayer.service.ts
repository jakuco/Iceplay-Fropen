import { MatchPlayerModel } from "../../data/mongo/models/matchPlayer.model";
import { CustomError, PaginationDTO } from "../../domain";

type CreateMatchPlayerDTO = any;

export class MatchPlayerService {

  constructor() {}

  async createMatchPlayer(createMatchPlayerDTO: CreateMatchPlayerDTO) {

    const exist = await MatchPlayerModel.findOne({
      player_id: createMatchPlayerDTO.player_id,
      match_id: createMatchPlayerDTO.match_id
    });

    if (exist) {
      throw CustomError.badRequest("Player already registered in this match");
    }

    try {

      const matchPlayer = await MatchPlayerModel.create({
        ...createMatchPlayerDTO
      });

      return {
        id: matchPlayer.id,
        player_id: matchPlayer.player_id,
        match_id: matchPlayer.match_id,
        score: matchPlayer.score
      };

    } catch (err) {
      throw CustomError.internalServer(`${err}`);
    }
  }

  async getMatchPlayers(paginationDTO: PaginationDTO) {

    const { page, limit } = paginationDTO;

    try {

      const [total, matchPlayers]: [number, any[]] = await Promise.all([
        MatchPlayerModel.countDocuments().exec(),
        MatchPlayerModel.find()
          .skip((page - 1) * limit)
          .limit(limit)
          .lean()
          .exec() as Promise<any[]>
      ]);

      return {
        page,
        limit,
        total,
        next: (page * limit < total)
          ? `/api/match-players?page=${page + 1}&limit=${limit}`
          : null,
        prev: (page - 1 > 0)
          ? `/api/match-players?page=${page - 1}&limit=${limit}`
          : null,
        matchPlayers: matchPlayers.map(mp => ({
          id: mp._id,
          player_id: mp.player_id,
          match_id: mp.match_id,
          score: mp.score
        }))
      };

    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getAllMatchPlayers() {

    try {

      const matchPlayers = await MatchPlayerModel.find()
        .lean()
        .exec() as any[];

      return matchPlayers.map(mp => ({
        id: mp._id,
        player_id: mp.player_id,
        match_id: mp.match_id,
        score: mp.score
      }));

    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getMatchPlayer(player_id: number, match_id: number) {

    try {

      const matchPlayer = await MatchPlayerModel
        .findOne({ player_id, match_id })
        .lean()
        .exec();

      if (!matchPlayer) {
        throw CustomError.badRequest("MatchPlayer not found");
      }

      return {
        id: matchPlayer._id,
        player_id: matchPlayer.player_id,
        match_id: matchPlayer.match_id,
        score: matchPlayer.score
      };

    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    }
  }

  async updateMatchPlayer(player_id: number, match_id: number, data: any) {

    const matchPlayer = await MatchPlayerModel.findOne({ player_id, match_id });

    if (!matchPlayer) {
      throw CustomError.badRequest("MatchPlayer not found");
    }

    try {

      Object.assign(matchPlayer, data);
      await matchPlayer.save();

      return {
        id: matchPlayer.id,
        player_id: matchPlayer.player_id,
        match_id: matchPlayer.match_id,
        score: matchPlayer.score
      };

    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async deleteMatchPlayer(player_id: number, match_id: number) {

    try {

      const matchPlayer = await MatchPlayerModel.findOneAndDelete({ player_id, match_id });

      if (!matchPlayer) {
        throw CustomError.badRequest("MatchPlayer not found");
      }

      return {
        message: "MatchPlayer deleted successfully",
        player_id,
        match_id
      };

    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    }
  }
}
