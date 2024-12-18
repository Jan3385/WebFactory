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

    public Draw(){
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

        this.PreviousCameraOffset = Player.ins.camera.GetCameraOffset();

        //rener item on cursor
        if(Player.ins.HandInventory.items[0].item != null){
            const item = Player.ins.HandInventory.items[0];
            const ItemScale = GUIScale * 80;
            RenderManager.ctx.drawImage(
                item.item!.image, 
                InputManager.ins.mousePos.x - ItemScale/2, 
                InputManager.ins.mousePos.y - ItemScale/2,
                ItemScale, ItemScale
            );
            if(item.amount > 1){
                RenderManager.ctx.strokeStyle = "black";
                RenderManager.ctx.fillStyle = "white";

                RenderManager.ctx.textAlign = "right";
                RenderManager.ctx.font = "15px Tiny5";

                RenderManager.ctx.lineWidth = 5;

                //outline
                RenderManager.ctx.strokeText(item.amount.toString(),
                    InputManager.ins.mousePos.x + ItemScale/2, 
                    InputManager.ins.mousePos.y + ItemScale/2);

                //fill text
                RenderManager.ctx.fillText(item.amount.toString(),
                    InputManager.ins.mousePos.x + ItemScale/2, 
                    InputManager.ins.mousePos.y + ItemScale/2);
            }
        }
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
    public GetPlayerGUI(): GUI{
        return this.ActiveGUIs.find(gui => gui instanceof BottomClampInventoryGUI)!;
    }
}
class ChunkWorkerRenderPool{
    public static WorkerPoolSize: number = 6;
    public WorkerPool: Worker[] = [];
    public WorkerPoolWorking: boolean[] = [];

    public taskQueue: [GroundData[][], Chunk][] = [];

    constructor(){
        if(typeof(Worker) === "undefined") {
            console.log("No web worker support.. You will experience some issues, good luck :)");
            return;
        };
        for(let i = 0; i < ChunkWorkerRenderPool.WorkerPoolSize; i++){
            const worker = new Worker("/workers/ChunkDrawWorker.js");
            worker.onmessage = (e) => {
                this.handleWorkerResponse(e, i);
            }
            this.WorkerPool.push(worker);
            this.WorkerPoolWorking.push(false);
        }
    }
    handleWorkerResponse(e: MessageEvent<any>, WorkerIndex: number){
        this.WorkerPoolWorking[WorkerIndex] = false;

        const chunk = 
            MapManager.ins.cPlanet.Chunks.find(chunk => chunk.position.x == e.data.chunkPosition.x 
                && chunk.position.y == e.data.chunkPosition.y);

        if(chunk != undefined) chunk.DrawChunk(e.data.ImageBits);

        if(this.taskQueue.length > 0){
            const task = this.taskQueue.pop()!;
            this.asignTask(task[0], task[1]);
        }
    }
    addRenderTask(data: GroundData[][], chunk: Chunk){
        const worker = this.getAvalibleWorker();
        if(worker != null){
            this.WorkerPoolWorking[this.WorkerPool.indexOf(worker)] = true;
            worker.postMessage({
                MapData: data,
                chunkPosition: chunk.position
            });
        }else{
            this.taskQueue.push([data, chunk]);
        }
    }
    asignTask(data: GroundData[][], chunk: Chunk){
        const worker = this.getAvalibleWorker();
        if(worker != null){
            this.WorkerPoolWorking[this.WorkerPool.indexOf(worker)] = true;
            worker.postMessage({
                MapData: data,
                chunkPosition: chunk.position
            });
        }
    }

    getAvalibleWorker(): Worker | null{
        for(let i = 0; i < ChunkWorkerRenderPool.WorkerPoolSize; i++){
            if(!this.WorkerPoolWorking[i]){
                return this.WorkerPool[i];
            }
        }
        return null;
    }
}