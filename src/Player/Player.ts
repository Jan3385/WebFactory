/// <reference path="../Math/AABB.ts" />

class Camera{
    //Camera position in screen-position
    public position: Vector2;
    //Camera AABB in grid-space
    public AABB: AABB ;
    constructor(pos: Vector2) {
        //Camera position in screen-position
        this.position = pos;
        //Camera AABB in grid-space
        this.AABB = 
            new AABB(
                new Vector2( (this.position.x - window.innerWidth/2) / Chunk.PixelSize,
                    (this.position.y - window.innerHeight/2) / Chunk.PixelSize),
                new Vector2( window.innerWidth / Chunk.PixelSize,
                    window.innerHeight / Chunk.PixelSize),
            );
    }
    UpdateCamera(){
        this.position = Player.ins.position;
        this.AABB = 
            new AABB(
                new Vector2(
                    (this.position.x - window.innerWidth/2) / Chunk.PixelSize,
                    -(this.position.y - window.innerHeight/2) / Chunk.PixelSize),
                new Vector2( 
                        (window.outerWidth) / Chunk.PixelSize,
                        (window.outerHeight) / Chunk.PixelSize),
            );
        MapManager.ins.UpdateChunks();
    }
    GetCameraOffset(){
        return this.position.flipX().add(new Vector2(Math.floor(window.innerWidth/2), -Math.floor(window.innerHeight/2)));
    }
}

class Player{
    public static ins: Player = new Player();
    public position: Vector2 = new Vector2(2**16, -(2**16)); //2**16 default
    public Speed: number = 3;

    public camera: Camera = new Camera(this.position);

    constructor(){}
    move(dir: Vector2){
        this.position = this.position.add(dir.multiply(this.Speed));
        this.camera.UpdateCamera();
    }
    setPosition(pos: Vector2){
        this.position = pos;
        this.camera.UpdateCamera();
    }
    Draw(CameraOffset: Vector2){
        RenderManager.ctx.fillStyle = 'red';
        RenderManager.ctx.fillRect(this.position.x + CameraOffset.x, this.position.y - CameraOffset.y, Chunk.PixelSize, -Chunk.PixelSize);
    }
}