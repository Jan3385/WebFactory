/// <reference path="./Player/Player.ts" />
/// <reference path="./Player/InputManager.ts" />
/// <reference path="./Map/Entities/Entity.ts" />
/// <reference path="./Map/Entities/Buildings/Smelter.ts" />
/// <reference path="./Map/Items/Item.ts" />

const fps = 50;
let deltaTime = 1;

async function Main() {
    // Start

    LoadItems();

    Player.ins.move(new Vector2(0, 0)); //updates chunks and moves player
    new RenderManager();
    BottomClampInventoryGUI.GetAndSetPlayerGUI(); //Generates player GUI

    //temp
    const a = new Smelter(new Vector2(1, 1), new Vector2(1, 1));
    a.SetTexture("SigmaMachine");
    const b = new Smelter(new Vector2(3, 2), new Vector2(1, 1));
    b.SetTexture("SigmaMachine");
    const c = new EntityItem(new Vector2(2.5, 2), GetItem(ItemType.CopperOre));
    const d = new EntityItem(new Vector2(5, 2), GetItem(ItemType.CopperIngot));
    const e = new EntityItem(new Vector2(6, 2), GetItem(ItemType.IronPlate));
    const f = new EntityItem(new Vector2(7, 2), GetItem(ItemType.Coal));

    let run: boolean = true;
    while (run) {
        // Update loop
        let startTime = performance.now();

        InputManager.ins.UpdateInput();

        Player.ins.move(InputManager.ins.MovementVector); //updates chunks and moves player   

        MapManager.ins.buildings.forEach(building => building.Act(deltaTime));

        RenderManager.ins.Draw(); // draws everything

        let endTime = performance.now()
        const executionTime = endTime - startTime;
        deltaTime = executionTime;
        if(executionTime > 16) console.log("Lag spike! wait time designated for:" ,(1/fps*1000) - executionTime);
        await new Promise(r => setTimeout(r, Math.max((1/fps*1000) - executionTime, 0)));
    }
}

Main();