/// <reference path="./Math/Math.ts" />
/// <reference path="./Map/MapManager.ts" />
/// <reference path="./Player/Player.ts" />

class RenderManager{
    private constructor() {
        window.addEventListener('resize', this.OnWindowResize);
        this.OnWindowResize();
        RenderManager.ctx.scale(1, -1);
    }

    public static canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('GameCanvas')!;
    public static ctx: CanvasRenderingContext2D = RenderManager.canvas.getContext('2d', {alpha: false})!;
    public static ins: RenderManager = new RenderManager();

    public Draw(){
        RenderManager.ctx.fillStyle = "black";
        RenderManager.ctx.fillRect(0, 0, RenderManager.canvas.width, -RenderManager.canvas.height); //test how long this takes

        MapManager.ins.cPlanet.Chunks.forEach(chunk => {
            chunk.Draw(Player.ins.camera.GetCameraOffset()); //long execution time !!
        });

        Player.ins.Draw(Player.ins.camera.GetCameraOffset());
    }

    private OnWindowResize(){
        RenderManager.canvas.width = window.innerWidth;
        RenderManager.canvas.height = window.innerHeight;
    }
}