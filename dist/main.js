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
    static perlin = new PerlinNoise(Math.random() * 1000);
    rnd;
    permutation;
    gradients;
    constructor(seed) {
        this.rnd = RandomUsingSeed(seed);
        this.permutation = this.generatePermutation();
        this.gradients = this.generateGradients();
    }
    generatePermutation() {
        let permutation = [];
        for (let i = 0; i < 256; i++) {
            permutation.push(i);
        }
        permutation.sort(() => this.rnd() - 0.5);
        return permutation.concat(permutation);
    }
    generateGradients() {
        const gradients = [];
        for (let i = 0; i < 256; i++) {
            const theta = this.rnd() * 2 * Math.PI;
            gradients.push({ x: Math.cos(theta), y: Math.sin(theta) });
        }
        return gradients;
    }
    dotGridGradient(ix, iy, x, y) {
        const gradient = this.gradients[(this.permutation[ix + this.permutation[iy & 255]] & 255)];
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
        const color = this.GeneratePerlinAt(x / 9, y / 9);
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
    static PixelSize = 14;
    //left top position in the grid-space
    position;
    data = [];
    constructor(position) {
        this.position = position;
        this.Load();
    }
    Load() {
        for (let y = 0; y < Chunk.ChunkSize; y++) {
            for (let x = 0; x < Chunk.ChunkSize; x++) {
                //if(x == 0) this.data.push(new GroundData(new Vector2(x, y), new rgb(255, 255, 255)));
                //else this.data.push(PerlinNoise.perlin.GetGroundDataAt(x + this.position.x * Chunk.ChunkSize, y + this.position.y * Chunk.ChunkSize));
                this.data.push(PerlinNoise.perlin.GetGroundDataAt(x + this.position.x * Chunk.ChunkSize, y + this.position.y * Chunk.ChunkSize));
            }
        }
    }
    Draw(CameraOffset) {
        CameraOffset = CameraOffset.add(this.position.multiply(Chunk.ChunkSize * Chunk.PixelSize));
        this.data.forEach(data => {
            RenderManager.ctx.fillStyle = data.color.get();
            RenderManager.ctx.fillRect(data.position.x * Chunk.PixelSize + CameraOffset.x, data.position.y * Chunk.PixelSize + CameraOffset.y, Chunk.PixelSize, -Chunk.PixelSize);
        });
        //write chunk number on the chunk
        RenderManager.ctx.save();
        RenderManager.ctx.scale(1, -1);
        RenderManager.ctx.fillStyle = "white";
        RenderManager.ctx.font = "10px Arial";
        RenderManager.ctx.fillText(`(${this.position.x}, ${this.position.y})`, CameraOffset.x, -CameraOffset.y);
        RenderManager.ctx.restore();
    }
    GetAABB() {
        return new AABB(this.position.multiply(Chunk.ChunkSize), new Vector2(Chunk.ChunkSize, Chunk.ChunkSize));
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
        const chunkPos = new Vector2(Math.floor(x / Chunk.ChunkSize), Math.floor(y * -1 / Chunk.ChunkSize));
        const chunk = this.Chunks.find(chunk => chunk.position.x == chunkPos.x && chunk.position.y == chunkPos.y);
        if (chunk) {
            return chunk.data.find((data) => data.position.x === x % Chunk.ChunkSize && data.position.y === y * -1 % Chunk.ChunkSize);
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
    //Deletes / generates new chunks when needed
    UpdateChunks() {
        this.cPlanet.Chunks.forEach(chunk => {
            if (!Player.ins.camera.AABB.isColliding(chunk.GetAABB())) {
                this.cPlanet.Chunks.splice(this.cPlanet.Chunks.indexOf(chunk), 1);
                console.log("Deleted chunk");
            }
        });
        let newChunks = [];
        for (let x = Math.floor(Player.ins.camera.AABB.x / Chunk.ChunkSize); x <= Math.floor((Player.ins.camera.AABB.x + Player.ins.camera.AABB.width) / Chunk.ChunkSize); x += 1) {
            for (let y = Math.floor(Player.ins.camera.AABB.y / Chunk.ChunkSize); y <= Math.floor((Player.ins.camera.AABB.y + Player.ins.camera.AABB.height) / Chunk.ChunkSize); y += 1) {
                const chunkPos = new Vector2(x, y);
                if (!this.cPlanet.Chunks.some(chunk => chunk.position.x == chunkPos.x && chunk.position.y == chunkPos.y)) {
                    newChunks.push(new Chunk(chunkPos));
                    console.log("Generated chunk");
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
}
/// <reference path="../Math/AABB.ts" />
class Camera {
    //Camera position in screen-position
    position;
    //Camera AABB in grid-space
    AABB;
    constructor(pos) {
        //Camera position in screen-position
        this.position = pos;
        //Camera AABB in grid-space
        this.AABB =
            new AABB(new Vector2((this.position.x - window.innerWidth / 2) / Chunk.PixelSize, (this.position.y - window.innerHeight / 2) / Chunk.PixelSize), new Vector2(window.innerWidth / Chunk.PixelSize, window.innerHeight / Chunk.PixelSize));
    }
    UpdateCamera() {
        this.position = Player.ins.position;
        this.AABB =
            new AABB(new Vector2((this.position.x - window.innerWidth / 2) / Chunk.PixelSize, (this.position.y - window.innerHeight / 2) / Chunk.PixelSize), new Vector2((window.outerWidth) / Chunk.PixelSize, (window.outerHeight) / Chunk.PixelSize));
        MapManager.ins.UpdateChunks();
    }
    GetCameraOffset() {
        return this.position.flip().add(new Vector2(Math.floor(window.innerWidth / 2), -Math.floor(window.innerHeight / 2)));
    }
}
class Player {
    static ins = new Player();
    position = new Vector2(2 ** 14, 2 ** 14); //Map starts to break down at 0 and at 2**15 - spawn in the middle of that
    //public position: Vector2 = new Vector2(0, 0); //Map starts to break down at 0 and at 2**15 - spawn in the middle of that
    Speed = 3;
    camera = new Camera(this.position);
    constructor() { }
    move(dir) {
        this.position = this.position.add(dir.multiply(this.Speed));
        this.camera.UpdateCamera();
    }
    setPosition(pos) {
        this.position = pos;
        this.camera.UpdateCamera();
    }
    Draw(CameraOffset) {
        RenderManager.ctx.fillStyle = 'red';
        RenderManager.ctx.fillRect(this.position.x + CameraOffset.x, this.position.y + CameraOffset.y, Chunk.PixelSize, -Chunk.PixelSize);
    }
}
/// <reference path="./Math/Math.ts" />
/// <reference path="./Map/MapManager.ts" />
/// <reference path="./Player/Player.ts" />
class RenderManager {
    constructor() {
        window.addEventListener('resize', this.OnWindowResize);
        this.OnWindowResize();
        RenderManager.ctx.scale(1, -1);
    }
    static canvas = document.getElementById('GameCanvas');
    static ctx = RenderManager.canvas.getContext('2d');
    static ins = new RenderManager();
    Draw() {
        RenderManager.ctx.fillStyle = "black";
        RenderManager.ctx.fillRect(0, 0, RenderManager.canvas.width, -RenderManager.canvas.height);
        MapManager.ins.cPlanet.Chunks.forEach(chunk => {
            chunk.Draw(Player.ins.camera.GetCameraOffset());
        });
        Player.ins.Draw(Player.ins.camera.GetCameraOffset());
    }
    OnWindowResize() {
        RenderManager.canvas.width = window.innerWidth;
        RenderManager.canvas.height = window.innerHeight;
    }
}
/// <reference path="../Math/Math.ts" />
let MovementVector = new Vector2(0, 0);
let usedInput = false;
let inputPresses = [];
let removeInputValues = [];
//calls repeatedly on key hold
function onKeyDown(event) {
    switch (event.code) {
        case "KeyW": //W
            if (MovementVector.y != 1) {
                MovementVector.y = 1;
                usedInput = false;
            }
            break;
        case "KeyA": //A
            if (MovementVector.x != -1) {
                MovementVector.x = -1;
                usedInput = false;
            }
            break;
        case "KeyS": //S
            if (MovementVector.y != -1) {
                MovementVector.y = -1;
                usedInput = false;
            }
            break;
        case "KeyD": //D
            if (MovementVector.x != 1) {
                MovementVector.x = 1;
                usedInput = false;
            }
            break;
        default:
            //for other keys add to input presses array
            if (!inputPresses.includes(event.code)) {
                inputPresses.push(event.code);
                usedInput = false;
            }
            break;
    }
}
let clearMap = { xMinus: false, xPlus: false, yMinus: false, yPlus: false };
//calls once on key release
function onKeyUp(event) {
    //clear movement vector if it was registered ingame
    if (usedInput) {
        switch (event.code) {
            case "KeyW":
                if (MovementVector.y == 1)
                    MovementVector.y = 0;
                break;
            case "KeyD":
                if (MovementVector.x == 1)
                    MovementVector.x = 0;
                break;
            case "KeyS":
                if (MovementVector.y == -1)
                    MovementVector.y = 0;
                break;
            case "KeyA":
                if (MovementVector.x == -1)
                    MovementVector.x = 0;
                break;
            default:
                if (inputPresses.includes(event.code))
                    inputPresses.splice(inputPresses.indexOf(event.code), 1);
                break;
        }
        return;
    }
    //if the key was not registered ingame, designate for later removal
    switch (event.code) {
        case "KeyS":
            clearMap.yMinus = true;
            break;
        case "KeyD":
            clearMap.xPlus = true;
            break;
        case "KeyW":
            clearMap.yPlus = true;
            break;
        case "KeyA":
            clearMap.xMinus = true;
            break;
    }
    removeInputValues.push(event.code);
}
//inputs have been used and can be cleared now
function UpdateInput() {
    usedInput = true;
    //clears any movement vector if its designated for clearing
    if (clearMap.xMinus) {
        if (MovementVector.x == -1)
            MovementVector.x = 0;
        clearMap.xMinus = false;
    }
    if (clearMap.xPlus) {
        if (MovementVector.x == 1)
            MovementVector.x = 0;
        clearMap.xPlus = false;
    }
    if (clearMap.yMinus) {
        if (MovementVector.y == -1)
            MovementVector.y = 0;
        clearMap.yMinus = false;
    }
    if (clearMap.yPlus) {
        if (MovementVector.y == 1)
            MovementVector.y = 0;
        clearMap.yPlus = false;
    }
    //removes any keys that were designated for removal
    if (removeInputValues.length > 0) {
        removeInputValues.forEach(value => {
            if (inputPresses.includes(value))
                inputPresses.splice(inputPresses.indexOf(value), 1);
        });
        removeInputValues = [];
    }
}
window.addEventListener("keydown", onKeyDown, false);
window.addEventListener("keyup", onKeyUp, false);
//Mouse
function onMouseDown(event) {
    const mousePos = new Vector2(event.clientX, event.clientY);
    const worldPixelPos = mousePos.subtract(Player.ins.camera.GetCameraOffset().flipY());
    const voxelPos = mousePos.subtract(Player.ins.camera.GetCameraOffset().flipY()).divideAndFloor(Chunk.PixelSize);
    console.log(voxelPos);
    //const color = MapManager.ins.cPlanet.GetDataAt(voxelPos.x, voxelPos.y)?.color;
    //console.log('%c color', `background: ${color?.get()}; color: ${color?.get()}`);
}
function onMouseUp(event) {
}
function onMouseMove(event) {
}
function onMouseWheel(event) {
}
window.addEventListener("mousedown", onMouseDown, false);
window.addEventListener("mouseup", onMouseUp, false);
window.addEventListener("mousemove", onMouseMove, false);
window.addEventListener("wheel", onMouseWheel, false);
/// <reference path="./Player/Player.ts" />
/// <reference path="./Player/InputManager.ts" />
const fps = 60;
async function Main() {
    // Start
    let run = true;
    while (run) {
        // Update loop
        UpdateInput();
        Player.ins.move(MovementVector.multiply(3));
        RenderManager.ins.Draw();
        await new Promise(r => setTimeout(r, 1 / fps));
    }
}
Main();
