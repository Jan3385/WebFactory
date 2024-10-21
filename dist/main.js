"use strict";
class Vector2 {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    flip() {
        return new Vector2(this.x * -1, this.y * -1);
    }
    flipX() {
        return new Vector2(this.x * -1, this.y);
    }
    flipY() {
        return new Vector2(this.x, this.y * -1);
    }
    normalize() {
        const mag = this.magnitude();
        return new Vector2(Math.floor(this.x / mag), Math.floor(this.y / mag));
    }
    magnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    multiply(val) {
        return new Vector2(this.x * val, this.y * val);
    }
    divideAndFloor(val) {
        return new Vector2(Math.floor(this.x / val), Math.floor(this.y / val));
    }
    add(other) {
        return new Vector2(this.x + other.x, this.y + other.y);
    }
    subtract(other) {
        return new Vector2(this.x - other.x, this.y - other.y);
    }
    static SidesDir() {
        return [new Vector2(0, 1), new Vector2(-1, 0), new Vector2(1, 0), new Vector2(0, -1)];
    }
    static AroundDir() {
        return [new Vector2(0, 1), new Vector2(-1, 0), new Vector2(1, 0), new Vector2(0, -1),
            new Vector2(1, 1), new Vector2(-1, 1), new Vector2(1, -1), new Vector2(-1, -1)];
    }
    copy() {
        return new Vector2(this.x, this.y);
    }
}
class rgb {
    /**
     * @constructor
     * @param {number} r
     * @param {number} g
     * @param {number} b
     */
    r;
    g;
    b;
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    new() {
        return new rgb(this.r, this.g, this.b);
    }
    newSlightlyRandom(val) {
        return new rgb(this.r + Math.floor(Math.random() * val), this.g + Math.floor(Math.random() * val), this.b + Math.floor(Math.random() * val));
    }
    changeBy(val) {
        return new rgb(this.r + val, this.g + val, this.b + val);
    }
    /**
    * Returns the rgb value in string format
    * @returns {string}
    */
    get() {
        return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';
    }
    getWithLight(light) {
        const lightShift = Math.min(light / 5, 1.1);
        return `rgb(${Math.floor(this.r * lightShift)},${Math.floor(this.g * lightShift)},${this.b * lightShift})`;
    }
    /**
     * Makes the rgb value darker by the value
     * @param {number} val
     *
     */
    Darker() {
        return new rgb(this.r / 2, this.g / 2, this.b / 2);
    }
    Lerp(other, t) {
        return new rgb(Math.floor(lerp(this.r, other.r, t)), Math.floor(lerp(this.g, other.g, t)), Math.floor(lerp(this.b, other.b, t)));
    }
    MixWith(other, t) {
        return new rgb(Math.floor(lerp(this.r, other.r, t)), Math.floor(lerp(this.g, other.g, t)), Math.floor(lerp(this.b, other.b, t)));
    }
}
/**
 * Linear interpolation from a to b with t
 */
function lerp(a, b, t) {
    return a + t * (b - a);
}
/// <reference path="../../Math/Math.ts" />
const seed = Math.random() * 1000;
//returns a function that generates a random number between 0 and 1 exclusive using a seed
function RandomUsingSeed(seed) {
    const m = 0x80000000; // 2**31
    const a = 1103515245;
    const c = 12345;
    let state = seed;
    //returns a random number between 0 and 1 (not including 1)
    return function () {
        state = (a * state + c) % m;
        return state / (m - 1);
    };
}
class PerlinNoise {
    static perlin = new PerlinNoise(seed);
    rnd;
    permutation;
    gradients;
    constructor(seed) {
        this.rnd = RandomUsingSeed(seed);
        this.permutation = this.generatePermutation();
        this.gradients = this.generateGradients();
    }
    permutationCount = 128;
    gradientCount = 16;
    generatePermutation() {
        let permutation = [];
        for (let i = 0; i < this.permutationCount; i++) {
            permutation.push(i);
        }
        permutation.sort(() => this.rnd() - 0.5);
        return permutation.concat(permutation);
    }
    generateGradients() {
        const gradients = [];
        for (let i = 0; i < this.gradientCount; i++) {
            const theta = this.rnd() * 2 * Math.PI;
            gradients.push({ x: Math.cos(theta), y: Math.sin(theta) });
        }
        return gradients;
    }
    dotGridGradient(ix, iy, x, y) {
        const gradient = this.gradients[(this.permutation[ix + this.permutation[iy & this.permutationCount - 1]] & this.gradientCount - 1)];
        const dx = x - ix;
        const dy = y - iy;
        return dx * gradient.x + dy * gradient.y;
    }
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    lerp(a, b, t) {
        return a + t * (b - a);
    }
    //returns value between 0 and 1
    perlin(x, y) {
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
        return (this.lerp(x1, x2, v) + 1) / 2;
    }
    GeneratePerlinAt(x, y) {
        const value = this.perlin(x, y);
        //ocean <1 - 0.7)
        let t = (value - 0.7) / 0.3; //from 0.7 - 1 to 0 - 1
        if (value > 0.7)
            return {
                r: lerp(11, 4, t),
                g: lerp(89, 60, t),
                b: lerp(214, 201, t),
            };
        //sand <0.7 - 0.62)
        t = (value - 0.62) / 0.08; //from 0.62 - 0.7 to 0 - 1
        if (value > 0.62)
            return {
                r: lerp(232, 204, t),
                g: lerp(217, 191, t),
                b: lerp(12, 8, t),
            };
        //grass <0.62 - 0>
        t = (value - 0) / 0.62; //from 0 - 0.62 to 0 - 1
        return {
            r: lerp(22, 42, t),
            g: lerp(153, 176, t),
            b: lerp(5, 25, t),
        };
    }
    GetGroundDataAt(x, y) {
        const color = this.GeneratePerlinAt(x / 32, y / 32);
        return new GroundData(new Vector2(x % Chunk.ChunkSize, y % Chunk.ChunkSize), new rgb(color.r, color.g, color.b));
    }
}
class ValueNoise {
    static valueNoise = new ValueNoise(seed);
    seed;
    permutation;
    constructor(seed) {
        this.seed = seed;
        this.permutation = this.generatePermutation();
    }
    // Precompute a permutation table like Perlin noise
    permutationCount = 256;
    generatePermutation() {
        let permutation = [];
        for (let i = 0; i < this.permutationCount; i++) {
            permutation.push(i);
        }
        permutation.sort(() => Math.random() - 0.5);
        return permutation.concat(permutation); // Double it for overflow handling
    }
    // Use a simple fade function for smoother interpolation
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10); // Smootherstep
    }
    // Generate a random value using the precomputed permutation table
    valueAtGrid(ix, iy) {
        const hash = this.permutation[(ix + this.permutation[iy % this.permutationCount]) % this.permutationCount];
        return (hash / this.permutationCount) * 2 - 1; // Normalize to [-1, 1]
    }
    // Core function: Generate value noise at (x, y)
    noise2d(x, y) {
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
    fractal2d(x, y, octaves) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0; // For normalization
        for (let i = 0; i < octaves; i++) {
            total += this.noise2d(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }
        return total / maxValue; // Normalize to [-1, 1]
    }
    //Generate terrain colors based on the fractal value noise
    GenerateFractalAt(x, y) {
        const value = (this.fractal2d(x / 16, y / 16, 16) + 1) / 2;
        //ocean <1 - 0.7)
        let t = (value - 0.7) / 0.3; //from 0.7 - 1 to 0 - 1
        if (value > 0.7)
            return {
                r: lerp(11, 4, t),
                g: lerp(89, 60, t),
                b: lerp(214, 201, t),
            };
        //sand <0.7 - 0.60)
        t = (value - 0.60) / 0.08; //from 0.60 - 0.7 to 0 - 1
        if (value > 0.60)
            return {
                r: lerp(232, 204, t),
                g: lerp(217, 191, t),
                b: lerp(12, 8, t),
            };
        //grass <0.60 - 0>
        t = (value - 0) / 0.60; //from 0 - 0.60 to 0 - 1
        return {
            r: lerp(22, 42, t),
            g: lerp(153, 176, t),
            b: lerp(5, 25, t),
        };
    }
    // Generate ground data at (x, y)
    GetGroundDataAt(x, y) {
        const color = this.GenerateFractalAt(x, y);
        return new GroundData(new Vector2(x % Chunk.ChunkSize, y % Chunk.ChunkSize), new rgb(color.r, color.g, color.b));
    }
}
/// <reference path="../Math/Math.ts" />
/// <reference path="./Generation/NoiseGenerator.ts" />
/// <reference path="./MapManager.ts" />
class Chunk {
    //size of a chunk - number of voxels in a chunk in X or Y
    static ChunkSize = 32;
    //rendered size of individual voxel pixels
    static PixelSize = 18; //lowering this makes the maximum world size smaller
    //left top position in the grid-space
    position;
    data = [];
    chunkRender;
    chunkRenderCtx;
    constructor(position) {
        this.position = position;
        this.chunkRender = new OffscreenCanvas(Chunk.ChunkSize * Chunk.PixelSize, Chunk.ChunkSize * Chunk.PixelSize);
        this.chunkRenderCtx = this.chunkRender.getContext('2d', { alpha: false });
        this.Load();
    }
    Load() {
        for (let y = 0; y < Chunk.ChunkSize; y++) {
            for (let x = 0; x < Chunk.ChunkSize; x++) {
                this.data.push(ValueNoise.valueNoise.GetGroundDataAt(x + this.position.x * Chunk.ChunkSize, y + this.position.y * Chunk.ChunkSize));
            }
        }
        this.PreDrawChunk();
    }
    PreDrawChunk() {
        this.data.forEach(data => {
            this.chunkRenderCtx.fillStyle = data.color.get();
            this.chunkRenderCtx.fillRect(Math.floor(data.position.x * Chunk.PixelSize), Math.floor(data.position.y * Chunk.PixelSize), Chunk.PixelSize, Chunk.PixelSize);
        });
    }
    GetChunkRender() {
        return this.chunkRender;
    }
    DrawChunkExtras(CameraOffset) {
        CameraOffset = CameraOffset.add(this.position.multiply(Chunk.ChunkSize * Chunk.PixelSize));
        //write chunk number on the chunk
        RenderManager.ctx.fillStyle = "white";
        RenderManager.ctx.font = "10px Arial";
        RenderManager.ctx.fillText(`(${this.position.x}, ${this.position.y})`, CameraOffset.x, CameraOffset.y + Chunk.ChunkSize * Chunk.PixelSize - 5);
        //box at the 0,0 of the chunk
        RenderManager.ctx.fillStyle = "red";
        RenderManager.ctx.fillRect(CameraOffset.x, CameraOffset.y, 5, 5);
        //draw chunk border
        if (this.position.x != 2 || this.position.y != 1)
            return;
        RenderManager.ctx.strokeStyle = "Blue";
        RenderManager.ctx.lineWidth = 5;
        RenderManager.ctx.strokeRect(CameraOffset.x + 1, CameraOffset.y + 1, this.GetAABB().width * Chunk.PixelSize - 1, this.GetAABB().height * Chunk.PixelSize - 1);
    }
    GetAABB() {
        //return new AABB(this.position.multiply(Chunk.ChunkSize), new Vector2(Chunk.ChunkSize, Chunk.ChunkSize));
        return new AABB(new Vector2(this.position.x * Chunk.ChunkSize, this.position.y * Chunk.ChunkSize), new Vector2(Chunk.ChunkSize, Chunk.ChunkSize));
    }
}
class GroundData {
    position;
    color;
    constructor(position, color) {
        this.position = position;
        this.color = color;
    }
    GetAABB() {
        return new AABB(this.position, new Vector2(1, 1));
    }
}
/// <reference path="./GroundData.ts" />
class Planet {
    Chunks = [];
    constructor() {
    }
    GetDataAt(x, y) {
        const chunkPos = new Vector2(Math.floor(x / Chunk.ChunkSize), Math.floor(y / Chunk.ChunkSize));
        const chunk = this.Chunks.find(chunk => chunk.position.x == chunkPos.x && chunk.position.y == chunkPos.y);
        if (chunk) {
            return chunk.data.find((data) => data.position.x === x % Chunk.ChunkSize && data.position.y === y % Chunk.ChunkSize);
        }
        return null;
    }
}
/// <reference path="./Planet.ts" />
/// <reference path="./Generation/NoiseGenerator.ts" />
class MapManager {
    //current planet
    cPlanet;
    static ins = new MapManager();
    constructor() {
        this.cPlanet = new Planet();
    }
    //Deletes / generates new chunks when needed TODO: make async
    UpdateChunks() {
        this.cPlanet.Chunks.forEach(chunk => {
            if (!Player.ins.camera.AABB.isColliding(chunk.GetAABB())) {
                this.cPlanet.Chunks.splice(this.cPlanet.Chunks.indexOf(chunk), 1);
            }
        });
        let newChunks = [];
        for (let x = Math.floor(Player.ins.camera.AABB.x / Chunk.ChunkSize); x <= Math.floor((Player.ins.camera.AABB.x + Player.ins.camera.AABB.width) / Chunk.ChunkSize); x += 1) {
            for (let y = Math.floor(Player.ins.camera.AABB.y / Chunk.ChunkSize); y <= Math.floor((Player.ins.camera.AABB.y + Player.ins.camera.AABB.height) / Chunk.ChunkSize); y += 1) {
                const chunkPos = new Vector2(x, y);
                if (!this.cPlanet.Chunks.some(chunk => chunk.position.x == chunkPos.x && chunk.position.y == chunkPos.y)) {
                    newChunks.push(new Chunk(chunkPos));
                }
            }
        }
        this.cPlanet.Chunks = this.cPlanet.Chunks.concat(newChunks);
    }
}
class AABB {
    x;
    y;
    width;
    height;
    constructor(position, size) {
        this.x = position.x;
        this.y = position.y;
        this.width = size.x;
        this.height = size.y;
    }
    isColliding(other) {
        return (this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y);
    }
    isInside(other) {
        return (this.x >= other.x &&
            this.x + this.width <= other.x + other.width &&
            this.y >= other.y &&
            this.y + this.height <= other.y + other.height);
    }
    isDotInside(x, y) {
        return (this.x <= x &&
            this.x + this.width >= x &&
            this.y <= y &&
            this.y + this.height >= y);
    }
    copy() {
        return new AABB(new Vector2(this.x, this.y), new Vector2(this.width, this.height));
    }
}
/// <reference path="../Math/AABB.ts" />
class Camera {
    //Camera position in screen-space-position
    position;
    //Camera AABB in grid-space
    AABB;
    constructor(pos) {
        //Camera position in screen-position
        this.position = pos;
        //Camera AABB in grid-space
        this.AABB = new AABB(new Vector2((this.position.x - window.innerWidth / 2) / Chunk.PixelSize, (this.position.y - window.innerHeight / 2) / Chunk.PixelSize), new Vector2((window.outerWidth) / Chunk.PixelSize, (window.outerHeight) / Chunk.PixelSize));
    }
    //moves the camera and updates visible chunks
    UpdateCamera() {
        this.position = Player.ins.position.multiply(Chunk.PixelSize);
        this.AABB = new AABB(new Vector2((this.position.x - window.innerWidth / 2) / Chunk.PixelSize, (this.position.y - window.innerHeight / 2) / Chunk.PixelSize), new Vector2((window.outerWidth) / Chunk.PixelSize, (window.outerHeight) / Chunk.PixelSize));
        MapManager.ins.UpdateChunks();
    }
    GetCameraOffset() {
        return this.position.flip().add(new Vector2(Math.floor(window.innerWidth / 2), Math.floor(window.innerHeight / 2)));
    }
}
class Player {
    static ins = new Player();
    //player position in world position
    position = new Vector2(0, -(0)); //2**16 default
    Speed = 0.4;
    camera = new Camera(this.position.multiply(Chunk.PixelSize));
    constructor() { }
    move(dir) {
        this.position = this.position.add(dir.multiply(this.Speed));
        this.camera.UpdateCamera();
        //update mouse indicator
        InputManager.ins.UpdateMouseIndicator();
    }
    setPosition(pos) {
        this.position = pos;
        this.camera.UpdateCamera();
    }
    Draw(CameraOffset) {
        RenderManager.ctx.fillStyle = 'red';
        RenderManager.ctx.fillRect(this.position.x * Chunk.PixelSize + CameraOffset.x, this.position.y * Chunk.PixelSize + CameraOffset.y, Chunk.PixelSize, Chunk.PixelSize);
    }
}
/// <reference path="./Math/Math.ts" />
/// <reference path="./Map/MapManager.ts" />
/// <reference path="./Player/Player.ts" />
class RenderManager {
    static canvas;
    static ctx;
    static ins;
    constructor() {
        RenderManager.canvas = document.getElementById('GameCanvas');
        RenderManager.ctx = RenderManager.canvas.getContext('2d', { alpha: false });
        RenderManager.ins = this;
        window.addEventListener('resize', this.OnWindowResize);
        this.OnWindowResize();
    }
    PreviousCameraOffset = Player.ins.camera.GetCameraOffset();
    PreviousCameraAABB = Player.ins.camera.AABB.copy();
    Draw() {
        const FrameOffset = Player.ins.camera.GetCameraOffset().subtract(this.PreviousCameraOffset);
        const cameraOffset = Player.ins.camera.GetCameraOffset();
        MapManager.ins.cPlanet.Chunks.forEach(chunk => {
            const chunkRender = chunk.GetChunkRender();
            RenderManager.ctx.drawImage(chunkRender, chunk.position.x * Chunk.ChunkSize * Chunk.PixelSize + cameraOffset.x, chunk.position.y * Chunk.ChunkSize * Chunk.PixelSize + cameraOffset.y);
            chunk.DrawChunkExtras(cameraOffset);
        });
        Player.ins.Draw(Player.ins.camera.GetCameraOffset());
        //render mouse indicator
        const IndicatorImg = new Image(Chunk.PixelSize, Chunk.PixelSize);
        IndicatorImg.src = "images/indicators/MouseIndicator.png";
        RenderManager.ctx.drawImage(IndicatorImg, InputManager.ins.mouseIndicatorPos.x * Chunk.PixelSize + Player.ins.camera.GetCameraOffset().x, InputManager.ins.mouseIndicatorPos.y * Chunk.PixelSize + Player.ins.camera.GetCameraOffset().y);
        this.PreviousCameraAABB = Player.ins.camera.AABB.copy();
        this.PreviousCameraOffset = Player.ins.camera.GetCameraOffset();
    }
    OnWindowResize() {
        RenderManager.canvas.width = window.innerWidth;
        RenderManager.canvas.height = window.innerHeight;
        RenderManager.ins.Draw();
    }
}
let ExecTimeStarts = [];
function TimeExec(id) {
    if (ExecTimeStarts[id] == undefined || Number.isNaN(ExecTimeStarts[id]))
        ExecTimeStarts[id] = performance.now();
    else {
        console.log(`Execution time of ${id}: ${performance.now() - ExecTimeStarts[id]}ms`);
        ExecTimeStarts[id] = Number.NaN;
    }
}
/// <reference path="../Math/Math.ts" />
class InputManager {
    static ins = new InputManager();
    MovementVector;
    usedInput;
    inputPresses;
    removeInputValues;
    clearMap;
    mouseIndicatorPos;
    constructor() {
        this.MovementVector = new Vector2(0, 0);
        this.usedInput = false;
        this.inputPresses = [];
        this.removeInputValues = [];
        this.clearMap = { xMinus: false, xPlus: false, yMinus: false, yPlus: false };
        this.mouseIndicatorPos = new Vector2(0, 0);
        window.addEventListener("keydown", this.onKeyDown, false);
        window.addEventListener("keyup", this.onKeyUp, false);
        window.addEventListener("mousedown", this.onMouseDown, false);
        window.addEventListener("mouseup", this.onMouseUp, false);
        window.addEventListener("mousemove", this.onMouseMove, false);
        window.addEventListener("wheel", this.onMouseWheel, false);
    }
    //calls repeatedly on key hold
    onKeyDown(event) {
        switch (event.code) {
            case "KeyW": //W
                if (InputManager.ins.MovementVector.y != -1) {
                    InputManager.ins.MovementVector.y = -1;
                    InputManager.ins.usedInput = false;
                }
                break;
            case "KeyA": //A
                if (InputManager.ins.MovementVector.x != -1) {
                    InputManager.ins.MovementVector.x = -1;
                    InputManager.ins.usedInput = false;
                }
                break;
            case "KeyS": //S
                if (InputManager.ins.MovementVector.y != 1) {
                    InputManager.ins.MovementVector.y = 1;
                    InputManager.ins.usedInput = false;
                }
                break;
            case "KeyD": //D
                if (InputManager.ins.MovementVector.x != 1) {
                    InputManager.ins.MovementVector.x = 1;
                    InputManager.ins.usedInput = false;
                }
                break;
            default:
                //for other keys add to input presses array
                if (!InputManager.ins.inputPresses.includes(event.code)) {
                    InputManager.ins.inputPresses.push(event.code);
                    InputManager.ins.usedInput = false;
                }
                break;
        }
    }
    //calls once on key release
    onKeyUp(event) {
        //clear movement vector if it was registered ingame
        if (InputManager.ins.usedInput) {
            switch (event.code) {
                case "KeyW":
                    if (InputManager.ins.MovementVector.y == -1)
                        InputManager.ins.MovementVector.y = 0;
                    break;
                case "KeyD":
                    if (InputManager.ins.MovementVector.x == 1)
                        InputManager.ins.MovementVector.x = 0;
                    break;
                case "KeyS":
                    if (InputManager.ins.MovementVector.y == 1)
                        InputManager.ins.MovementVector.y = 0;
                    break;
                case "KeyA":
                    if (InputManager.ins.MovementVector.x == -1)
                        InputManager.ins.MovementVector.x = 0;
                    break;
                default:
                    if (InputManager.ins.inputPresses.includes(event.code))
                        InputManager.ins.inputPresses.splice(InputManager.ins.inputPresses.indexOf(event.code), 1);
                    break;
            }
            return;
        }
        //if the key was not registered ingame, designate for later removal
        switch (event.code) {
            case "KeyS":
                InputManager.ins.clearMap.yPlus = true;
                break;
            case "KeyD":
                InputManager.ins.clearMap.xPlus = true;
                break;
            case "KeyW":
                InputManager.ins.clearMap.yMinus = true;
                break;
            case "KeyA":
                InputManager.ins.clearMap.xMinus = true;
                break;
        }
        InputManager.ins.removeInputValues.push(event.code);
    }
    //inputs have been used and can be cleared now
    UpdateInput() {
        InputManager.ins.usedInput = true;
        //clears any movement vector if its designated for clearing
        if (InputManager.ins.clearMap.xMinus) {
            if (InputManager.ins.MovementVector.x == -1)
                InputManager.ins.MovementVector.x = 0;
            InputManager.ins.clearMap.xMinus = false;
        }
        if (InputManager.ins.clearMap.xPlus) {
            if (InputManager.ins.MovementVector.x == 1)
                InputManager.ins.MovementVector.x = 0;
            InputManager.ins.clearMap.xPlus = false;
        }
        if (InputManager.ins.clearMap.yMinus) {
            if (InputManager.ins.MovementVector.y == -1)
                InputManager.ins.MovementVector.y = 0;
            InputManager.ins.clearMap.yMinus = false;
        }
        if (InputManager.ins.clearMap.yPlus) {
            if (InputManager.ins.MovementVector.y == 1)
                InputManager.ins.MovementVector.y = 0;
            InputManager.ins.clearMap.yPlus = false;
        }
        //removes any keys that were designated for removal
        if (InputManager.ins.removeInputValues.length > 0) {
            InputManager.ins.removeInputValues.forEach(value => {
                if (InputManager.ins.inputPresses.includes(value))
                    InputManager.ins.inputPresses.splice(InputManager.ins.inputPresses.indexOf(value), 1);
            });
            InputManager.ins.removeInputValues = [];
        }
    }
    //Mouse
    onMouseDown(event) {
        const mousePos = new Vector2(event.clientX, event.clientY);
        const voxelPos = mousePos.subtract(Player.ins.camera.GetCameraOffset()).divideAndFloor(Chunk.PixelSize);
        console.log(voxelPos);
        const color = MapManager.ins.cPlanet.GetDataAt(voxelPos.x, voxelPos.y)?.color;
        console.log('%c color', `background: ${color?.get()}; color: ${color?.get()}`);
    }
    onMouseUp(event) {
    }
    previouseMousePos = new Vector2(0, 0);
    onMouseMove(event) {
        const mousePos = new Vector2(event.clientX, event.clientY);
        InputManager.ins.previouseMousePos = mousePos.copy();
        const voxelPos = mousePos.subtract(Player.ins.camera.GetCameraOffset()).divideAndFloor(Chunk.PixelSize);
        //InputManager.ins.UpdateMouseIndicator(mousePos); //already done by player move
    }
    onMouseWheel(event) {
    }
    UpdateMouseIndicator(mousePos = InputManager.ins.previouseMousePos) {
        const voxelPos = mousePos.subtract(Player.ins.camera.GetCameraOffset()).divideAndFloor(Chunk.PixelSize);
        InputManager.ins.mouseIndicatorPos = voxelPos;
    }
}
/// <reference path="./Player/Player.ts" />
/// <reference path="./Player/InputManager.ts" />
const fps = 50;
async function Main() {
    // Start
    Player.ins.move(new Vector2(0, 0)); //updates chunks and moves player
    new RenderManager();
    let run = true;
    while (run) {
        // Update loop
        let startTime = performance.now();
        InputManager.ins.UpdateInput();
        Player.ins.move(InputManager.ins.MovementVector); //updates chunks and moves player   
        RenderManager.ins.Draw(); // draws everything
        let endTime = performance.now();
        const executionTime = endTime - startTime;
        if (executionTime > 16)
            console.log("Lag spike! wait time designated for:", (1 / fps * 1000) - executionTime);
        await new Promise(r => setTimeout(r, Math.max((1 / fps * 1000) - executionTime, 0)));
    }
}
Main();
