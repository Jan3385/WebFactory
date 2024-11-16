class Recipe{
    public name: string;
    public ingredients: Array<[ItemType, Number]>;
    public result: Array<[ItemType, Number]>;
    public time: number;

    constructor(name: string, ingredients: Array<[ItemType, Number]>, result: Array<[ItemType, Number]>, time: number){
        this.name = name;
        this.ingredients = ingredients;
        this.result = result;
        this.time = time;
    }
}