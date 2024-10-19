/// <reference path="./GroundData.ts" />

class Planet{
    public Chunks: Chunk[] = [];
    constructor() {
        
    }
    GetDataAt(x: number, y: number){
        const chunkPos = new Vector2(Math.floor(x/Chunk.ChunkSize), Math.floor(y/Chunk.ChunkSize));
        const chunk = this.Chunks.find(chunk => chunk.position.x == chunkPos.x && chunk.position.y == chunkPos.y);
        if(chunk){
            return chunk.data.find((data: GroundData) => data.position.x === x%Chunk.ChunkSize && data.position.y === y%Chunk.ChunkSize);
        }
        return null;
    }
}