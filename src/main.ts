/// <reference path="./Player/Player.ts" />
/// <reference path="./Player/InputManager.ts" />

const fps = 60; //can run stable at only 20fps :(

async function Main() {
    // Start


    let run: boolean = true;
    while (run) {
        let startTime = performance.now()

        // Update loop
        UpdateInput();
        TimeExec(0);
        Player.ins.move(MovementVector.multiply(3)); //updates chunks and moves player
        TimeExec(0);

        TimeExec(1);
        RenderManager.ins.Draw(); //long execution time !! 20-30ms
        TimeExec(1);

        let endTime = performance.now()
        const executionTime = endTime - startTime;
        console.log(executionTime, (1/fps*1000) - executionTime);
        await new Promise(r => setTimeout(r, Math.max((1/fps*1000) - executionTime, 0)));
    }
}

Main();