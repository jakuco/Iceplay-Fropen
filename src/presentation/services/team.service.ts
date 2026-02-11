import { TeamModel } from "../../data/mongo/models/team.model";
import { CustomError, PaginationDTO, UserEntity } from "../../domain";

type CreateTeamDTO = any; // luego puedes tiparlo mejor

export class TeamService {

  constructor() {}

  async createTeam(createTeamDTO: CreateTeamDTO) {

    const teamExist = await TeamModel.findOne({
      $or: [
        { name: createTeamDTO.name },
        { team_id: createTeamDTO.team_id }
      ]
    });

    if (teamExist) {
      throw CustomError.badRequest("Team already exists");
    }

    try {
      const team = new TeamModel({
        ...createTeamDTO,
      });

      await team.save();

      return {
        id: team.id,
        team_id: team.team_id,
        name: team.name,
        shortname: team.shortname,
        city: team.city
      };

    } catch (err) {
      throw CustomError.internalServer(`${err}`);
    }
  }

  async getTeams(paginationDTO: PaginationDTO) {

    const { page, limit } = paginationDTO;

    try {
      const [totalTeams, teams]: [number, any[]] = await Promise.all([
        TeamModel.countDocuments().exec(),
        TeamModel.find()
          .skip((page - 1) * limit)
          .limit(limit)
          .lean()
          .exec() as Promise<any[]>
      ]);

      return {
        page,
        limit,
        total: totalTeams,
        next: (page * limit < totalTeams)
          ? `/api/teams?page=${page + 1}&limit=${limit}`
          : null,
        prev: (page - 1 > 0)
          ? `/api/teams?page=${page - 1}&limit=${limit}`
          : null,

        teams: teams.map(team => ({
          id: team.id,
          team_id: team.team_id,
          name: team.name,
          shortname: team.shortname,
          city: team.city
        }))
      };

    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getAllTeams() {
    try {
      const teams = await TeamModel.find().lean().exec();
      return teams.map(t => ({
        id: t.id,
        team_id: t.team_id,
        name: t.name,
        shortname: t.shortname,
        city: t.city
      }));
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
}
