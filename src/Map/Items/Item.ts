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
        this.destroy();
    }
}
interface Item {
    name: string;
    image: HTMLImageElement;
    description: string;
    weight: number;
    tag: ItemTag;
}
enum ItemType {
    IronOre,
    IronIngot,
    CopperOre,
    CopperIngot,
    IronPlate,
    Coal,
}
const ITEM_ICON_PREFIX = "Images/Items/";
const Items: Record<ItemType, Item> = {
    [ItemType.IronOre] : {
        name: "Iron Ore",
        image: new Image(32, 32),
        description: "A chunk of iron ore",
        weight: 1,
        tag: ItemTag.Ore,
    },
    [ItemType.IronIngot] : {
        name: "Iron Ingot",
        image: new Image(32, 32),
        description: "A bar of iron",
        weight: 1,
        tag: ItemTag.Ingot,
    },
    [ItemType.CopperOre] : {
        name: "Copper Ore",
        image: new Image(32, 32),
        description: "A chunk of copper ore",
        weight: 1,
        tag: ItemTag.Ore,
    },
    [ItemType.CopperIngot] : {
        name: "Copper Ingot",
        image: new Image(32, 32),
        description: "A bar of copper",
        weight: 1,
        tag: ItemTag.Ingot,
    },
    [ItemType.IronPlate] : {
        name: "Iron Plate",
        image: new Image(32, 32),
        description: "A plate of iron",
        weight: 1,
        tag: ItemTag.None,
    },
    [ItemType.Coal] : {
        name: "Coal",
        image: new Image(32, 32),
        description: "A chunk of coal",
        weight: 1,
        tag: ItemTag.Fuel,
    },
}
function GetItem(type: ItemType): Item {
    return Items[type];
}
function LoadItems(){
    for(let i = 0; i < Object.keys(Items).length; i++){
        GetItem(i).image.src = ITEM_ICON_PREFIX + GetItem(i).name.replace(/\s+/g,'_').toLowerCase() + ".png"; //replace spaces with underscores and find item image
    }
}