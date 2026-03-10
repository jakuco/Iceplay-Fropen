import { TeamModel } from "../../data/mongo/models/team.model";
import { CustomError, PaginationDTO, CreateTeamDto } from "../../domain";
import { toTeamDto } from "../../domain/dto/team/team.mapper";

export class TeamService {

  constructor() {}

  async createTeam(createTeamDto: CreateTeamDto) {

    const teamExist = await TeamModel.findOne({
      $or: [
        { name: createTeamDto.name },
        { team_id: createTeamDto.team_id }
      ]
    });

    if (teamExist) {
      throw CustomError.badRequest("Team already exists");
    }

    try {

      const team = await TeamModel.create(createTeamDto);

      return {
        id: team.id,
        team_id: team.team_id,
        name: team.name,
        shortname: team.shortname,
        city: team.city,
        coach_id: team.coach_id
      };

    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getTeams(paginationDTO: PaginationDTO) {

    const { page, limit } = paginationDTO;

    try {

      const [totalTeams, teams] = await Promise.all([
        TeamModel.countDocuments().exec(),
        TeamModel.find()
          .skip((page - 1) * limit)
          .limit(limit)
          .lean()
          .exec()
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
          id: team._id,
          team_id: team.team_id,
          name: team.name,
          shortname: team.shortname,
          city: team.city,
          coach_id: team.coach_id
        }))
      };

    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getAllTeams() {

    const teams = await TeamModel.find().exec();
    return teams.map(team => toTeamDto(team))

    try {

      const teams = await TeamModel.find().lean().exec();

      return teams.map(team => ({
        id: team._id,
        team_id: team.team_id,
        name: team.name,
        shortname: team.shortname,
        city: team.city,
        coach_id: team.coach_id
      }));

    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getTeamById(team_id: number) {

    const team = await TeamModel.findOne({ team_id }).lean().exec();

    if (!team) {
      throw CustomError.badRequest("Team not found");
    }

    return {
      id: team._id,
      team_id: team.team_id,
      name: team.name,
      shortname: team.shortname,
      city: team.city,
      coach_id: team.coach_id
    };
  }

  async updateTeam(team_id: number, data: Partial<CreateTeamDto>) {

    const team = await TeamModel.findOne({ team_id });

    if (!team) {
      throw CustomError.badRequest("Team not found");
    }

    try {

      Object.assign(team, data);
      await team.save();

      return {
        id: team.id,
        team_id: team.team_id,
        name: team.name,
        shortname: team.shortname,
        city: team.city,
        coach_id: team.coach_id
      };

    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async deleteTeam(team_id: number) {

    const team = await TeamModel.findOneAndDelete({ team_id });

    if (!team) {
      throw CustomError.badRequest("Team not found");
    }

    return {
      message: "Team deleted successfully",
      team_id
    };
  }
}
