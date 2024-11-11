/// <reference path="../Math/AABB.ts" />
/// <reference path="../Player/Inventory.ts" />

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
                    (this.position.x - window.outerWidth/2) / Chunk.PixelSize,
                    (this.position.y - window.outerHeight/2) / Chunk.PixelSize),
                new Vector2( 
                    (window.innerWidth) / Chunk.PixelSize,
                    (window.innerWidth) / Chunk.PixelSize),
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
                    (window.innerWidth) / Chunk.PixelSize,
                    (window.innerHeight) / Chunk.PixelSize),
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

    public HandInventory: Inventory = new Inventory(1);
    public PlayerInventory: Inventory = new Inventory(12);

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

    public GetPlayerGUI(): GUI{
        //change how slots are added
        const gui = new BottomClampGUI(window.innerWidth, window.innerHeight)
            .AddSimple(new AABB(new Vector2(0,-100), new Vector2(window.innerWidth, 100)), new rgba(99, 110, 114, 0.5))
            .AddSlot(new AABB(new Vector2(10, -90), new Vector2(80, 80)), this.PlayerInventory.items[0])
            .AddSlot(new AABB(new Vector2(100, -90), new Vector2(80, 80)), this.PlayerInventory.items[1])
            .AddSlot(new AABB(new Vector2(190, -90), new Vector2(80, 80)), this.PlayerInventory.items[2])
            .AddSlot(new AABB(new Vector2(280, -90), new Vector2(80, 80)), this.PlayerInventory.items[3])
            .AddSlot(new AABB(new Vector2(370, -90), new Vector2(80, 80)), this.PlayerInventory.items[4])
            .AddSlot(new AABB(new Vector2(460, -90), new Vector2(80, 80)), this.PlayerInventory.items[5])
            .AddSlot(new AABB(new Vector2(550, -90), new Vector2(80, 80)), this.PlayerInventory.items[6])
            .AddSlot(new AABB(new Vector2(640, -90), new Vector2(80, 80)), this.PlayerInventory.items[7])
            .AddSlot(new AABB(new Vector2(730, -90), new Vector2(80, 80)), this.PlayerInventory.items[8])
            .AddSlot(new AABB(new Vector2(820, -90), new Vector2(80, 80)), this.PlayerInventory.items[9])
            .AddSlot(new AABB(new Vector2(910, -90), new Vector2(80, 80)), this.PlayerInventory.items[10])
            .AddSlot(new AABB(new Vector2(1000, -90), new Vector2(80, 80)), this.PlayerInventory.items[11])
        return gui;
    }
}