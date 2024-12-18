/// <reference path="../../Math/Math.ts" />

const seed = Math.random() * 1000;

//returns a function that generates a random number between 0 and 1 exclusive using a seed
function RandomUsingSeed(seed: number) {
    const m: number = 0x80000000; // 2**31
    const a: number = 1103515245;
    const c: number = 12345;

    let state: number = seed;

    //returns a random number between 0 and 1 (not including 1)
    return function() {
        state = (a * state + c) % m;
        return state / (m - 1);
    };
}

class PerlinNoise {
    public static perlin: PerlinNoise = new PerlinNoise(seed);
    rnd: () => number;
    permutation: number[];
    gradients: { x: number, y: number }[];
    constructor(seed: number) {
        this.rnd = RandomUsingSeed(seed);
        this.permutation = this.generatePermutation();
        this.gradients = this.generateGradients();
    }
    private permutationCount = 128;
    private gradientCount = 16;
    generatePermutation(): number[] {
        let permutation: number[] = [];
        for (let i = 0; i < this.permutationCount; i++) {
            permutation.push(i);
        }
        permutation.sort(() => this.rnd() - 0.5);
        return permutation.concat(permutation);
    }

    generateGradients(): { x: number, y: number }[]{
        const gradients = [];
        for (let i = 0; i < this.gradientCount; i++) {
            const theta = this.rnd() * 2 * Math.PI;
            gradients.push({ x: Math.cos(theta), y: Math.sin(theta) });
        }
        return gradients;
    }

    dotGridGradient(ix: number, iy: number, x: number, y: number): number {
        const gradient = this.gradients[(this.permutation[ix + this.permutation[iy & this.permutationCount-1]] & this.gradientCount-1)];
        const dx: number = x - ix;
        const dy: number = y - iy;
        return dx * gradient.x + dy * gradient.y;
    }

    fade(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(a: number, b: number, t: number): number {
        return a + t * (b - a);
    }

    //returns value between 0 and 1
    perlin(x: number, y: number): number {
        x = Math.abs(x);
        y = Math.abs(y);

        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;

        const xf = x - Math.floor(x);
        const yf = y - Math.floor(y);

        const u = this.fade(xf);
        const v = this.fade(yf);

        const n00 = this.dotGridGradient(X, Y, x, y);
        const n01 = this.dotGridGradient(X, Y + 1, x, y);
        const n10 = this.dotGridGradient(X + 1, Y, x, y);
        const n11 = this.dotGridGradient(X + 1, Y + 1, x, y);

        const x1 = this.lerp(n00, n10, u);
        const x2 = this.lerp(n01, n11, u);
        
        return (this.lerp(x1, x2, v)+1)/2;
    }

    GeneratePerlinAt(x: number, y: number) {
        const value = this.perlin(x, y);
        //ocean <1 - 0.7)
        let t: number = (value - 0.7) / 0.3; //from 0.7 - 1 to 0 - 1
        if(value > 0.7) return {
            r: lerp(11,4, t),
            g: lerp(89,60, t),
            b: lerp(214,201, t),
        }
        //sand <0.7 - 0.62)
        t = (value - 0.62) / 0.08; //from 0.62 - 0.7 to 0 - 1
        if(value > 0.62) return {
            r: lerp(232,204, t),
            g: lerp(217,191, t),
            b: lerp(12,8, t),
        }

        //grass <0.62 - 0>
        t = (value - 0) / 0.62; //from 0 - 0.62 to 0 - 1
        return {
            r: lerp(22, 42,t),
            g: lerp(153, 176,t),
            b: lerp(5, 25,t),          
        };
    }
    GetGroundDataAt(x: number, y: number): GroundData{
        const color = this.GeneratePerlinAt(x/32, y/32);
        return new GroundData(new rgb(color.r, color.g, color.b));
    }
}
class ValueNoise{ //looks better for terrain
    public static valueNoise: ValueNoise = new ValueNoise(seed);
    seed: number;
    permutation: number[];

    constructor(seed: number) {
        this.seed = seed;
        this.permutation = this.generatePermutation();
    }

    // Precompute a permutation table like Perlin noise
    private permutationCount = 256;
    
    generatePermutation(): number[] {
        let permutation: number[] = [];
        for (let i = 0; i < this.permutationCount; i++) {
            permutation.push(i);
        }
        permutation.sort(() => Math.random() - 0.5);
        return permutation.concat(permutation);  // Double it for overflow handling
    }

    // Use a simple fade function for smoother interpolation
    fade(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);  // Smootherstep
    }

    // Generate a random value using the precomputed permutation table
    valueAtGrid(ix: number, iy: number): number {
        const hash = this.permutation[(ix + this.permutation[iy % this.permutationCount]) % this.permutationCount];
        return (hash / this.permutationCount) * 2 - 1;  // Normalize to [-1, 1]
    }

    // Core function: Generate value noise at (x, y)
    noise2d(x: number, y: number): number {
        const intX = Math.floor(x);
        const intY = Math.floor(y);
        const fracX = x - intX;
        const fracY = y - intY;

        // Compute random values at the four corners of the grid cell
        const v1 = this.valueAtGrid(intX, intY);
        const v2 = this.valueAtGrid(intX + 1, intY);
        const v3 = this.valueAtGrid(intX, intY + 1);
        const v4 = this.valueAtGrid(intX + 1, intY + 1);

        // Smooth the fractional coordinates
        const u = this.fade(fracX);
        const v = this.fade(fracY);

        // Interpolate between the values
        const i1 = lerp(v1, v2, u);
        const i2 = lerp(v3, v4, u);
        return lerp(i1, i2, v);
    }

    fractal2d(x: number, y: number, octaves: number): number {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;  // For normalization

        for (let i = 0; i < octaves; i++) {
            total += this.noise2d(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }

        return total / maxValue;  // Normalize to [-1, 1]
    }

    //Generate terrain colors based on the fractal value noise
    GenerateFractalAt(x: number, y: number) {
        const value = (this.fractal2d(x/16, y/16, 16)+1)/2;
        //ocean <1 - 0.7)
        let t: number = (value - 0.7) / 0.3; //from 0.7 - 1 to 0 - 1
        if(value > 0.7) return {
            r: lerp(11,4, t),
            g: lerp(89,60, t),
            b: lerp(214,201, t),
        }
        //sand <0.7 - 0.60)
        t = (value - 0.60) / 0.08; //from 0.60 - 0.7 to 0 - 1
        if(value > 0.60) return {
            r: lerp(232,204, t),
            g: lerp(217,191, t),
            b: lerp(12,8, t),
        }

        //grass <0.60 - 0>
        t = (value - 0) / 0.60; //from 0 - 0.60 to 0 - 1
        return {
            r: lerp(22, 42,t),
            g: lerp(153, 176,t),
            b: lerp(5, 25,t),          
        };
    }

    // Generate ground data at (x, y)
    GetGroundDataAt(x: number, y: number): GroundData {
        const color = this.GenerateFractalAt(x, y);
        return new GroundData(new rgb(color.r, color.g, color.b));
    }
}