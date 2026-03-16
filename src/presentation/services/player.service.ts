import { PlayerModel } from "../../data/mongo/models/team.model";
import { CustomError, PaginationDTO, UpdatePlayerDto } from "../../domain";

type CreatePlayerDTO = any;

export class PlayerService {

  constructor() {}

  async createPlayer(createPlayerDTO: CreatePlayerDTO) {

    const playerExist = await PlayerModel.findOne({
      id: createPlayerDTO.player_id ?? createPlayerDTO.id
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
        player_id: player.id,
        name: player.firstName,
        lastname: player.lastName,
        number: player.number,
        team_id: player.teamId,
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
        players: players.map((p: any) => ({
          id: p._id,
          player_id: p.id,
          name: p.firstName,
          lastname: p.lastName,
          number: p.number,
          team_id: p.teamId,
          primary_position: p.positionId,
        }))
      };

    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getPlayerById(player_id: number) {

    const player = await PlayerModel
      .findOne({ id: player_id })
      .lean()
      .exec();

    if (!player) {
      throw CustomError.badRequest("Player not found");
    }

    return {
      id: player._id,
      player_id: player.id,
      number: player.number,
      name: player.firstName,
      lastname: player.lastName,
      weight: player.weight,
      height: player.height,
      primary_position: player.positionId,
      status: player.status,
      team_id: player.teamId,
    };
  }

  async updatePlayer(player_id: number, updatePlayerDto: UpdatePlayerDto) {

    if (updatePlayerDto.name !== undefined && updatePlayerDto.name.trim().length === 0) {
      throw CustomError.badRequest("name cannot be empty");
    }
    if (updatePlayerDto.lastname !== undefined && updatePlayerDto.lastname.trim().length === 0) {
      throw CustomError.badRequest("lastname cannot be empty");
    }

    try {
      const updateData: Record<string, any> = {};
      for (const [k, v] of Object.entries(updatePlayerDto as any)) {
        if (v !== undefined) updateData[k] = v;
      }

      if (Object.keys(updateData).length === 0) {
        throw CustomError.badRequest("No fields to update");
      }

      const updated = await PlayerModel.findOneAndUpdate(
        { id: player_id },
        { $set: updateData },
        {
          new: true,
          runValidators: true,
        }
      ).exec();

      if (!updated) {
        throw CustomError.badRequest("Player not found");
      }

      return {
        id: updated.id,
        player_id: updated.id,
        number: updated.number,
        name: updated.firstName,
        lastname: updated.lastName,
        weight: updated.weight,
        height: updated.height,
        primary_position: updated.positionId,
        status: updated.status,
        team_id: updated.teamId,
      };

    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    }
  }

  async deletePlayer(player_id: number) {

    const player = await PlayerModel.findOneAndDelete({ id: player_id });

    if (!player) {
      throw CustomError.badRequest("Player not found");
    }

    return {
      message: "Player deleted successfully",
      player_id
    };
  }
}
