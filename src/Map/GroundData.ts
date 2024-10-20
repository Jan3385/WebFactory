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
    data: GroundData[] = [];
    private chunkRender: OffscreenCanvas;
    private chunkRenderCtx: OffscreenCanvasRenderingContext2D;
    constructor(position: Vector2) {
        this.position = position;
        this.chunkRender = new OffscreenCanvas(Chunk.ChunkSize*Chunk.PixelSize, Chunk.ChunkSize*Chunk.PixelSize);
        this.chunkRenderCtx = this.chunkRender.getContext('2d', {alpha: false})!
        this.Load();
    }
    Load(){
        for(let y = 0; y < Chunk.ChunkSize; y++){
            for(let x = 0; x < Chunk.ChunkSize; x++){
                this.data.push(ValueNoise.valueNoise.GetGroundDataAt(x + this.position.x * Chunk.ChunkSize, y + this.position.y * Chunk.ChunkSize));
            }
        }
        this.PreDrawChunk();
    }
    PreDrawChunk(){
        this.data.forEach(data => {
            this.chunkRenderCtx.fillStyle = data.color.get();
            this.chunkRenderCtx.fillRect(
                Math.floor(data.position.x * Chunk.PixelSize), 
                Math.floor(data.position.y * Chunk.PixelSize), Chunk.PixelSize, Chunk.PixelSize);
        });
    }
    GetChunkRender(): OffscreenCanvas{
        return this.chunkRender;
    }
    DrawChunkExtras(CameraOffset: Vector2){
        CameraOffset = CameraOffset.add(this.position.multiply(Chunk.ChunkSize*Chunk.PixelSize));
        //write chunk number on the chunk
        RenderManager.ctx.fillStyle = "white";
        RenderManager.ctx.font = "10px Arial";
        RenderManager.ctx.fillText(`(${this.position.x}, ${this.position.y})`, CameraOffset.x, CameraOffset.y+Chunk.ChunkSize*Chunk.PixelSize-5);

        //box at the 0,0 of the chunk
        RenderManager.ctx.fillStyle = "red";
        RenderManager.ctx.fillRect(CameraOffset.x, CameraOffset.y, 5, 5);


        //draw chunk border
        if(this.position.x != 2 || this.position.y != 1) return;
        RenderManager.ctx.strokeStyle = "Blue";
        RenderManager.ctx.lineWidth = 5;
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
    position: Vector2;
    color: rgb;

    constructor(position: Vector2, color: rgb) {
        this.position = position;
        this.color = color;
    }
    GetAABB(){
        return new AABB(this.position, new Vector2(1, 1));
    }
}