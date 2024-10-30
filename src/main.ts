/// <reference path="./Player/Player.ts" />
/// <reference path="./Player/InputManager.ts" />
/// <reference path="./Map/Entities/Enity.ts" />
/// <reference path="./Map/Entities/Buildings/Smelter.ts" />

const fps = 50;

async function Main() {
    // Start
    Player.ins.move(new Vector2(0, 0)); //updates chunks and moves player
    new RenderManager();

    const a = new Smelter(new Vector2(1, 1), new Vector2(1, 1)); //nestretchuje se to :(
    a.SetTexture("SigmaMachine");
    const b = new Smelter(new Vector2(3, 2), new Vector2(1, 1)); //nestretchuje se to :(
    b.SetTexture("SigmaMachine");

    let run: boolean = true;
    while (run) {
        // Update loop
        let startTime = performance.now();

        InputManager.ins.UpdateInput();

        Player.ins.move(InputManager.ins.MovementVector); //updates chunks and moves player   

        RenderManager.ins.Draw(); // draws everything

        let endTime = performance.now()
        const executionTime = endTime - startTime;
        //TODO: deltatime
        if(executionTime > 16) console.log("Lag spike! wait time designated for:" ,(1/fps*1000) - executionTime);
        await new Promise(r => setTimeout(r, Math.max((1/fps*1000) - executionTime, 0)));
    }
}

Main();