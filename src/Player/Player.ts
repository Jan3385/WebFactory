/// <reference path="../Math/AABB.ts" />

class Camera{
    //Camera position in screen-space-position
    public position: Vector2;
    //Camera AABB in grid-space
    public AABB: AABB ;
    constructor(pos: Vector2) {
        //Camera position in screen-position
        this.position = pos;
        //Camera AABB in grid-space
        this.AABB = new AABB(
                new Vector2(
                    (this.position.x - window.innerWidth/2) / Chunk.PixelSize,
                    (this.position.y - window.innerHeight/2) / Chunk.PixelSize),
                new Vector2( 
                    (window.outerWidth) / Chunk.PixelSize,
                    (window.outerHeight) / Chunk.PixelSize),
            );
    }
    //moves the camera and updates visible chunks
    UpdateCamera(){
        this.position = Player.ins.position
            .multiply(Chunk.PixelSize) //world position to screen position
            .add(new Vector2(Chunk.PixelSize/2, Chunk.PixelSize/2)); //keeps the player in the center of the screen

        this.AABB = new AABB(
                new Vector2(
                    (this.position.x - window.innerWidth/2) / Chunk.PixelSize,
                    (this.position.y - window.innerHeight/2) / Chunk.PixelSize),
                new Vector2( 
                    (window.outerWidth) / Chunk.PixelSize,
                    (window.outerHeight) / Chunk.PixelSize),
            );

        MapManager.ins.UpdateChunks();
    }
    GetCameraOffset(){
        return this.position.flip().add(
            new Vector2(
                Math.floor(window.innerWidth/2), 
                Math.floor(window.innerHeight/2)
            ));
    }
}

class Player{
    public static ins: Player = new Player();

    //player position in world position
    public position: Vector2 = new Vector2(0, -(0)); //2**16 default
    public Speed: number = 0.4;

    public camera: Camera = new Camera(this.position.multiply(Chunk.PixelSize));

    constructor(){}
    move(dir: Vector2){
        this.position = this.position.add(dir.multiply(this.Speed));
        this.camera.UpdateCamera();

        //update mouse indicator
        //InputManager.ins.UpdateMouseIndicator();
    }
    setPosition(pos: Vector2){
        this.position = pos;
        this.camera.UpdateCamera();
    }
    Draw(CameraOffset: Vector2){
        RenderManager.ctx.fillStyle = 'red';
        RenderManager.ctx.fillRect(this.position.x * Chunk.PixelSize + CameraOffset.x, this.position.y * Chunk.PixelSize + CameraOffset.y, Chunk.PixelSize, Chunk.PixelSize);
    }
}