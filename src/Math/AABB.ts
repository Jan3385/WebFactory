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
    isInside(other: AABB): boolean{
        return (
            this.x >= other.x &&
            this.x + this.width <= other.x + other.width &&
            this.y >= other.y &&
            this.y + this.height <= other.y + other.height
        );
    }
    isDotInside(x:number, y:number): boolean{
        return (
            this.x <= x &&
            this.x + this.width >= x &&
            this.y <= y &&
            this.y + this.height >= y
        );
    }
    copy(): AABB{
        return new AABB(new Vector2(this.x, this.y), new Vector2(this.width, this.height));
    }
}