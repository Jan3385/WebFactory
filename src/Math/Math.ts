class Vector2{
    x: number;
    y: number;
    constructor(x: number, y: number){
        this.x = x;
        this.y = y;
    }
    flip(): Vector2{
        return new Vector2(this.x * -1, this.y * - 1);
    }
    flipX(): Vector2{
        return new Vector2(this.x * -1, this.y);
    }
    flipY(): Vector2{
        return new Vector2(this.x, this.y * -1);
    }
    normalize(): Vector2{
        const mag = this.magnitude();
        return new Vector2(Math.floor(this.x / mag), Math.floor(this.y / mag));
    }
    magnitude(): number{
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    multiply(val: number): Vector2{
        return new Vector2(this.x * val, this.y * val);
    }
    divideAndFloor(val: number): Vector2{
        return new Vector2(Math.floor(this.x / val), Math.floor(this.y / val));
    }
    add(other: Vector2): Vector2{
        return new Vector2(this.x + other.x, this.y + other.y);
    }
    subtract(other: Vector2): Vector2{
        return new Vector2(this.x - other.x, this.y - other.y);
    }
    static readonly SidesDir: Vector2[] = [
        new Vector2(0, 1), new Vector2(-1, 0), new Vector2(1, 0), new Vector2(0, -1)
    ];

    static readonly AroundDir: Vector2[] = [
        new Vector2(0, 1), new Vector2(-1, 0), new Vector2(1, 0), new Vector2(0, -1),
        new Vector2(1, 1), new Vector2(-1, 1), new Vector2(1, -1), new Vector2(-1, -1)
    ];
    copy(): Vector2{
        return new Vector2(this.x, this.y);
    }
}
class rgb{
    protected color: number;
    constructor(r: number,g: number,b: number){
        this.color = rgb.pack(r, g, b);
    }
    static pack(r: number, g: number, b: number): number{
        return (r << 16) | (g << 8) | b;
    }
    static unpack(color: number): { r: number; g: number; b: number } {
        return {
            r: (color >> 16) & 0xff,
            g: (color >> 8) & 0xff,
            b: color & 0xff,
        };
    }
    new(): rgb {
        const { r, g, b } = rgb.unpack(this.color);
        return new rgb(r, g, b);
    }

    newSlightlyRandom(val: number): rgb {
        const { r, g, b } = rgb.unpack(this.color);
        return new rgb(
            clamp(r + Math.floor(Math.random() * val)),
            clamp(g + Math.floor(Math.random() * val)),
            clamp(b + Math.floor(Math.random() * val))
        );
    }
    changeBy(val: number): rgb {
        const { r, g, b } = rgb.unpack(this.color);
        return new rgb(
            clamp(r + val),
            clamp(g + val),
            clamp(b + val)
        );
    }
    get(): string {
        const { r, g, b } = rgb.unpack(this.color);
        return `rgb(${r},${g},${b})`;
    }
    darker(): rgb {
        const { r, g, b } = rgb.unpack(this.color);
        return new rgb(r / 2, g / 2, b / 2);
    }
    lerp(other: rgb, t: number): rgb {
        const { r, g, b } = rgb.unpack(this.color);
        const { r: or, g: og, b: ob } = rgb.unpack(other.color);
        return new rgb(
            Math.floor(lerp(r, or, t)),
            Math.floor(lerp(g, og, t)),
            Math.floor(lerp(b, ob, t))
        );
    }
    MixWith(other: rgb, t: number): rgb {
        return this.lerp(other, t);
    }
}
class rgba extends rgb{
    private alpha: number;

    constructor(r: number, g: number, b: number, a: number) {
        super(r, g, b);
        this.alpha = clamp(a);
    }

    new(): rgba {
        const { r, g, b } = rgb.unpack(this.color);
        return new rgba(r, g, b, this.alpha);
    }

    newSlightlyRandom(val: number): rgba {
        const { r, g, b } = rgb.unpack(this.color);
        return new rgba(
            clamp(r + Math.floor(Math.random() * val)),
            clamp(g + Math.floor(Math.random() * val)),
            clamp(b + Math.floor(Math.random() * val)),
            this.alpha
        );
    }

    changeBy(val: number): rgba {
        const { r, g, b } = rgb.unpack(this.color);
        return new rgba(
            clamp(r + val),
            clamp(g + val),
            clamp(b + val),
            this.alpha
        );
    }

    get(): string {
        const { r, g, b } = rgb.unpack(this.color);
        return `rgba(${r},${g},${b},${this.alpha / 255})`;
    }

    Darker(): rgba {
        const { r, g, b } = rgb.unpack(this.color);
        return new rgba(r / 2, g / 2, b / 2, this.alpha);
    }

    MixWith(other: rgba, t: number): rgba {
        const { r, g, b } = rgb.unpack(this.color);
        const { r: or, g: og, b: ob } = rgb.unpack(other.color);
        return new rgba(
            Math.floor(lerp(r, or, t)),
            Math.floor(lerp(g, og, t)),
            Math.floor(lerp(b, ob, t)),
            Math.floor(lerp(this.alpha, other.alpha, t))
        );
    }
}
/**
 * Linear interpolation from a to b with t
 */
function lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
}
function clamp(val: number, min: number = 0, max: number = 255): number {
    return Math.min(Math.max(val, min), max);
}