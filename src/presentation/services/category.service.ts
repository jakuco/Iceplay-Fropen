import { CategoryModel } from '../../data/mongo/models/category.model';
import { CreateCategoryDto, CustomError, PaginationDTO, UserEntity } from "../../domain";

export class CategoryService{
    

    //Dependendy Injection
    constructor(){

    }

    async createCategory(createCategoryDto: CreateCategoryDto, user: UserEntity){
        
        //? Verificamos que la categpria no exista
        const categoryExist = await CategoryModel.findOne({name: createCategoryDto.name});

        //? En caso de existir se lanza un error para informar
        if(categoryExist) throw CustomError.badRequest("Category alredy exist");

        //! Siempre usamos un try or catch cuando vamos a impactar en la BD
        try{

            const category =  new CategoryModel({
                ...createCategoryDto,
                user: user.id
            })

            await category.save();

            return {
                id: category.id,
                name: category.name,
                available: category.available
            }

        }catch(err){
            throw CustomError.internalServer(`${err}`);
        }

    }

    async getCategories(paginationDTO: PaginationDTO){
        
        //* Podriamos poner aqui tambien valores por defecto, pero se supone que al pasar por el DTO ya viene validadas
        const {page, limit} = paginationDTO;

        try{
            // const totalCategories = await CategoryModel.countDocuments();
            // const categories = await CategoryModel.find()
            const [totalCategories, categories]: [number, any[]] = await Promise.all([
                CategoryModel.countDocuments().exec(),
                CategoryModel.find()
                  .skip((page - 1) * limit)
                  .limit(limit)
                  .lean()
                  .exec() as Promise<any[]>
            ]);
  
            return {
                page: page,
                limit: limit,
                total: totalCategories,
                next: (page * limit < totalCategories) ? `/api/categories?page=${page+1}&limit=${limit}` : null,
                prev: (page - 1 > 0) ? `/api/categories?page=${page-1}&limit=${limit}`: null,
                categories: categories.map((category: any) => ({
                    id: category.id,
                    name: category.name,
                    available: category.available
                })),
            }

        }catch(error){
            throw CustomError.internalServer(`${error}`);
        }
    }

}