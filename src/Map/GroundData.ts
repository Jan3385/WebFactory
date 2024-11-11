/// <reference path="../Math/Math.ts" />
/// <reference path="./Generation/NoiseGenerator.ts" />
/// <reference path="./MapManager.ts" />

class Chunk{
    //size of a chunk - number of voxels in a chunk in X or Y
    public static ChunkSize: number = 32;
    //rendered size of individual voxel pixels
    public static PixelSize: number = 18; //lowering this makes the maximum world size smaller

    //left top position in the grid-space
    position: Vector2;
    data: GroundData[][] = [];
    private chunkRender: OffscreenCanvas;
    private chunkRenderCtx: OffscreenCanvasRenderingContext2D;
    constructor(position: Vector2) {
        this.position = position;
        this.chunkRender = new OffscreenCanvas(Chunk.ChunkSize, Chunk.ChunkSize);
        this.chunkRenderCtx = this.chunkRender.getContext('2d', {alpha: false})!

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
        for(let y = 0; y < Chunk.ChunkSize; y++){
            for(let x = 0; x < Chunk.ChunkSize; x++){
                this.data[y][x] = ValueNoise.valueNoise.GetGroundDataAt(x + this.position.x * Chunk.ChunkSize, y + this.position.y * Chunk.ChunkSize);
            }
        }
        this.PreDrawChunk();
    }
    PreDrawChunk(){
        if(typeof(Worker) !== "undefined"){
            const worker = new Worker('src/workers/ChunkDrawWorker.js');
            worker.postMessage({
                MapData: this.data,
            });
            worker.onmessage = (e) => {
                //returns offscreen canvas
                this.chunkRender = e.data;
            }
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