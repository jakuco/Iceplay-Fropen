import { CoachModel } from "../../data/mongo/models/coach.model";
import { CustomError, PaginationDTO } from "../../domain";

type CreateCoachDTO = any;

export class CoachService {

  constructor() {}

  async createCoach(createCoachDTO: CreateCoachDTO) {
    const coachExist = await CoachModel.findOne({ coach_id: createCoachDTO.coach_id });

    if (coachExist) {
      throw CustomError.badRequest("Coach already exists");
    }

    try {
      const coach = new CoachModel({ ...createCoachDTO });
      await coach.save();

      return {
        id: coach.id,
        coach_id: coach.coach_id,
        name: coach.name,
        phone: coach.phone,
        email: coach.email
      };
    } catch (err) {
      throw CustomError.internalServer(`${err}`);
    }
  }

  async getCoaches(paginationDTO: PaginationDTO) {
    const { page, limit } = paginationDTO;

    try {
      const [totalCoaches, coaches]: [number, any[]] = await Promise.all([
        CoachModel.countDocuments().exec(),
        CoachModel.find()
          .skip((page - 1) * limit)
          .limit(limit)
          .lean()
          .exec() as Promise<any[]>
      ]);

      return {
        page,
        limit,
        total: totalCoaches,
        next: (page * limit < totalCoaches)
          ? `/api/coaches?page=${page + 1}&limit=${limit}`
          : null,
        prev: (page - 1 > 0)
          ? `/api/coaches?page=${page - 1}&limit=${limit}`
          : null,
        coaches
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getCoachById(coach_id: number) {
    const coach = await CoachModel.findOne({ coach_id }).lean().exec();

    if (!coach) {
      throw CustomError.badRequest("Coach not found");
    }

    return {
      id: coach._id,
      coach_id: coach.coach_id,
      name: coach.name,
      phone: coach.phone,
      email: coach.email
    };
  }

  async updateCoach(coach_id: number, data: any) {
    const coach = await CoachModel.findOne({ coach_id });

    if (!coach) {
      throw CustomError.badRequest("Coach not found");
    }

    try {
      Object.assign(coach, data);
      await coach.save();

      return {
        id: coach.id,
        coach_id: coach.coach_id,
        name: coach.name,
        phone: coach.phone,
        email: coach.email
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async deleteCoach(coach_id: number) {
    const coach = await CoachModel.findOneAndDelete({ coach_id });

    if (!coach) {
      throw CustomError.badRequest("Coach not found");
    }

    return {
      message: "Coach deleted successfully",
      coach_id
    };
  }
}
