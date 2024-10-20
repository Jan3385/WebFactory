/// <reference path="./Math/Math.ts" />
/// <reference path="./Map/MapManager.ts" />
/// <reference path="./Player/Player.ts" />

class RenderManager{
    private static canvas: HTMLCanvasElement;
    public static ctx: CanvasRenderingContext2D;
    public static ins: RenderManager;

    public constructor() {
        RenderManager.canvas = <HTMLCanvasElement>document.getElementById('GameCanvas')!;
        RenderManager.ctx = RenderManager.canvas.getContext('2d', {alpha: false})!;
        RenderManager.ins = this;

        window.addEventListener('resize', this.OnWindowResize);
        this.OnWindowResize();
    }

    private PreviousCameraOffset: Vector2 = Player.ins.camera.GetCameraOffset();
    private PreviousCameraAABB: AABB = Player.ins.camera.AABB.copy();

    public Draw(){
        const FrameOffset = Player.ins.camera.GetCameraOffset().subtract(this.PreviousCameraOffset);

        const cameraOffset = Player.ins.camera.GetCameraOffset();
        MapManager.ins.cPlanet.Chunks.forEach(chunk => {
            const chunkRender = chunk.GetChunkRender();
            RenderManager.ctx.drawImage(
                chunkRender, 
                chunk.position.x*Chunk.ChunkSize*Chunk.PixelSize + cameraOffset.x, 
                chunk.position.y*Chunk.ChunkSize*Chunk.PixelSize + cameraOffset.y);
            chunk.DrawChunkExtras(cameraOffset);
        });

        Player.ins.Draw(Player.ins.camera.GetCameraOffset());

        this.PreviousCameraAABB = Player.ins.camera.AABB.copy();
        this.PreviousCameraOffset = Player.ins.camera.GetCameraOffset();

        //draw camera AABB
        RenderManager.ctx.strokeStyle = "white";
        RenderManager.ctx.lineWidth = 10;
        RenderManager.ctx.strokeRect(Player.ins.camera.AABB.x*Chunk.PixelSize*Chunk.ChunkSize, Player.ins.camera.AABB.y*Chunk.PixelSize*Chunk.ChunkSize, Player.ins.camera.AABB.width*Chunk.PixelSize, -Player.ins.camera.AABB.height*Chunk.PixelSize);
    }

    private OnWindowResize(){
        RenderManager.canvas.width = window.innerWidth;
        RenderManager.canvas.height = window.innerHeight;
        //this.DrawEntireWindow();
        this.Draw();
    }
}