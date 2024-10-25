class Smelter extends Building {
    constructor(position: Vector2, size: Vector2){
        super(position, size);
    }
    public Act(deltaTime: number): void {
        throw new Error("Method not implemented.");
    }
}