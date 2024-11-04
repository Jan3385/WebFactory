class Smelter extends InventoryBuilding {
    public Inventory: Inventory;
    constructor(position: Vector2, size: Vector2) {
        super(position, size);
        this.Inventory = new Inventory(20);

        //TODO: temp
        this.Inventory.items.push(new InventoryItem(0, GetItem(ItemType.CopperOre), 1));
        this.Inventory.items.push(new InventoryItem(1, GetItem(ItemType.IronPlate), 3));
    }
    public Act(deltaTime: number): void {
        throw new Error("Method not implemented.");
    }
    override OnClick(): void {
        this.OpenGUI();
    }
    public override OpenGUI(): GUI {
        const gui = new GUI(800, 400)
            .AddTopBar("Smelter!")
            .AddText(new AABB(new Vector2(400, 60), new Vector2(200, 10)), "Smelter", 40, "center")
            .AddSlot(new AABB(new Vector2(80, 150), new Vector2(100, 100)), this.Inventory.items[0])
            .AddSlot(new AABB(new Vector2(620, 150), new Vector2(100, 100)), this.Inventory.items[1]);
        return gui;
    }
    public override GetOutputItems(): InventoryItem[] {
        throw new Error("Method not implemented.");
    }
    public override GetInputItems(): InventoryItem[] {
        throw new Error("Method not implemented.");
    }
    public override GetWantedItems(): [Item, number][] {
        throw new Error("Method not implemented.");
    }
    public override AddInputItem(item: InventoryItem): boolean {
        throw new Error("Method not implemented.");
    }
}