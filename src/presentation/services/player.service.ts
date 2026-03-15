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
        //id: player.id,
        player_id: player.id,
        name: player.firstName,
        lastname: player.lastName,
        number: player.number,
        team_id: player.teamId,
        //statics: player.
      };

    } catch (err) {
      // si mongoose lanza un ValidationError al crear, queda como 500; puedes mapearlo a 400 si quieres
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
        players: players.map((p: any) => ({
          id: p._id,
          player_id: p.player_id,
          name: p.name,
          lastname: p.lastname,
          number: p.number,
          team_id: p.team_id,
          primary_position: p.primary_position,
          home_country: p.home_country,
          statics: p.player_statics
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
      player_id: player.id,
      number: player.number,
      name: player.name,
      lastname: player.lastname,
      name: player.firstName,
      lastname: player.lastName,
      weight: player.weight,
      height: player.height,
      primary_position: player.positionId,
      //secondary_position: player.secondary_position,
      home_country: player.home_country,
      state_id: player.state_id,
      type: player.type,
      team_id: player.team_id,
      statics: player.player_statics
    };
  }

  // ✅ UPDATE (PATCH real): solo actualiza lo que viene y valida sin exigir todo el doc
  async updatePlayer(player_id: number, updatePlayerDto: UpdatePlayerDto) {

    // validaciones extra rápidas (si mandan strings vacíos)
    if (updatePlayerDto.name !== undefined && updatePlayerDto.name.trim().length === 0) {
      throw CustomError.badRequest("name cannot be empty");
    }
    if (updatePlayerDto.lastname !== undefined && updatePlayerDto.lastname.trim().length === 0) {
      throw CustomError.badRequest("lastname cannot be empty");
    }

    try {
      // arma un objeto solo con keys definidas (evita setear undefined)
      const updateData: Record<string, any> = {};
      for (const [k, v] of Object.entries(updatePlayerDto as any)) {
        if (v !== undefined) updateData[k] = v;
      }

      if (Object.keys(updateData).length === 0) {
        throw CustomError.badRequest("No fields to update");
      }

      const updated = await PlayerModel.findOneAndUpdate(
        { player_id },
        { $set: updateData },
        {
          new: true,
          runValidators: true, // valida lo que estás seteando
        }
      ).exec();

      if (!updated) {
        throw CustomError.badRequest("Player not found");
      }

      return {
        id: updated.id,
        player_id: updated.player_id,
        number: updated.number,
        name: updated.name,
        lastname: updated.lastname,
        weight: updated.weight,
        height: updated.height,
        primary_position: updated.primary_position,
        secondary_position: updated.secondary_position,
        home_country: updated.home_country,
        state_id: updated.state_id,
        type: updated.type,
        team_id: updated.team_id,
        statics: updated.player_statics
      };

    } catch (error) {
      // si ya es CustomError, no lo conviertas a 500
      if (error instanceof CustomError) throw error;
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