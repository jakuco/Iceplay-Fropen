import { PlayerModel } from "../../data/mongo/models/player.model";
import { CustomError, PaginationDTO, UpdatePlayerDto } from "../../domain";

type CreatePlayerDTO = any;

export class PlayerService {

  constructor() {}

  async createPlayer(createPlayerDTO: CreatePlayerDTO) {

    const playerExist = await PlayerModel.findOne({
      player_id: createPlayerDTO.player_id
    });

    if (playerExist) {
      throw CustomError.badRequest("Player already exists");
    }

    try {
      const player = new PlayerModel({
        ...createPlayerDTO,
      });

      await player.save();

      return {
        id: player.id,
        player_id: player.player_id,
        name: player.name,
        lastname: player.lastname,
        number: player.number,
        team_id: player.team_id,
        statics: player.player_statics
      };

    } catch (err) {
      throw CustomError.internalServer(`${err}`);
    }
  }

  async getPlayers(paginationDTO: PaginationDTO) {

    const { page, limit } = paginationDTO;

    try {
      const [totalPlayers, players]: [number, any[]] = await Promise.all([
        PlayerModel.countDocuments().exec(),
        PlayerModel.find()
          .skip((page - 1) * limit)
          .limit(limit)
          .lean()
          .exec() as Promise<any[]>
      ]);
 
      return {
        page,
        limit,
        total: totalPlayers,
        next: (page * limit < totalPlayers)
          ? `/api/players?page=${page + 1}&limit=${limit}`
          : null,
        prev: (page - 1 > 0)
          ? `/api/players?page=${page - 1}&limit=${limit}`
          : null,
        players: players.map((player: any) => ({
          id: player._id,
          player_id: player.player_id,
          name: player.name,
          lastname: player.lastname,
          number: player.number,
          team_id: player.team_id,
          primary_position: player.primary_position,
          home_country: player.home_country,
          statics: player.player_statics
        }))
      };

    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getPlayerById(player_id: number) {

    const player = await PlayerModel
      .findOne({ player_id })
      .lean()
      .exec();

    if (!player) {
      throw CustomError.badRequest("Player not found");
    }

    return {
      id: player._id,
      player_id: player.player_id,
      number: player.number,
      name: player.name,
      lastname: player.lastname,
      weight: player.weight,
      height: player.height,
      primary_position: player.primary_position,
      secondary_position: player.secondary_position,
      home_country: player.home_country,
      state_id: player.state_id,
      type: player.type,
      team_id: player.team_id,
      statics: player.player_statics
    };
  }

  // ✅ UPDATE usando DTO + validación básica extra
  async updatePlayer(player_id: number, updatePlayerDto: UpdatePlayerDto) {

    const player = await PlayerModel.findOne({ player_id });

    if (!player) {
      throw CustomError.badRequest("Player not found");
    }

    try {

      // (opcional pero recomendado) evitar mandar string vacíos en name/lastname
      if (updatePlayerDto.name !== undefined && updatePlayerDto.name.trim().length === 0) {
        throw CustomError.badRequest("name cannot be empty");
      }
      if (updatePlayerDto.lastname !== undefined && updatePlayerDto.lastname.trim().length === 0) {
        throw CustomError.badRequest("lastname cannot be empty");
      }

      Object.assign(player, updatePlayerDto);
      await player.save();

      return {
        id: player.id,
        player_id: player.player_id,
        number: player.number,
        name: player.name,
        lastname: player.lastname,
        weight: player.weight,
        height: player.height,
        primary_position: player.primary_position,
        secondary_position: player.secondary_position,
        home_country: player.home_country,
        state_id: player.state_id,
        type: player.type,
        team_id: player.team_id,
        statics: player.player_statics
      };

    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async deletePlayer(player_id: number) {

    const player = await PlayerModel.findOneAndDelete({ player_id });

    if (!player) {
      throw CustomError.badRequest("Player not found");
    }

    return {
      message: "Player deleted successfully",
      player_id
    };
  }
}