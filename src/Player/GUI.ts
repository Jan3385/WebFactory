class GUI{
    public elements: GUIElement[];
    public interactiveElements: GUIElement[];
    public AABB: AABB;
    constructor(width: number, height: number){
        this.elements = [];
        this.interactiveElements = [];
        this.AABB = new AABB(new Vector2(0, 0), new Vector2(width, height));

        RenderManager.ins.AddGUI(this);
    }
    MoveToMiddleOfScreen(){
        this.AABB.x = 1920/2 - this.AABB.width/2;
        this.AABB.y = 1080/2 - this.AABB.height/2;
    }
    Draw(scale: number){
        this.elements.forEach(guiElement => guiElement.Draw(scale, new Vector2(this.AABB.x*scale, this.AABB.y*scale)));
    }
    Close(){
        RenderManager.ins.RemoveGUI(this);
    }
    AddSimple(AABB: AABB, color: rgba): GUI{
        this.AddElement(new GUISimple(AABB, color));
        return this;
    }
    AddElement(element: GUIElement){
        element.parent = this;
        this.elements.push(element);
    }
    AddInteractiveElement(element: GUIElement){
        this.AddElement(element);
        this.interactiveElements.push(element);
    }
    AddText(AABB: AABB, text: string, textSize: number, textAlign: CanvasTextAlign = "left"): GUI{
        const element = new GUIText(AABB, text, textSize, textAlign);
        this.AddElement(element);
        return this;
    }
    AddImage(AABB: AABB, img: HTMLImageElement): GUI{
        const element = new GUIImage(AABB, img);
        this.AddElement(element);
        return this;
    }
    AddButton(AABB: AABB, text: string, onClick: Function): GUI{
        const button = new GUIButton(AABB, text, onClick);
        this.AddInteractiveElement(button);
        return this;
    }
    AddImageButton(AABB: AABB, img: HTMLImageElement, onClick: Function): GUI{
        const button = new GUIImageButton(AABB, img, onClick);
        this.AddInteractiveElement(button);
        return this;
    }
    AddSlot(AABB: AABB, Item: InventoryItem): GUI{
        const slot = new GUISlot(AABB, Item);
        this.AddInteractiveElement(slot);
        return this;
    }
    AddTopBar(Header: string){
        this.AddSimple(new AABB(new Vector2(0, -30), new Vector2(this.AABB.width, 25)), new rgba(255, 255, 255, 0.5));
        this.AddText(new AABB(new Vector2(10, -10), new Vector2(100, 20)), Header, 20);
        const closeButtonImage = new Image();
        closeButtonImage.src = "Images/GUI/x.png";
        this.AddImageButton(new AABB(new Vector2(this.AABB.width-25, -27.5), new Vector2(20, 20)), closeButtonImage, () => this.Close());
        return this;
    }
    public static GetGUIScale(): number{
        return Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    }
    public static ForClickedGUIs(mousePos: Vector2, callback: (element: GUIInteractable | GUISlot) => void){
        RenderManager.ins.ActiveGUIs.forEach(gui => {
            const GUIScale = gui instanceof BottomClampGUI? 1 : GUI.GetGUIScale();
            
            gui.interactiveElements.every(element => {
                if(element.GetOnScreenAABB(GUIScale).isDotInside(mousePos.x, mousePos.y)) {
                    if(element instanceof GUISlot){
                        callback(element);

                        //once handeled a collision, exit
                        return false;
                    }
                    else if(IsInteractable(element)) {
                        callback(element);

                        //once handeled a collision, exit
                        return false;
                    }
                }
                return true;
            });
        });
    }
}
class BuildingGUI extends GUI{
    public BackgroundImage: HTMLImageElement;
    constructor(width: number, height: number){
        super(width, height);

        this.BackgroundImage = new Image();
        this.SetBackground("Default");

        this.MoveToMiddleOfScreen();
    }
    override Draw(scale: number){
        //draw background
        this.DrawBackground9Slice(scale, 16);

        this.elements.forEach(guiElement => guiElement.Draw(scale, new Vector2(this.AABB.x*scale, this.AABB.y*scale)));
    }
    private DrawBackgroundStretch(scale: number){
        RenderManager.ctx.drawImage(this.BackgroundImage, this.AABB.x*scale, this.AABB.y*scale, this.AABB.width*scale, this.AABB.height*scale);
    }
    private DrawBackground9Slice(scale: number, border: number, pixelScale: number = 4) {
        const x = this.AABB.x * scale;
        const y = this.AABB.y * scale;
        const width = this.AABB.width * scale / pixelScale;
        const height = this.AABB.height * scale / pixelScale;
      
        // Original dimensions of the image
        const imgWidth = this.BackgroundImage.width;
        const imgHeight = this.BackgroundImage.height;
      
        // Coordinates for the corners and sides of the image in the source
        const left = border;
        const right = imgWidth - border;
        const top = border;
        const bottom = imgHeight - border;
      
        // Scaled coordinates for the destination drawing area on the canvas
        const destLeft = x;
        const destRight = x + (width - border) * pixelScale;
        const destTop = y;
        const destBottom = y + (height - border) * pixelScale;
        const scaledBorder = border * pixelScale;
      
        RenderManager.ctx.drawImage(this.BackgroundImage, 0, 0, left, top, destLeft, destTop, scaledBorder, scaledBorder);
        RenderManager.ctx.drawImage(this.BackgroundImage, right, 0, border, top, destRight, destTop, scaledBorder, scaledBorder);
        RenderManager.ctx.drawImage(this.BackgroundImage, 0, bottom, left, border, destLeft, destBottom, scaledBorder, scaledBorder);
        RenderManager.ctx.drawImage(this.BackgroundImage, right, bottom, border, border, destRight, destBottom, scaledBorder, scaledBorder);
      
        RenderManager.ctx.drawImage(this.BackgroundImage, left, 0, right - left, top, destLeft + scaledBorder, destTop, (width - 2 * border) * pixelScale, scaledBorder);
        RenderManager.ctx.drawImage(this.BackgroundImage, left, bottom, right - left, border, destLeft + scaledBorder, destBottom, (width - 2 * border) * pixelScale, scaledBorder);
        RenderManager.ctx.drawImage(this.BackgroundImage, 0, top, left, bottom - top, destLeft, destTop + scaledBorder, scaledBorder, (height - 2 * border) * pixelScale);
        RenderManager.ctx.drawImage(this.BackgroundImage, right, top, border, bottom - top, destRight, destTop + scaledBorder, scaledBorder, (height - 2 * border) * pixelScale);
      
        //center
        RenderManager.ctx.drawImage(this.BackgroundImage, left, top, right - left, bottom - top, destLeft + scaledBorder, destTop + scaledBorder, (width - 2 * border) * pixelScale, (height - 2 * border) * pixelScale);
    }
    SetBackground(backgroundName: string): GUI{
        this.BackgroundImage = new Image();
        this.BackgroundImage.src = `Images/GUI/Backgrounds/${backgroundName}.png`;
        return this;
    }
}
class BottomClampGUI extends GUI{
    constructor(width: number, height: number){
        super(width, height);
        this.MoveToBottomOfScreen();   
    }
    MoveToBottomOfScreen(){
        this.AABB.y = window.innerHeight;
        this.AABB.height = window.innerHeight;
        this.AABB.width = window.innerWidth;

        this.elements.forEach(element => {
            //assume that every element with a width at least half of curret width is supposted to fill the screen
            if(element.AABB.width > window.innerWidth*0.5){
                element.AABB.width = window.innerWidth;
            }
        });
    }
    override Draw(scale: number){
        this.MoveToBottomOfScreen();
        super.Draw(1);
    }
}
abstract class GUIElement{
    public AABB: AABB = new AABB(new Vector2(0, 0), new Vector2(1, 1));
    public parent: GUI | null = null;
    abstract Draw(scale: number, offset: Vector2): void;
    GetOnScreenAABB(scale: number): AABB{
        return new AABB(
            new Vector2(this.AABB.x * scale + this.parent!.AABB.x * scale, this.AABB.y * scale + this.parent!.AABB.y * scale),
            new Vector2(this.AABB.width * scale, this.AABB.height * scale)
        )
    }
}
class GUISimple extends GUIElement{
    public color: rgba;
    constructor(AABB: AABB, color: rgba){
        super();
        this.AABB = AABB;
        this.color = color;
    }
    Draw(scale: number, offset: Vector2){
        RenderManager.ctx.fillStyle = this.color.get();
        RenderManager.ctx.fillRect(this.AABB.x*scale+offset.x, this.AABB.y*scale+offset.y, this.AABB.width*scale, this.AABB.height*scale);
    }
}
class GUIText extends GUIElement{
    public text: string;
    public textSize: number;
    public textAlign: CanvasTextAlign;
    constructor(AABB: AABB, text: string, textSize: number = 20, textAlign: CanvasTextAlign = "left"){
        super();
        this.AABB = AABB;
        this.text = text;
        this.textSize = textSize;
        this.textAlign = textAlign;
    }
    Draw(scale: number, offset: Vector2){
        RenderManager.ctx.fillStyle = "white";
        RenderManager.ctx.textAlign = this.textAlign;
        RenderManager.ctx.font = `${this.textSize*scale}px Tiny5`;
        RenderManager.ctx.fillText(this.text, this.AABB.x*scale+offset.x, this.AABB.y*scale+offset.y);
    }
}
class GUIImage extends GUIElement{
    public img: HTMLImageElement;
    constructor(AABB: AABB, img: HTMLImageElement){
        super();
        this.AABB = AABB;
        this.img = img;
    }
    Draw(scale: number, offset: Vector2){
        RenderManager.ctx.drawImage(this.img, this.AABB.x*scale, this.AABB.y*scale, this.AABB.width*scale, this.AABB.height*scale);
    }
}
interface IInteract{
    OnClick(): void;
}
function IsInteractable(element: GUIElement): element is GUIInteractable{
    return (element as GUIInteractable).OnClick !== undefined;
}
abstract class GUIInteractable extends GUIElement implements IInteract{
    public onClick: Function;
    constructor(AABB: AABB, onClick: Function){
        super();
        this.AABB = AABB;
        this.onClick = onClick;
    }
    OnClick(){
        this.onClick();
    }
}
class GUIButton extends GUIInteractable{
    public text: string;
    constructor(AABB: AABB, text: string, onClick: Function){
        super(AABB, onClick);
        this.text = text;
    }
    Draw(scale: number, offset: Vector2): void{
        RenderManager.ctx.fillStyle = "white";
        RenderManager.ctx.fillRect(this.AABB.x*scale+offset.x, this.AABB.y*scale+offset.y, this.AABB.width*scale, this.AABB.height*scale);
        RenderManager.ctx.save();
        RenderManager.ctx.textAlign = "center";
        RenderManager.ctx.fillStyle = "black";
        RenderManager.ctx.font = "20px Tiny5";
        RenderManager.ctx.fillText(this.text, this.AABB.x*scale+offset.x + this.AABB.width/2 + 1, this.AABB.y*scale+offset.y + this.AABB.height/2 + 6);
        RenderManager.ctx.restore();
    }
}
class GUIImageButton extends GUIInteractable{
    public img: HTMLImageElement;
    constructor(AABB: AABB, img: HTMLImageElement, onClick: Function){
        super(AABB, onClick);
        this.img = img;
    }
    Draw(scale: number, offset: Vector2): void{
        RenderManager.ctx.drawImage(this.img, this.AABB.x*scale+offset.x, this.AABB.y*scale+offset.y, this.AABB.width*scale, this.AABB.height*scale);
    }
}
class GUISlot extends GUIElement implements IInteract{
    public itemInSlot: InventoryItem;
    private static InventoryItemOffset: number = 4;
    private static InventorySlotImage: HTMLImageElement;
    constructor(AABB: AABB, itemInSlot: InventoryItem){
        super();
        this.AABB = AABB;
        this.itemInSlot = itemInSlot;
        if(!GUISlot.InventorySlotImage){
            GUISlot.InventorySlotImage = new Image();
            GUISlot.InventorySlotImage.src = "Images/GUI/ItemSlot.png";
        }
    }
    Draw(scale: number, offset: Vector2): void {
        //draw slot
        RenderManager.ctx.drawImage(
            GUISlot.InventorySlotImage,  
            this.AABB.x*scale+offset.x,
            this.AABB.y*scale+offset.y, 
            this.AABB.width*scale,
            this.AABB.height*scale);

        //draw item if not null
        if(this.itemInSlot && this.itemInSlot.item){
            RenderManager.ctx.drawImage(
                this.itemInSlot.item.image,  
                this.AABB.x*scale+offset.x + GUISlot.InventoryItemOffset/2,
                this.AABB.y*scale+offset.y + GUISlot.InventoryItemOffset/2, 
                this.AABB.width*scale - GUISlot.InventoryItemOffset,
                this.AABB.height*scale - GUISlot.InventoryItemOffset);

            //draw amount
            if(this.itemInSlot.amount > 1){
                RenderManager.ctx.strokeStyle = "black";
                RenderManager.ctx.fillStyle = "white";

                RenderManager.ctx.textAlign = "right";
                RenderManager.ctx.font = "20px Tiny5";

                RenderManager.ctx.lineWidth = 5;

                //outline
                RenderManager.ctx.strokeText(this.itemInSlot.amount.toString(),
                    this.AABB.x*scale+offset.x + this.AABB.width*scale - GUISlot.InventoryItemOffset/2 - 3, 
                    this.AABB.y*scale+offset.y + this.AABB.height*scale - GUISlot.InventoryItemOffset/2 - 6);

                //fill text
                RenderManager.ctx.fillText(this.itemInSlot.amount.toString(), 
                    this.AABB.x*scale+offset.x + this.AABB.width*scale - GUISlot.InventoryItemOffset/2 - 3, 
                    this.AABB.y*scale+offset.y + this.AABB.height*scale - GUISlot.InventoryItemOffset/2 - 6);
            }
        }
    }
    OnClick(){
        this.itemInSlot!.item = GetItem(ItemType.IronIngot);
    }
}