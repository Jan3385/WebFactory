/// <reference path="./Player/Player.ts" />
/// <reference path="./Player/InputManager.ts" />

const fps = 60;

async function Main() {
    // Start


    let run: boolean = true;
    while (run) {
        // Update loop
        UpdateInput();
        Player.ins.move(MovementVector.multiply(3));
        RenderManager.ins.Draw();
        await new Promise(r => setTimeout(r, 1/fps));
    }
}

Main();