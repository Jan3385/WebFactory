class GUI{
    public elements: GUIElement[];
    public interactiveElements: GUIElement[];
    public AABB: AABB;
    public BackgroundImage: HTMLImageElement;
    constructor(width: number, height: number){
        this.elements = [];
        this.interactiveElements = [];
        this.AABB = new AABB(new Vector2(0, 0), new Vector2(width, height));

        this.BackgroundImage = new Image();
        this.SetBackground("Default");

        this.MoveToMiddleOfScreen();
        RenderManager.ins.AddGUI(this);
    }
    MoveToMiddleOfScreen(){
        this.AABB.x = window.innerWidth/2 - this.AABB.width/2;
        this.AABB.y = window.innerHeight/2 - this.AABB.height/2;
    }
    Draw(scale: number){
        //draw background
        this.DrawBackground9Slice(scale, 16);


        this.elements.forEach(guiElement => guiElement.Draw(scale, new Vector2(this.AABB.x, this.AABB.y)));
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
    Close(){
        RenderManager.ins.RemoveGUI(this);
    }
    SetBackground(backgroundName: string): GUI{
        this.BackgroundImage = new Image();
        this.BackgroundImage.src = `Images/GUI/Backgrounds/${backgroundName}.png`;
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
    AddText(AABB: AABB, text: string, textSize: number): GUI{
        const element = new GUIText(AABB, text, textSize);
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
    AddTopBar(Header: string){
        const elements = this.GetTopBar(Header);
        const buttonElement = elements.pop()!;
        elements.forEach(element => this.AddElement(element));
        this.AddInteractiveElement(buttonElement);
        return this;
    }
    private GetTopBar(Header: string): GUIElement[]{
        return [
            new GUISimple(new AABB(new Vector2(0, -30), new Vector2(this.AABB.width, 25)), new rgba(255, 255, 255, 0.5)),
            new GUIText(new AABB(new Vector2(10, -10), new Vector2(100, 20)), Header, 20),
            new GUIButton(new AABB(new Vector2(this.AABB.width-25, -27.5), new Vector2(20, 20)), "X", () => this.Close()),
        ];
    }
}
abstract class GUIElement{
    public AABB: AABB = new AABB(new Vector2(0, 0), new Vector2(1, 1));
    public parent: GUI | null = null;
    abstract Draw(scale: number, offset: Vector2): void;
    GetOnScreenAABB(): AABB{
        return new AABB(
            new Vector2(this.AABB.x + this.parent!.AABB.x, this.AABB.y + this.parent!.AABB.y),
            new Vector2(this.AABB.width, this.AABB.height)
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
    constructor(AABB: AABB, text: string, textSize: number = 20){
        super();
        this.AABB = AABB;
        this.text = text;
        this.textSize = textSize;
    }
    Draw(scale: number, offset: Vector2){
        RenderManager.ctx.fillStyle = "white";
        RenderManager.ctx.font = `${this.textSize}px Tiny5`;
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
class GUIButton extends GUIElement{
    public text: string;
    public onClick: Function;
    constructor(AABB: AABB, text: string, onClick: Function){
        super();
        this.AABB = AABB;
        this.text = text;
        this.onClick = onClick;
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
    OnClick(){
        this.onClick();
    }
}