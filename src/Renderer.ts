/// <reference path="./Math/Math.ts" />
/// <reference path="./Map/MapManager.ts" />
/// <reference path="./Player/Player.ts" />
/// <reference path="./Player/GUI.ts" />

class RenderManager{
    private static canvas: HTMLCanvasElement;
    public static ctx: CanvasRenderingContext2D;
    public static ins: RenderManager;

    private ActiveGUIs: GUI[] = [];

    public constructor() {
        RenderManager.canvas = <HTMLCanvasElement>document.getElementById('GameCanvas')!;
        RenderManager.ctx = RenderManager.canvas.getContext('2d', {alpha: false})!;
        RenderManager.ins = this;

        window.addEventListener('resize', this.OnWindowResize);
        this.OnWindowResize();

        //TODO: temp
        //const gui = new GUI(200, 200);
    }

    private PreviousCameraOffset: Vector2 = Player.ins.camera.GetCameraOffset();
    private PreviousCameraAABB: AABB = Player.ins.camera.AABB.copy();

    public Draw(){
        const FrameOffset = Player.ins.camera.GetCameraOffset().subtract(this.PreviousCameraOffset);

        const cameraOffset = Player.ins.camera.GetCameraOffset();

        //draw chunks
        MapManager.ins.cPlanet.Chunks.forEach(chunk => {
            const chunkRender = chunk.GetChunkRender();
            RenderManager.ctx.drawImage(
                chunkRender, 
                chunk.position.x*Chunk.ChunkSize*Chunk.PixelSize + cameraOffset.x, 
                chunk.position.y*Chunk.ChunkSize*Chunk.PixelSize + cameraOffset.y,
                Chunk.ChunkSize*Chunk.PixelSize, Chunk.ChunkSize*Chunk.PixelSize);
            chunk.DrawChunkExtras(cameraOffset);
        });

        //draw entities
        MapManager.ins.entities.forEach(entity => entity.Draw(cameraOffset));

        Player.ins.Draw(Player.ins.camera.GetCameraOffset());

        //render mouse indicator
        const IndicatorImg = new Image(Chunk.PixelSize, Chunk.PixelSize);
        IndicatorImg.src = "images/indicators/MouseIndicator.png";
        RenderManager.ctx.drawImage(
            IndicatorImg, 
            InputManager.ins.mouseIndicatorPos.x * Chunk.PixelSize + Player.ins.camera.GetCameraOffset().x, 
            InputManager.ins.mouseIndicatorPos.y * Chunk.PixelSize + Player.ins.camera.GetCameraOffset().y,
            Chunk.PixelSize, Chunk.PixelSize);

        //render GUI
        this.ActiveGUIs.forEach(gui => gui.Draw(1)); //TODO: scale

        this.PreviousCameraAABB = Player.ins.camera.AABB.copy();
        this.PreviousCameraOffset = Player.ins.camera.GetCameraOffset();
    }

    private OnWindowResize(){
        RenderManager.canvas.width = window.innerWidth;
        RenderManager.canvas.height = window.innerHeight;
        RenderManager.ins.Draw();
        RenderManager.ctx.imageSmoothingEnabled = false;
    }

    public AddGUI(gui: GUI){
        this.ActiveGUIs.push(gui);
    }
    public RemoveGUI(gui: GUI){
        const index = this.ActiveGUIs.indexOf(gui);
        if(index > -1) this.ActiveGUIs.splice(index, 1);
    }
    public CloseAllGUIs(){
        this.ActiveGUIs.forEach(gui => gui.Close());
    }
}