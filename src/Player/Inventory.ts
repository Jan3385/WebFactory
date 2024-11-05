class InventoryItem{
    public item: Item
    public amount: number;
    constructor(item: Item, amount: number) {
        this.item = item;
        this.amount = amount;
    }
}
enum ItemTag{
    None = 0,
    Ingot = 1 << 0,
    Ore = 1 << 1,
    Fuel = 1 << 2,
}
class ItemGroup{
    public items: Item[] = [];
    public itemTag: ItemTag = ItemTag.None;
    includes(item: Item): boolean{
        if(this.items.includes(item)) return true;
        if(this.itemTag == ItemTag.None) return false;
        if((item.tag & this.itemTag) != 0) return true;
        return false;
    }
}
class Inventory{
    public items: InventoryItem[] = [];
    public maxItems: number;
    constructor(maxItems: number){
        this.maxItems = maxItems;
    }
    
}