const fps = 60;

async function Main() {

    let run: boolean = true;
    while (run) {
        console.log("ahoj!");
        await new Promise(r => setTimeout(r, 1/fps));
    }
}

Main();