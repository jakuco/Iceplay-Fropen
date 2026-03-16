import { CustomError, PaginationDTO } from "$domain";

type CreateChampionshipTeamDTO = any;

export class ChampionshipTeamService {

  constructor() {}

  async createChampionshipTeam(createChampionshipTeamDTO: CreateChampionshipTeamDTO) {
    const exist = await ChampionshipTeamModel.findOne({
      team_id: createChampionshipTeamDTO.team_id,
      championship_id: createChampionshipTeamDTO.championship_id
    });

    if (exist) {
      throw CustomError.badRequest("Team already registered in this championship");
    }

    try {
      const championshipTeam = new ChampionshipTeamModel({ ...createChampionshipTeamDTO });
      await championshipTeam.save();

      return {
        id: championshipTeam.id,
        team_id: championshipTeam.team_id,
        championship_id: championshipTeam.championship_id,
        inscription_date: championshipTeam.inscription_date
      };
    } catch (err) {
      throw CustomError.internalServer(`${err}`);
    }
  }

  async getChampionshipTeams(paginationDTO: PaginationDTO) {
    const { page, limit } = paginationDTO;

    try {
      const [total, championshipTeams]: [number, any[]] = await Promise.all([
        ChampionshipTeamModel.countDocuments().exec(),
        ChampionshipTeamModel.find()
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
          ? `/api/championship-teams?page=${page + 1}&limit=${limit}`
          : null,
        prev: (page - 1 > 0)
          ? `/api/championship-teams?page=${page - 1}&limit=${limit}`
          : null,
        championshipTeams
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getAllChampionshipTeams() {
    try {
      const championshipTeams = await ChampionshipTeamModel.find().lean().exec() as any[];
      return championshipTeams.map(ct => ({
        id: ct._id,
        team_id: ct.team_id,
        championship_id: ct.championship_id,
        inscription_date: ct.inscription_date
      }));
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getChampionshipTeamById(id: string) {
    const championshipTeam = await ChampionshipTeamModel.findById(id).lean().exec();

    if (!championshipTeam) {
      throw CustomError.badRequest("ChampionshipTeam not found");
    }

    return {
      id: championshipTeam._id,
      team_id: championshipTeam.team_id,
      championship_id: championshipTeam.championship_id,
      inscription_date: championshipTeam.inscription_date
    };
  }

  async updateChampionshipTeam(id: string, data: any) {
    const championshipTeam = await ChampionshipTeamModel.findById(id);

    if (!championshipTeam) {
      throw CustomError.badRequest("ChampionshipTeam not found");
    }

    try {
      Object.assign(championshipTeam, data);
      await championshipTeam.save();

      return {
        id: championshipTeam.id,
        team_id: championshipTeam.team_id,
        championship_id: championshipTeam.championship_id,
        inscription_date: championshipTeam.inscription_date
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async deleteChampionshipTeam(id: string) {
    const championshipTeam = await ChampionshipTeamModel.findByIdAndDelete(id);

    if (!championshipTeam) {
      throw CustomError.badRequest("ChampionshipTeam not found");
    }

    return {
      message: "ChampionshipTeam deleted successfully",
      id
    };
  }
}
