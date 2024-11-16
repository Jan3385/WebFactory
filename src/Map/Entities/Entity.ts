/// <reference path="../../Player/Inventory.ts" />
/// <reference path="../Items/Recipes.ts" />

abstract class Entity{
    public AABB: AABB;
    public position: Vector2;
    public texture: HTMLImageElement | null = null;
    public renderLayer: number;
    constructor(position: Vector2, size: Vector2, renderLayer: number = 0){
        this.position = position;
        this.renderLayer = renderLayer;
        this.AABB = new AABB(
            position.subtract(size.divideAndFloor(2)), 
            size);

        Entity.AddEntity(this);
    }
    public static AddEntity(entity: Entity){
        for(let i = 0; i < MapManager.ins.entities.length; i++){
            if(MapManager.ins.entities[i].renderLayer > entity.renderLayer){
                MapManager.ins.entities.splice(i, 0, entity);
                return;
            }
        }
        MapManager.ins.entities.push(entity);
    }
    SetTexture(texture: string){
        this.texture = new Image(this.AABB.width*Chunk.PixelSize, this.AABB.height*Chunk.PixelSize);
        this.texture.src = "Images/Entities/"+texture+".png";
    }
    abstract Draw(cameraOffset: Vector2): void;
    abstract OnClick(): void;
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
    //returns -1 if no entity found, else returns entity index
    public static IsInsideEntity(pos: Vector2): number{
        for(let i = MapManager.ins.entities.length-1; i >= 0; i--){
            if(MapManager.ins.entities[i].AABB.isDotInside(pos.x, pos.y)) return i;
        }
        return -1;
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
    Draw(cameraOffset: Vector2): void {
        if(this.texture == null) {
            console.error(`Entity at ${this.position.x}x ${this.position.y}y: texture is null`);
            return;
        };

        RenderManager.ctx.drawImage(
            this.texture, 
            this.position.x * Chunk.PixelSize + cameraOffset.x, 
            this.position.y * Chunk.PixelSize + cameraOffset.y,
            this.AABB.width*Chunk.PixelSize,
            this.AABB.height*Chunk.PixelSize);
    }

    public abstract Act(deltaTime: number): void;
    public abstract OpenGUI(): GUI;
}
abstract class InventoryBuilding extends Building{
    public abstract Inventory: Inventory;

    public abstract GetOutputItems(): InventoryItem[];
    public abstract GetInputItems(): InventoryItem[];
    public abstract GetWantedItems(): ItemGroup;
    public abstract AddInputItem(item: InventoryItem): boolean;
}

class EntityItem extends Entity {
    public item: Item;
    public static ITEM_SIZE = new Vector2(0.9, 0.9); // 1,1 = 1 block
    constructor(position: Vector2, item: Item){
        super(position, EntityItem.ITEM_SIZE, 5);
        this.item = item;
    }
    Draw(cameraOffset: Vector2){
        RenderManager.ctx.drawImage(
            this.item.image, 
            this.position.x * Chunk.PixelSize + cameraOffset.x, 
            this.position.y * Chunk.PixelSize + cameraOffset.y,
            this.AABB.width * Chunk.PixelSize,
            this.AABB.height * Chunk.PixelSize);
    }
    OnClick(): void{
        Player.ins.PlayerInventory.AddItem(new InventoryItem(this.item, 1, 0));
        this.destroy();
    }
}