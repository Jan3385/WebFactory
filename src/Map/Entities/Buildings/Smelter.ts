class Smelter extends Building {
    constructor(position: Vector2, size: Vector2){
        super(position, size);
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
            .AddText(new AABB(new Vector2(22, 20), new Vector2(200, 10)), "Smelter", 20)
            .AddSlot(new AABB(new Vector2(40, 40), new Vector2(100, 100)), new SlotItem(0, GetItem(ItemType.CopperOre), 1));

        return gui;
    }
}