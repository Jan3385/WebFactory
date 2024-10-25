class Entity{
    public AABB: AABB;
    public position: Vector2;
    public texture: HTMLImageElement | null = null;
    constructor(position: Vector2, size: Vector2){
        this.position = position;
        this.AABB = new AABB(
            position.subtract(size.divideAndFloor(2)), 
            size);
        MapManager.ins.entities.push(this);
    }
    SetTexture(texture: string){
        this.texture = new Image(this.AABB.width*Chunk.PixelSize, this.AABB.height*Chunk.PixelSize);
        this.texture.src = "Images/Entities/"+texture+".png";
    }
    Draw(cameraOffset: Vector2){
        if(this.texture == null) {
            console.error("Entity texture is null");
            return;
        };

        RenderManager.ctx.drawImage(
            this.texture, 
            this.position.x * Chunk.PixelSize + cameraOffset.x, 
            this.position.y * Chunk.PixelSize + cameraOffset.y,
            this.AABB.width*Chunk.PixelSize,
            this.AABB.height*Chunk.PixelSize);
    }
    /*
    * offsets by half a block
    */
    static GetAt(pos: Vector2): Entity[] | null{
        return MapManager.ins.entities.filter(entity => entity.AABB.isDotInside(pos.x + .5, pos.y + .5));
    }
    static GetAtPrecise(pos: Vector2): Entity[] | null{
        return MapManager.ins.entities.filter(entity => entity.AABB.isDotInside(pos.x, pos.y));
    }
    public destroy(): void{
        MapManager.ins.entities.splice(MapManager.ins.entities.indexOf(this), 1);
    }
}
abstract class Building extends Entity{
    constructor(position: Vector2, size: Vector2){
        super(position, size);
        MapManager.ins.buildings.push(this);
    }
    public override destroy(): void{
        MapManager.ins.buildings.splice(MapManager.ins.buildings.indexOf(this), 1);
        super.destroy();
    }
    /*
    * offsets by half a block
    */
    static override GetAt(pos: Vector2): Building[] | null {
        return MapManager.ins.buildings.filter(entity => entity.AABB.isDotInside(pos.x + .5, pos.y + .5));
    }
    static override GetAtPrecise(pos: Vector2): Entity[] | null {
        return MapManager.ins.buildings.filter(entity => entity.AABB.isDotInside(pos.x, pos.y));
    }

    abstract Act(deltaTime: number): void;
}