import { PlayerModel } from "../../data/mongo/models/player.model";
import { CustomError, PaginationDTO, UserEntity } from "../../domain";

// Puedes crear luego un DTO específico: CreatePlayerDTO
// Por ahora lo tipamos como "any" para que funcione directo con tu esquema
type CreatePlayerDTO = any;

export class PlayerService {

  constructor() {}

  async createPlayer(createPlayerDTO: CreatePlayerDTO, user: UserEntity) {

    // Verificamos que el jugador no exista por nombre o player_id
    const playerExist = await PlayerModel.findOne({
      $or: [
        // name: createPlayerDTO.name },
        { player_id: createPlayerDTO.player_id }
      ]
    });

    if (playerExist) {
      throw CustomError.badRequest("Player already exists");
    }

    try {
      const player = new PlayerModel({
        ...createPlayerDTO,
        //user: user.id   // si más adelante quieres registrar quién lo creó
      });

      await player.save();

      return {
        id: player.id,
        player_id: player.player_id,
        name: player.name,
        number: player.number,
        team_id: player.team_id
      };

    } catch (err) {
      throw CustomError.internalServer(`${err}`);
    }
  }

  async getPlayer(createPlayerDTO: CreatePlayerDTO, player_id: Number){
    const playerExist = await PlayerModel.findOne({
      $or: [
        //{}
        //{ name: createPlayerDTO.name },
        //{ player_id: createPlayerDTO.player_id }
        { player_id: player_id }

      ]
    });

    if (playerExist) {
      //throw CustomError.badRequest("Player already exists");
      console.log(playerExist, typeof(playerExist))
      return playerExist
    } else {throw CustomError.badRequest("Player don't exist"); }
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
          id: player.id,
          player_id: player.player_id,
          name: player.name,
          number: player.number,
          team_id: player.team_id,
          primary_position: player.primary_position,
          home_country: player.home_country
        }))
      };

    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getPlayerById(player_id: number) {

    const player = await PlayerModel
      .findOne({player_id})
      .populate("team_id") // solo si usas ObjectId + ref
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
      weight: player.weight,
      height: player.height,
      primary_position: player.primary_position,
      secondary_position: player.secondary_position,
      home_country: player.home_country,
      state_id: player.state_id,
      type: player.type,
      team: player.team_id
    };
  }


  async updatePlayer(player_id: number, data: any) {

  const player = await PlayerModel.findOne({ player_id });

  if (!player) {
    throw CustomError.badRequest("Player not found");
  }

    try {
      Object.assign(player, data);
      await player.save();

      return {
        id: player.id,
        player_id: player.player_id,
        name: player.name,
        number: player.number,
        team_id: player.team_id
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