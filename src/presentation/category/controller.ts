import { Request, Response } from "express";
import { CreateCategoryDto, CustomError, PaginationDTO } from "../../domain";
import { CategoryService } from "../services/category.service";

export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  private handleError(err: unknown, res: Response) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }

  public createCategory = async (req: Request, res: Response) => {
    const [error, createCategoryDto] = CreateCategoryDto.create(req.body);
    if (error) return res.status(400).json({ message: error });

    // ojo: esto depende de cómo tu AuthMiddleware inyecta el usuario
    // si es req.body.user está bien por ahora
    this.categoryService.createCategory(createCategoryDto!, (req as any).body.user)
      .then(category => res.status(200).json(category))
      .catch(error => this.handleError(error, res));
  };

  public getCategories = async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;

    const [error, paginationDTO] = PaginationDTO.create(+page, +limit);
    if (error) return res.status(400).json({ error });

    this.categoryService.getCategories(paginationDTO!)
      .then(categories => res.status(200).json(categories))
      .catch(error => this.handleError(error, res));
  };
}