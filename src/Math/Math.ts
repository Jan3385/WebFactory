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
    static SidesDir(): Vector2[] {
        return [new Vector2(0, 1), new Vector2(-1, 0), new Vector2(1, 0), new Vector2(0, -1)];
    }
    static AroundDir(): Vector2[]{
        return [ new Vector2(0, 1), new Vector2(-1, 0), new Vector2(1, 0), new Vector2(0, -1),
            new Vector2(1, 1), new Vector2(-1, 1), new Vector2(1, -1), new Vector2(-1, -1) ];
    }
    copy(): Vector2{
        return new Vector2(this.x, this.y);
    }
}
class rgb{
    /**
     * @constructor
     * @param {number} r 
     * @param {number} g 
     * @param {number} b 
     */
    r: number;
    g: number;
    b: number;
    constructor(r: number,g: number,b: number){
        this.r = r;
        this.g = g;
        this.b = b;
    }
    new(): rgb{
        return new rgb(this.r, this.g, this.b);
    }
    newSlightlyRandom(val: number): rgb{
        return new rgb(this.r + Math.floor(Math.random()*val), 
                        this.g + Math.floor(Math.random()*val), 
                        this.b + Math.floor(Math.random()*val));
    }
    changeBy(val: number): rgb{
        return new rgb(this.r + val, 
                        this.g + val, 
                        this.b + val);
    }
    /**
    * Returns the rgb value in string format
    * @returns {string}
    */
    get(): string{
        return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';
    }
    getWithLight(light: number): string{
        const lightShift = Math.min(light / 5, 1.1);
        return `rgb(${Math.floor(this.r * lightShift)},${Math.floor(this.g*lightShift)},${this.b*lightShift})`;
    }
    /**
     * Makes the rgb value darker by the value
     * @param {number} val 
     *
     */
    Darker(): rgb{
        return new rgb(
            this.r / 2,
            this.g / 2,
            this.b / 2
        )
    }
    Lerp(other: rgb, t: number): rgb{
        return new rgb(
            Math.floor(lerp(this.r, other.r, t)),
            Math.floor(lerp(this.g, other.g, t)),
            Math.floor(lerp(this.b, other.b, t))
        );
    }
    MixWith(other: rgb, t: number): rgb{
        return new rgb(
            Math.floor(lerp(this.r, other.r, t)),
            Math.floor(lerp(this.g, other.g, t)),
            Math.floor(lerp(this.b, other.b, t))
        );
    }
}
/**
 * Linear interpolation from a to b with t
 */
function lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
}