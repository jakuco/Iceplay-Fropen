export class PaginationDTO {

    //* Aque podemos hacer la validaciones que queramos segun las necesadades colocar limites a la paginacion, etc.

    private constructor(
        public readonly page: number,
        public readonly limit: number,

    ){}

    static create(page: number = 1, limit: number = 10): [string?, PaginationDTO?] {
        if(isNaN(page) || isNaN(limit)) return ["Page and Limit must be a number"];
        if(page <=0 || limit <= 0) return ["Page and Limit must be greater than 0"];

        return [undefined, new PaginationDTO(page, limit)];

    }

}