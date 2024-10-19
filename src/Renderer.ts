/// <reference path="./Math/Math.ts" />
/// <reference path="./Map/MapManager.ts" />
/// <reference path="./Player/Player.ts" />

class RenderManager{
    private constructor() {
        window.addEventListener('resize', this.OnWindowResize);
        this.OnWindowResize();
        RenderManager.gCtx.scale(1, -1);
    }

    private static canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('GameCanvas')!;
    public static ctx: CanvasRenderingContext2D = RenderManager.canvas.getContext('2d', {alpha: false})!;
    private static GroundRenderCanvas: OffscreenCanvas = new OffscreenCanvas(RenderManager.canvas.width, RenderManager.canvas.height);
    public static gCtx: OffscreenCanvasRenderingContext2D = RenderManager.GroundRenderCanvas.getContext('2d', {alpha: false})!;
    public static ins: RenderManager = new RenderManager();

    private PreviousCameraOffset: Vector2 = Player.ins.camera.GetCameraOffset();

    public Draw(){
        RenderManager.ctx.fillStyle = "black";
        RenderManager.ctx.fillRect(0, 0, RenderManager.canvas.width, -RenderManager.canvas.height); //test how long this takes

        MapManager.ins.cPlanet.Chunks.forEach(chunk => {
            chunk.Draw(Player.ins.camera.GetCameraOffset(), this.PreviousCameraOffset); //long execution time !!
        });

        RenderManager.gCtx.fillStyle = "Blue";
        RenderManager.gCtx.fillRect(0, 0,30, 30);
        RenderManager.ctx.drawImage(RenderManager.GroundRenderCanvas, 0, 0);

        Player.ins.Draw(Player.ins.camera.GetCameraOffset());

        this.PreviousCameraOffset = Player.ins.camera.GetCameraOffset();
    }

    private OnWindowResize(){
        RenderManager.canvas.width = window.innerWidth;
        RenderManager.canvas.height = window.innerHeight;
        RenderManager.GroundRenderCanvas.width = window.innerWidth;
        RenderManager.GroundRenderCanvas.height = window.innerHeight;
    }
}