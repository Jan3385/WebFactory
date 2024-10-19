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
        
        let startTime = performance.now()
        for(let y = 0; y < Chunk.ChunkSize; y++){
            for(let x = 0; x < Chunk.ChunkSize; x++){
                //if(x == 0) this.data.push(new GroundData(new Vector2(x, y), new rgb(255, 255, 255)));
                //else this.data.push(PerlinNoise.perlin.GetGroundDataAt(x + this.position.x * Chunk.ChunkSize, y + this.position.y * Chunk.ChunkSize));
                this.data.push(ValueNoise.valueNoise.GetGroundDataAt(x + this.position.x * Chunk.ChunkSize, y + this.position.y * Chunk.ChunkSize));
            }
        }
        let endTime = performance.now()

        //console.log(`${endTime - startTime} milliseconds`)
    }
    ;Draw(CameraOffset: Vector2, PreviousCameraOffset: Vector2){
        CameraOffset = CameraOffset.add(this.position.multiply(Chunk.ChunkSize*Chunk.PixelSize));
        
        this.data.forEach(data => {
            RenderManager.gCtx.fillStyle = data.color.get();
            RenderManager.gCtx.fillRect(
                Math.floor(data.position.x * Chunk.PixelSize + CameraOffset.x), 
                Math.floor(data.position.y * Chunk.PixelSize + CameraOffset.y + Chunk.PixelSize), Chunk.PixelSize, -Chunk.PixelSize); //idk why there needs to be that +Chunk.PixelSize but it is off without it
        });
        
        //write chunk number on the chunk
        RenderManager.gCtx.fillStyle = "white";
        RenderManager.gCtx.font = "10px Arial";
        RenderManager.gCtx.fillText(`(${this.position.x}, ${this.position.y})`, CameraOffset.x, CameraOffset.y+Chunk.ChunkSize*Chunk.PixelSize-5);

        //box at the 0,0 of the chunk
        RenderManager.gCtx.fillStyle = "red";
        RenderManager.gCtx.fillRect(CameraOffset.x, CameraOffset.y, 5, 5);


        //draw chunk border
        RenderManager.gCtx.strokeStyle = "Blue";
        RenderManager.gCtx.lineWidth = 3;
        RenderManager.gCtx.strokeRect(CameraOffset.x, CameraOffset.y, Chunk.ChunkSize*Chunk.PixelSize, Chunk.ChunkSize*Chunk.PixelSize);
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