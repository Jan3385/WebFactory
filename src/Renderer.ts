/// <reference path="./Math/Math.ts" />
/// <reference path="./Map/MapManager.ts" />
/// <reference path="./Player/Player.ts" />
/// <reference path="./Player/GUI.ts" />

class RenderManager{
    private static canvas: HTMLCanvasElement;
    public static ctx: CanvasRenderingContext2D;
    public static ins: RenderManager;

    public ActiveGUIs: GUI[] = [];

    public constructor() {
        RenderManager.canvas = <HTMLCanvasElement>document.getElementById('GameCanvas')!;
        RenderManager.ctx = RenderManager.canvas.getContext('2d', {alpha: false})!;
        RenderManager.ins = this;

        window.addEventListener('resize', this.OnWindowResize);
        this.OnWindowResize();

        this.IndicatorImg.src = "images/indicators/MouseIndicator.png";
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

        this.RenderMouseIndicator(InputManager.ins.mousePos);

        //render GUI
        const GUIScale = GUI.GetGUIScale();
        this.ActiveGUIs.forEach(gui => gui.Draw(GUIScale));

        this.PreviousCameraAABB = Player.ins.camera.AABB.copy();
        this.PreviousCameraOffset = Player.ins.camera.GetCameraOffset();
    }

    private OnWindowResize(){
        RenderManager.canvas.width = window.innerWidth;
        RenderManager.canvas.height = window.innerHeight;
        RenderManager.ins.Draw();
        RenderManager.ctx.imageSmoothingEnabled = false;
    }

    IndicatorImg = new Image(Chunk.PixelSize, Chunk.PixelSize);
    public RenderMouseIndicator(pos: Vector2){
        const camOffset = Player.ins.camera.GetCameraOffset();

        const worldPos: Vector2 = pos.subtract(camOffset).divide(Chunk.PixelSize);

        const EntityMouseIndex = Entity.IsInsideEntity(worldPos);
        if(EntityMouseIndex != -1){
            const entity = MapManager.ins.entities[EntityMouseIndex];
            this.DrawIndicator(
                new AABB(
                    new Vector2(
                        entity.position.x * Chunk.PixelSize + camOffset.x, 
                        entity.position.y * Chunk.PixelSize + camOffset.y),
                    new Vector2(
                        entity.AABB.width * Chunk.PixelSize, 
                        entity.AABB.height * Chunk.PixelSize)
                )
            );
            return;
        }else{
            const voxelPos: Vector2 = pos.subtract(camOffset).divideAndFloor(Chunk.PixelSize);
            this.DrawIndicator(
                new AABB(
                    new Vector2(
                        voxelPos.x * Chunk.PixelSize + camOffset.x, 
                        voxelPos.y * Chunk.PixelSize + camOffset.y),
                    new Vector2(Chunk.PixelSize, Chunk.PixelSize)
                )
            );
        }
        
    }
    private DrawIndicator(at: AABB){
        RenderManager.ctx.drawImage(
            this.IndicatorImg, 
            at.x, at.y,
            at.width, at.height);
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