"use strict";
class Renderer {
    static canvas = document.getElementById('GameCanvas');
    static ctx = Renderer.canvas.getContext('2d');
    static ins = new Renderer();
    constructor() {
        window.addEventListener('resize', this.OnWindowResize);
        this.OnWindowResize();
    }
    Draw() {
    }
    OnWindowResize() {
        Renderer.canvas.width = window.innerWidth;
        Renderer.canvas.height = window.innerHeight;
    }
}
const fps = 60;
async function Main() {
    let run = true;
    while (run) {
        console.log("ahoj!");
        await new Promise(r => setTimeout(r, 1 / fps));
    }
}
Main();
