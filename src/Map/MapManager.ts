/// <reference path="./Planet.ts" />
/// <reference path="./Generation/NoiseGenerator.ts" />

class MapManager {
    //current planet
    public cPlanet: Planet;
    public static ins: MapManager = new MapManager();

    private constructor() {
        this.cPlanet = new Planet();
    }
    //Deletes / generates new chunks when needed
    UpdateChunks(){
        this.cPlanet.Chunks.forEach(chunk => {
            if(!Player.ins.camera.AABB.isColliding(chunk.GetAABB())){
                this.cPlanet.Chunks.splice(this.cPlanet.Chunks.indexOf(chunk), 1);
            }
        });

        let newChunks: Chunk[] = [];
        for(let x = Math.floor(Player.ins.camera.AABB.x/Chunk.ChunkSize); x <= Math.floor((Player.ins.camera.AABB.x + Player.ins.camera.AABB.width)/Chunk.ChunkSize); x+= 1){
            for(let y = Math.floor(Player.ins.camera.AABB.y/Chunk.ChunkSize); y <= Math.floor((Player.ins.camera.AABB.y + Player.ins.camera.AABB.height)/Chunk.ChunkSize); y+= 1){
                const chunkPos = new Vector2(x, y);
                if(!this.cPlanet.Chunks.some(chunk => chunk.position.x == chunkPos.x && chunk.position.y == chunkPos.y)){
                    newChunks.push(new Chunk(chunkPos));
                }
            }
        }
        this.cPlanet.Chunks = this.cPlanet.Chunks.concat(newChunks);

    }
}