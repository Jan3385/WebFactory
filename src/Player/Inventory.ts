class InventoryItem{
    public item: Item|null;
    public amount: number;
    public slot: number;
    constructor(item: Item|null, amount: number, slot: number){
        this.item = item;
        this.amount = amount;
        this.slot = slot;
    }
    public static CreateEmpty(slot: number): InventoryItem{
        return new InventoryItem(null, 0, slot);
    }
    public static Swap(a: InventoryItem, b: InventoryItem){
        let temp = a.item;
        let temp2 = a.amount;

        a.item = b.item;
        a.amount = b.amount;

        b.item = temp;
        b.amount = temp2;
    }
    public delete(){
        this.item = null;
        this.amount = 0;
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
    public items: InventoryItem[];
    public maxItems: number;
    constructor(maxItems: number){
        this.maxItems = maxItems;

        this.items = new Array<InventoryItem>(maxItems);

        for(let i = 0; i < this.items.length; i++){
            this.items[i] = InventoryItem.CreateEmpty(i);
        }
    }
    AddItem(item: InventoryItem): boolean{
        let FoundItem = false;
        this.items.every(iItem => {
            if(iItem.item == item.item){
                iItem.amount += item.amount;
                FoundItem = true;
                return false;
            }
            return true;
        });
        if(FoundItem) return true;

        for(let i = 0; i < this.items.length; i++){
            if(this.items[i].item == null){
                this.items[i].item = item.item;
                this.items[i].amount = item.amount;
                return true;
            }
        }

        if(this.items.length >= this.maxItems) return false;
        this.items.push(item);
        return true;
    }
}