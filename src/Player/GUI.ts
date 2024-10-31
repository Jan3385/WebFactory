class GUI{
    public elements: GUIElement[];
    public AABB: AABB;
    public BackgroundImage: HTMLImageElement;
    constructor(width: number, height: number){
        this.elements = [];
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
    
    AddElement(element: GUIElement){
        this.elements.push(element);
    }
    Close(){
        RenderManager.ins.RemoveGUI(this);
    }
    SetBackground(backgroundName: string): GUI{
        this.BackgroundImage = new Image();
        this.BackgroundImage.src = `Images/GUI/Backgrounds/${backgroundName}.png`;
        return this;
    }
    AddText(AABB: AABB, text: string, textSize: number): GUI{
        this.elements.push(new GUIText(AABB, text, textSize));
        return this;
    }
    AddImage(AABB: AABB, img: HTMLImageElement): GUI{
        this.elements.push(new GUIImage(AABB, img));
        return this;
    }
    AddButton(AABB: AABB, text: string, onClick: Function): GUI{
        this.elements.push(new GUIButton(AABB, text, onClick));
        return this;
    }
    AddTopBar(){
        this.elements = this.elements.concat(this.GetTopBar());
        return this;
    }
    private GetTopBar(): GUIElement[]{
        return [
            new GUISimple(new AABB(new Vector2(0, -25), new Vector2(this.AABB.width, 25)), new rgba(255, 255, 255, 0.5)),
            new GUIText(new AABB(new Vector2(0, -5), new Vector2(100, 20)), "TopBar", 20)
        ];
    }
}
abstract class GUIElement{
    public AABB: AABB = new AABB(new Vector2(0, 0), new Vector2(1, 1));
    abstract Draw(scale: number, offset: Vector2): void;
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
        RenderManager.ctx.font = `${this.textSize}px Arial`;
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
    Draw(scale: number, offset: Vector2){
        
    }
    OnClick(){
        this.onClick();
    }
}