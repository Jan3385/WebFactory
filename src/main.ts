/// <reference path="./Player/Player.ts" />
/// <reference path="./Player/InputManager.ts" />

const fps = 60;

async function Main() {
    // Start
    Player.ins.move(new Vector2(0, 0)); //updates chunks and moves player
    new RenderManager();

    let run: boolean = true;
    while (run) {
        // Update loop
        let startTime = performance.now();

        UpdateInput();

        Player.ins.move(MovementVector.multiply(3)); //updates chunks and moves player

        RenderManager.ins.Draw(); // draws everything

        let endTime = performance.now()
        const executionTime = endTime - startTime;
        if(executionTime > 16) console.log("Lag spike!" ,(1/fps*1000) - executionTime);
        await new Promise(r => setTimeout(r, Math.max((1/fps*1000) - executionTime, 0)));
    }
}

Main();