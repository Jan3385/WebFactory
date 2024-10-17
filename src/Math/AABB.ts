class AABB{
    x: number;
    y: number;
    width: number;
    height: number;
    constructor(position: Vector2, size: Vector2){
        this.x = position.x;
        this.y = position.y;
        this.width = size.x;
        this.height = size.y;
    }
    isColliding(other: AABB): boolean{
        return (
            this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y
        );
    }
}