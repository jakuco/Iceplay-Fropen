import { ChampionshipModel } from "../../data/mongo/models/championship.model";
import { CustomError, PaginationDTO } from "../../domain";
import { toChampionshipDto } from "../../domain/dto/championship/championship.mapper";

type CreateChampionshipDTO = any;

export class ChampionshipService {

  constructor() {}

  async createChampionship(createChampionshipDTO: CreateChampionshipDTO) {
    const championshipExist = await ChampionshipModel.findOne({ championship_id: createChampionshipDTO.championship_id });

    if (championshipExist) {
      throw CustomError.badRequest("Championship already exists");
    }

    try {
      const championship = new ChampionshipModel({ ...createChampionshipDTO });
      await championship.save();

      return {
        id: championship.id,
        championship_id: championship.championship_id,
        name: championship.name,
        type_id: championship.type_id,
        format_id: championship.format_id,
        state_id: championship.state_id,
        season_id: championship.season_id
      };
    } catch (err) {
      throw CustomError.internalServer(`${err}`);
    }
  }

  async getChampionships(paginationDTO: PaginationDTO) {
    const { page, limit } = paginationDTO;

    try {
      const [totalChampionships, championships]: [number, any[]] = await Promise.all([
        ChampionshipModel.countDocuments().exec(),
        ChampionshipModel.find()
          .skip((page - 1) * limit)
          .limit(limit)
          .lean()
          .exec() as Promise<any[]>
      ]);

      return {
        page,
        limit,
        total: totalChampionships,
        next: (page * limit < totalChampionships)
          ? `/api/championships?page=${page + 1}&limit=${limit}`
          : null,
        prev: (page - 1 > 0)
          ? `/api/championships?page=${page - 1}&limit=${limit}`
          : null,
        championships
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getAllChampionships() {
    const championships = await ChampionshipModel.find().exec();
    return championships.map(c => toChampionshipDto(c))

    try {
      const championships = await ChampionshipModel.find().lean().exec();
      return championships.map(c => ({
        id: c.id,
        championship_id: c.championship_id,
        name: c.name,
        type_id: c.type_id,
        format_id: c.format_id,
        state_id: c.state_id,
        season_id: c.season_id
      }));
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getChampionshipById(championship_id: number) {
    const championship = await ChampionshipModel.findOne({ championship_id }).lean().exec();

    if (!championship) {
      throw CustomError.badRequest("Championship not found");
    }

    return {
      id: championship._id,
      championship_id: championship.championship_id,
      name: championship.name,
      type_id: championship.type_id,
      format_id: championship.format_id,
      state_id: championship.state_id,
      season_id: championship.season_id
    };
  }

  async updateChampionship(championship_id: number, data: any) {
    const championship = await ChampionshipModel.findOne({ championship_id });

    if (!championship) {
      throw CustomError.badRequest("Championship not found");
    }

    try {
      Object.assign(championship, data);
      await championship.save();

      return {
        id: championship.id,
        championship_id: championship.championship_id,
        name: championship.name,
        type_id: championship.type_id,
        format_id: championship.format_id,
        state_id: championship.state_id,
        season_id: championship.season_id
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async deleteChampionship(championship_id: number) {
    const championship = await ChampionshipModel.findOneAndDelete({ championship_id });

    if (!championship) {
      throw CustomError.badRequest("Championship not found");
    }

    return {
      message: "Championship deleted successfully",
      championship_id
    };
  }
}
