class Renderer{
    public static canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('GameCanvas')!;
    public static ctx: CanvasRenderingContext2D = Renderer.canvas.getContext('2d')!;
    public static ins: Renderer = new Renderer();

    private constructor() {
        window.addEventListener('resize', this.OnWindowResize);
        this.OnWindowResize();
    }

    public Draw(){
        
    }

    private OnWindowResize(){
        Renderer.canvas.width = window.innerWidth;
        Renderer.canvas.height = window.innerHeight;
    }
}