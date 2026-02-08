

export class CreateCategoryDTO {
    private constructor(
        readonly name: string,
        readonly available: boolean
    ){}

    static create(obj: {[key: string]: any }): [string?, CreateCategoryDTO?] {
        const {name, available = false} = obj;
        let availableAsBoolean =  available;


        if(!name) return ['Missing name'];
        if(!available) return ['Missing available'];
        if(typeof available != 'boolean') {
            availableAsBoolean = (available === 'true');
        }else{
            return ["available needs to be a boolean value"]
        }

        return [undefined, new CreateCategoryDTO(name, availableAsBoolean)]
    }

} 