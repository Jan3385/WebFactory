class SlotItem{
    public slot: number;
    public item: Item
    public amount: number;
    constructor(slot: number, item: Item, amount: number) {
        this.slot = slot;
        this.item = item;
        this.amount = amount;
    }
}