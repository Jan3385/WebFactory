/// <reference path="../Math/Math.ts" />
/// <reference path="./Generation/NoiseGenerator.ts" />
/// <reference path="./MapManager.ts" />

class Chunk{
    //size of a chunk - number of voxels in a chunk in X or Y
    public static ChunkSize: number = 32;
    //rendered size of individual voxel pixels
    public static PixelSize: number = 18; //lowering this makes the maximum world size smaller

    private static WorkerRenderPool: ChunkWorkerRenderPool;
    //private static WorkerGeneratePool: ChunkWorkerGeneratePool;


    //left top position in the grid-space
    position: Vector2;
    data: GroundData[][] = [];
    private chunkRender: OffscreenCanvas;
    private chunkRenderCtx: OffscreenCanvasRenderingContext2D;
    constructor(position: Vector2) {
        this.position = position;
        this.chunkRender = new OffscreenCanvas(Chunk.ChunkSize, Chunk.ChunkSize);
        this.chunkRenderCtx = this.chunkRender.getContext('2d', {alpha: false})!;

        if(Chunk.WorkerRenderPool == undefined){
            Chunk.WorkerRenderPool = new ChunkWorkerRenderPool();
        }
        //if(Chunk.WorkerGeneratePool == undefined){
        //    Chunk.WorkerGeneratePool = new ChunkWorkerGeneratePool();
        //}

        const defaultGroundData = new GroundData(new rgb(0, 0, 0));
        for(let y = 0; y < Chunk.ChunkSize; y++){
            this.data[y] = [];
            for(let x = 0; x < Chunk.ChunkSize; x++){
                this.data[y][x] = defaultGroundData;
            }
        }

        this.Load();
    }
    Load(){

        //1ms execution time on my pc
        for(let y = 0; y < Chunk.ChunkSize; y++){
            for(let x = 0; x < Chunk.ChunkSize; x++){
                this.data[y][x] = ValueNoise.valueNoise.GetGroundDataAt(x + this.position.x * Chunk.ChunkSize, y + this.position.y * Chunk.ChunkSize);
            }
        }

        //Chunk.WorkerGeneratePool.addGenerationTask(this);

        this.PreDrawChunk();
    }
    PreDrawChunk(){
        if(typeof(Worker) !== "undefined"){
            Chunk.WorkerRenderPool.addRenderTask(this.data, this);
        }
        else{ //No web worker support..
            for(let y = 0; y < Chunk.ChunkSize; y++){
                for(let x = 0; x < Chunk.ChunkSize; x++){
                    this.chunkRenderCtx.fillStyle = this.data[y][x].color.get();
                    this.chunkRenderCtx.fillRect(x, y, 1, 1);
                }
            }
        }
    }
    DrawChunk(BitMap: ImageBitmap){
        this.chunkRenderCtx.drawImage(BitMap, 0, 0);
    }
    GetChunkRender(): OffscreenCanvas{
        return this.chunkRender;
    }
    DrawChunkExtras(CameraOffset: Vector2){
        CameraOffset = CameraOffset.add(this.position.multiply(Chunk.ChunkSize*Chunk.PixelSize));
        //write chunk number on the chunk
        RenderManager.ctx.textAlign = "left";
        RenderManager.ctx.fillStyle = "white";
        RenderManager.ctx.font = "10px Arial";
        RenderManager.ctx.fillText(`(${this.position.x}, ${this.position.y})`, CameraOffset.x, CameraOffset.y+Chunk.ChunkSize*Chunk.PixelSize-5);

        //draw chunk border
        RenderManager.ctx.strokeStyle = "Blue";
        RenderManager.ctx.lineWidth = 1;
        RenderManager.ctx.strokeRect(CameraOffset.x+1, CameraOffset.y+1, this.GetAABB().width*Chunk.PixelSize - 1, this.GetAABB().height*Chunk.PixelSize - 1);
    }
    GetAABB(): AABB{
        //return new AABB(this.position.multiply(Chunk.ChunkSize), new Vector2(Chunk.ChunkSize, Chunk.ChunkSize));
        return new AABB(
            new Vector2(this.position.x * Chunk.ChunkSize, this.position.y * Chunk.ChunkSize),
            new Vector2(Chunk.ChunkSize, Chunk.ChunkSize)
        )
    }
}
class GroundData {
    color: rgb;

    constructor(color: rgb) {
        this.color = color;
    }
}
/* WIP needs a lot of work
class ChunkWorkerGeneratePool{
    public static WorkerPoolSize: number = 6;
    public WorkerPool: Worker[] = [];
    public WorkerPoolWorking: boolean[] = [];

    public taskQueue: Chunk[] = [];

    constructor(){
        if(typeof(Worker) === "undefined") {
            console.log("No web worker support.. You will experience some issues, good luck :)");
            return;
        };

        for(let i = 0; i < ChunkWorkerRenderPool.WorkerPoolSize; i++){
            const worker = new Worker("/workers/ChunkGenerateWorker.js");
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

        if(chunk != undefined) chunk.data = e.data.GroundData;

        if(this.taskQueue.length > 0){
            const task = this.taskQueue.pop()!;
            this.asignTask(task);
        }
    }
    addGenerationTask(chunk: Chunk){
        const worker = this.getAvalibleWorker();
        if(worker != null){
            this.WorkerPoolWorking[this.WorkerPool.indexOf(worker)] = true;
            worker.postMessage({
                chunkPosition: chunk.position,
                chunkSize: Chunk.ChunkSize
            });
        }else{
            this.taskQueue.push(chunk);
        }
    }
    asignTask(chunk: Chunk){
        const worker = this.getAvalibleWorker();
        if(worker != null){
            this.WorkerPoolWorking[this.WorkerPool.indexOf(worker)] = true;
            worker.postMessage({
                chunkPosition: chunk.position,
                chunkSize: Chunk.ChunkSize,
                ValueNoiseGenerator: ValueNoise.valueNoise,
                PerlinNoiseGenerator: PerlinNoise.perlin,
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
} */