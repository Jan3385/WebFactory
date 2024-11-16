class Smelter extends InventoryBuilding {
    public Inventory: Inventory;
    public static Recipes: Recipe[] = Smelter.GetRecipes();
    constructor(position: Vector2, size: Vector2) {
        super(position, size);
        this.Inventory = new Inventory(2);

        this.Inventory.AddItem(new InventoryItem(GetItem(ItemType.CopperOre), 1, 0));
        this.Inventory.AddItem(new InventoryItem(GetItem(ItemType.IronPlate), 3, 1));
    }
    public Act(deltaTime: number): void {
        
    }
    override OnClick(): void {
        this.OpenGUI();
    }
    public override OpenGUI(): GUI {
        const gui = new BuildingGUI(800, 400)
            .AddTopBar("Smelter!")
            .AddText(new AABB(new Vector2(400, 60), new Vector2(200, 10)), "Smelter", 40, "center")
            .AddSlot(new AABB(new Vector2(80, 150), new Vector2(100, 100)), this.Inventory.items[0])
            .AddSlot(new AABB(new Vector2(620, 150), new Vector2(100, 100)), this.Inventory.items[1]);
        return gui;
    }
    private static GetRecipes(): Recipe[] {
        return [
            new Recipe("Iron Smelting", [[ItemType.IronOre, 1]], [[ItemType.IronIngot, 1]], 2),
            new Recipe("Copper Smelting", [[ItemType.CopperOre, 1]], [[ItemType.CopperIngot, 1]], 1),
        ]
    }
    public override GetOutputItems(): InventoryItem[] {
        return [ this.Inventory.items[1] ];
    }
    public override GetInputItems(): InventoryItem[] {
        return [ this.Inventory.items[0] ];
    }
    public override GetWantedItems(): ItemGroup {
        const ig = new ItemGroup();
        Smelter.Recipes.forEach(recipe => {
            recipe.ingredients.forEach(ingredient => {
                ig.addItem(GetItem(ingredient[0]));
            });
        });
        return ig;
    }
    public override AddInputItem(item: InventoryItem): boolean {
        if(this.Inventory.items[0].item == null){
            this.Inventory.items[0] = item;
            return true;
        }else if(this.Inventory.items[0] == item){
            this.Inventory.items[0].amount += item.amount;
        }
        return false;
    }
}