/// <reference path="../Math/Math.ts" />
/// <reference path="./Generation/NoiseGenerator.ts" />
/// <reference path="./MapManager.ts" />

class Chunk{
    //size of a chunk - number of voxels in a chunk in X or Y
    public static ChunkSize: number = 32;
    //rendered size of individual voxel pixels
    public static PixelSize: number = 14;

    //left top position in the grid-space
    position: Vector2;
    data: GroundData[] = [];
    constructor(position: Vector2) {
        this.position = position;
        this.Load();
    }
    Load(){
        for(let y = 0; y < Chunk.ChunkSize; y++){
            for(let x = 0; x < Chunk.ChunkSize; x++){
                //if(x == 0) this.data.push(new GroundData(new Vector2(x, y), new rgb(255, 255, 255)));
                //else this.data.push(PerlinNoise.perlin.GetGroundDataAt(x + this.position.x * Chunk.ChunkSize, y + this.position.y * Chunk.ChunkSize));
                this.data.push(PerlinNoise.perlin.GetGroundDataAt(x + this.position.x * Chunk.ChunkSize, y + this.position.y * Chunk.ChunkSize));
            }
        }
    }
    Draw(CameraOffset: Vector2){
        CameraOffset = CameraOffset.add(this.position.multiply(Chunk.ChunkSize*Chunk.PixelSize));
        this.data.forEach(data => {
            RenderManager.ctx.fillStyle = data.color.get();
            RenderManager.ctx.fillRect(data.position.x * Chunk.PixelSize + CameraOffset.x, 
                data.position.y * Chunk.PixelSize + CameraOffset.y, Chunk.PixelSize, -Chunk.PixelSize);
        });
        //write chunk number on the chunk
        RenderManager.ctx.save();
        RenderManager.ctx.scale(1, -1);
        RenderManager.ctx.fillStyle = "white";
        RenderManager.ctx.font = "10px Arial";
        RenderManager.ctx.fillText(`(${this.position.x}, ${this.position.y})`, CameraOffset.x, -CameraOffset.y);
        RenderManager.ctx.restore();
    }
    GetAABB(){
        return new AABB(this.position.multiply(Chunk.ChunkSize), new Vector2(Chunk.ChunkSize, Chunk.ChunkSize));
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