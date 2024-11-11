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
    divide(val) {
        return new Vector2(this.x / val, this.y / val);
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
    static SidesDir = [
        new Vector2(0, 1), new Vector2(-1, 0), new Vector2(1, 0), new Vector2(0, -1)
    ];
    static AroundDir = [
        new Vector2(0, 1), new Vector2(-1, 0), new Vector2(1, 0), new Vector2(0, -1),
        new Vector2(1, 1), new Vector2(-1, 1), new Vector2(1, -1), new Vector2(-1, -1)
    ];
    copy() {
        return new Vector2(this.x, this.y);
    }
}
class rgb {
    color;
    constructor(r, g, b) {
        this.color = rgb.pack(r, g, b);
    }
    static pack(r, g, b) {
        return (r << 16) | (g << 8) | b;
    }
    static unpack(color) {
        return {
            r: (color >> 16) & 0xff,
            g: (color >> 8) & 0xff,
            b: color & 0xff,
        };
    }
    new() {
        const { r, g, b } = rgb.unpack(this.color);
        return new rgb(r, g, b);
    }
    newSlightlyRandom(val) {
        const { r, g, b } = rgb.unpack(this.color);
        return new rgb(clamp(r + Math.floor(Math.random() * val)), clamp(g + Math.floor(Math.random() * val)), clamp(b + Math.floor(Math.random() * val)));
    }
    changeBy(val) {
        const { r, g, b } = rgb.unpack(this.color);
        return new rgb(clamp(r + val), clamp(g + val), clamp(b + val));
    }
    get() {
        const { r, g, b } = rgb.unpack(this.color);
        return `rgb(${r},${g},${b})`;
    }
    darker() {
        const { r, g, b } = rgb.unpack(this.color);
        return new rgb(r / 2, g / 2, b / 2);
    }
    lerp(other, t) {
        const { r, g, b } = rgb.unpack(this.color);
        const { r: or, g: og, b: ob } = rgb.unpack(other.color);
        return new rgb(Math.floor(lerp(r, or, t)), Math.floor(lerp(g, og, t)), Math.floor(lerp(b, ob, t)));
    }
    MixWith(other, t) {
        return this.lerp(other, t);
    }
}
class rgba extends rgb {
    alpha;
    constructor(r, g, b, a) {
        super(r, g, b);
        this.alpha = clamp(a);
    }
    new() {
        const { r, g, b } = rgb.unpack(this.color);
        return new rgba(r, g, b, this.alpha);
    }
    newSlightlyRandom(val) {
        const { r, g, b } = rgb.unpack(this.color);
        return new rgba(clamp(r + Math.floor(Math.random() * val)), clamp(g + Math.floor(Math.random() * val)), clamp(b + Math.floor(Math.random() * val)), this.alpha);
    }
    changeBy(val) {
        const { r, g, b } = rgb.unpack(this.color);
        return new rgba(clamp(r + val), clamp(g + val), clamp(b + val), this.alpha);
    }
    get() {
        const { r, g, b } = rgb.unpack(this.color);
        return `rgba(${r},${g},${b},${this.alpha})`;
    }
    Darker() {
        const { r, g, b } = rgb.unpack(this.color);
        return new rgba(r / 2, g / 2, b / 2, this.alpha);
    }
    MixWith(other, t) {
        const { r, g, b } = rgb.unpack(this.color);
        const { r: or, g: og, b: ob } = rgb.unpack(other.color);
        return new rgba(Math.floor(lerp(r, or, t)), Math.floor(lerp(g, og, t)), Math.floor(lerp(b, ob, t)), Math.floor(lerp(this.alpha, other.alpha, t)));
    }
}
/**
 * Linear interpolation from a to b with t
 */
function lerp(a, b, t) {
    return a + t * (b - a);
}
function clamp(val, min = 0, max = 255) {
    return Math.min(Math.max(val, min), max);
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
        return new GroundData(new rgb(color.r, color.g, color.b));
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
        return new GroundData(new rgb(color.r, color.g, color.b));
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
        this.chunkRender = new OffscreenCanvas(Chunk.ChunkSize, Chunk.ChunkSize);
        this.chunkRenderCtx = this.chunkRender.getContext('2d', { alpha: false });
        const defaultGroundData = new GroundData(new rgb(0, 0, 0));
        for (let y = 0; y < Chunk.ChunkSize; y++) {
            this.data[y] = [];
            for (let x = 0; x < Chunk.ChunkSize; x++) {
                this.data[y][x] = defaultGroundData;
            }
        }
        this.Load();
    }
    Load() {
        for (let y = 0; y < Chunk.ChunkSize; y++) {
            for (let x = 0; x < Chunk.ChunkSize; x++) {
                this.data[y][x] = ValueNoise.valueNoise.GetGroundDataAt(x + this.position.x * Chunk.ChunkSize, y + this.position.y * Chunk.ChunkSize);
            }
        }
        this.PreDrawChunk();
    }
    PreDrawChunk() {
        if (typeof (Worker) !== "undefined") {
            const worker = new Worker('src/workers/ChunkDrawWorker.js');
            worker.postMessage({
                MapData: this.data,
            });
            worker.onmessage = (e) => {
                //returns offscreen canvas
                this.chunkRender = e.data;
            };
        }
        else { //No web worker support..
            for (let y = 0; y < Chunk.ChunkSize; y++) {
                for (let x = 0; x < Chunk.ChunkSize; x++) {
                    this.chunkRenderCtx.fillStyle = this.data[y][x].color.get();
                    this.chunkRenderCtx.fillRect(x, y, 1, 1);
                }
            }
        }
    }
    GetChunkRender() {
        return this.chunkRender;
    }
    DrawChunkExtras(CameraOffset) {
        CameraOffset = CameraOffset.add(this.position.multiply(Chunk.ChunkSize * Chunk.PixelSize));
        //write chunk number on the chunk
        RenderManager.ctx.textAlign = "left";
        RenderManager.ctx.fillStyle = "white";
        RenderManager.ctx.font = "10px Arial";
        RenderManager.ctx.fillText(`(${this.position.x}, ${this.position.y})`, CameraOffset.x, CameraOffset.y + Chunk.ChunkSize * Chunk.PixelSize - 5);
        //draw chunk border
        RenderManager.ctx.strokeStyle = "Blue";
        RenderManager.ctx.lineWidth = 1;
        RenderManager.ctx.strokeRect(CameraOffset.x + 1, CameraOffset.y + 1, this.GetAABB().width * Chunk.PixelSize - 1, this.GetAABB().height * Chunk.PixelSize - 1);
    }
    GetAABB() {
        //return new AABB(this.position.multiply(Chunk.ChunkSize), new Vector2(Chunk.ChunkSize, Chunk.ChunkSize));
        return new AABB(new Vector2(this.position.x * Chunk.ChunkSize, this.position.y * Chunk.ChunkSize), new Vector2(Chunk.ChunkSize, Chunk.ChunkSize));
    }
}
class GroundData {
    color;
    constructor(color) {
        this.color = color;
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
            return chunk.data[y % Chunk.ChunkSize][x % Chunk.ChunkSize];
        }
        return null;
    }
}
/// <reference path="./Planet.ts" />
/// <reference path="./Generation/NoiseGenerator.ts" />
class MapManager {
    //current planet
    cPlanet;
    //all entities - including buildings
    entities = [];
    //only buildings on map
    buildings = [];
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
class InventoryItem {
    item;
    amount;
    slot;
    constructor(item, amount, slot) {
        this.item = item;
        this.amount = amount;
        this.slot = slot;
    }
    static CreateEmpty(slot) {
        return new InventoryItem(null, 0, slot);
    }
    static Swap(a, b) {
        let temp = a.item;
        let temp2 = a.amount;
        a.item = b.item;
        a.amount = b.amount;
        b.item = temp;
        b.amount = temp2;
    }
    delete() {
        this.item = null;
        this.amount = 0;
    }
}
var ItemTag;
(function (ItemTag) {
    ItemTag[ItemTag["None"] = 0] = "None";
    ItemTag[ItemTag["Ingot"] = 1] = "Ingot";
    ItemTag[ItemTag["Ore"] = 2] = "Ore";
    ItemTag[ItemTag["Fuel"] = 4] = "Fuel";
})(ItemTag || (ItemTag = {}));
class ItemGroup {
    items = [];
    itemTag = ItemTag.None;
    includes(item) {
        if (this.items.includes(item))
            return true;
        if (this.itemTag == ItemTag.None)
            return false;
        if ((item.tag & this.itemTag) != 0)
            return true;
        return false;
    }
}
class Inventory {
    items;
    maxItems;
    constructor(maxItems) {
        this.maxItems = maxItems;
        this.items = new Array(maxItems);
        for (let i = 0; i < this.items.length; i++) {
            this.items[i] = InventoryItem.CreateEmpty(i);
        }
    }
    AddItem(item) {
        let FoundItem = false;
        this.items.every(iItem => {
            if (iItem.item == item.item) {
                iItem.amount += item.amount;
                FoundItem = true;
                return false;
            }
            return true;
        });
        if (FoundItem)
            return true;
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].item == null) {
                this.items[i].item = item.item;
                this.items[i].amount = item.amount;
                return true;
            }
        }
        if (this.items.length >= this.maxItems)
            return false;
        this.items.push(item);
        return true;
    }
}
/// <reference path="../Math/AABB.ts" />
/// <reference path="../Player/Inventory.ts" />
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
        this.position = Player.ins.position
            .multiply(Chunk.PixelSize) //world position to screen position
            .add(new Vector2(Chunk.PixelSize / 2, Chunk.PixelSize / 2)); //keeps the player in the center of the screen
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
    HandInventory = new Inventory(1);
    PlayerInventory = new Inventory(12);
    constructor() { }
    move(dir) {
        this.position = this.position.add(dir.multiply(this.Speed));
        this.camera.UpdateCamera();
        //update mouse indicator
        //InputManager.ins.UpdateMouseIndicator();
    }
    setPosition(pos) {
        this.position = pos;
        this.camera.UpdateCamera();
    }
    Draw(CameraOffset) {
        RenderManager.ctx.fillStyle = 'red';
        RenderManager.ctx.fillRect(this.position.x * Chunk.PixelSize + CameraOffset.x, this.position.y * Chunk.PixelSize + CameraOffset.y, Chunk.PixelSize, Chunk.PixelSize);
    }
    GetPlayerGUI() {
        //change how slots are added
        const gui = new BottomClampGUI(window.innerWidth, window.innerHeight)
            .AddSimple(new AABB(new Vector2(0, -100), new Vector2(window.innerWidth, 100)), new rgba(99, 110, 114, 0.5))
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
            .AddSlot(new AABB(new Vector2(1000, -90), new Vector2(80, 80)), this.PlayerInventory.items[11]);
        return gui;
    }
}
class GUI {
    elements;
    interactiveElements;
    AABB;
    constructor(width, height) {
        this.elements = [];
        this.interactiveElements = [];
        this.AABB = new AABB(new Vector2(0, 0), new Vector2(width, height));
        RenderManager.ins.AddGUI(this);
    }
    MoveToMiddleOfScreen() {
        this.AABB.x = 1920 / 2 - this.AABB.width / 2;
        this.AABB.y = 1080 / 2 - this.AABB.height / 2;
    }
    Draw(scale) {
        this.elements.forEach(guiElement => guiElement.Draw(scale, new Vector2(this.AABB.x * scale, this.AABB.y * scale)));
    }
    Close() {
        RenderManager.ins.RemoveGUI(this);
    }
    AddSimple(AABB, color) {
        this.AddElement(new GUISimple(AABB, color));
        return this;
    }
    AddElement(element) {
        element.parent = this;
        this.elements.push(element);
    }
    AddInteractiveElement(element) {
        this.AddElement(element);
        this.interactiveElements.push(element);
    }
    AddText(AABB, text, textSize, textAlign = "left") {
        const element = new GUIText(AABB, text, textSize, textAlign);
        this.AddElement(element);
        return this;
    }
    AddImage(AABB, img) {
        const element = new GUIImage(AABB, img);
        this.AddElement(element);
        return this;
    }
    AddButton(AABB, text, onClick) {
        const button = new GUIButton(AABB, text, onClick);
        this.AddInteractiveElement(button);
        return this;
    }
    AddImageButton(AABB, img, onClick) {
        const button = new GUIImageButton(AABB, img, onClick);
        this.AddInteractiveElement(button);
        return this;
    }
    AddSlot(AABB, Item) {
        const slot = new GUISlot(AABB, Item);
        this.AddInteractiveElement(slot);
        return this;
    }
    AddTopBar(Header) {
        this.AddSimple(new AABB(new Vector2(0, -30), new Vector2(this.AABB.width, 25)), new rgba(255, 255, 255, 0.5));
        this.AddText(new AABB(new Vector2(10, -10), new Vector2(100, 20)), Header, 20);
        const closeButtonImage = new Image();
        closeButtonImage.src = "Images/GUI/x.png";
        this.AddImageButton(new AABB(new Vector2(this.AABB.width - 25, -27.5), new Vector2(20, 20)), closeButtonImage, () => this.Close());
        return this;
    }
    static GetGUIScale() {
        return Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    }
    static ForClickedGUIs(mousePos, callback) {
        RenderManager.ins.ActiveGUIs.forEach(gui => {
            const GUIScale = gui instanceof BottomClampGUI ? 1 : GUI.GetGUIScale();
            gui.interactiveElements.every(element => {
                if (element.GetOnScreenAABB(GUIScale).isDotInside(mousePos.x, mousePos.y)) {
                    if (element instanceof GUISlot) {
                        callback(element);
                        //once handeled a collision, exit
                        return false;
                    }
                    else if (IsInteractable(element)) {
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
class BuildingGUI extends GUI {
    BackgroundImage;
    constructor(width, height) {
        super(width, height);
        this.BackgroundImage = new Image();
        this.SetBackground("Default");
        this.MoveToMiddleOfScreen();
    }
    Draw(scale) {
        //draw background
        this.DrawBackground9Slice(scale, 16);
        this.elements.forEach(guiElement => guiElement.Draw(scale, new Vector2(this.AABB.x * scale, this.AABB.y * scale)));
    }
    DrawBackgroundStretch(scale) {
        RenderManager.ctx.drawImage(this.BackgroundImage, this.AABB.x * scale, this.AABB.y * scale, this.AABB.width * scale, this.AABB.height * scale);
    }
    DrawBackground9Slice(scale, border, pixelScale = 4) {
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
    SetBackground(backgroundName) {
        this.BackgroundImage = new Image();
        this.BackgroundImage.src = `Images/GUI/Backgrounds/${backgroundName}.png`;
        return this;
    }
}
class BottomClampGUI extends GUI {
    constructor(width, height) {
        super(width, height);
        this.MoveToBottomOfScreen();
    }
    MoveToBottomOfScreen() {
        this.AABB.y = window.innerHeight;
        this.AABB.height = window.innerHeight;
        this.AABB.width = window.innerWidth;
        this.elements.forEach(element => {
            //assume that every element with a width at least half of curret width is supposted to fill the screen
            if (element.AABB.width > window.innerWidth * 0.5) {
                element.AABB.width = window.innerWidth;
            }
        });
    }
    Draw(scale) {
        this.MoveToBottomOfScreen();
        super.Draw(1);
    }
}
class GUIElement {
    AABB = new AABB(new Vector2(0, 0), new Vector2(1, 1));
    parent = null;
    GetOnScreenAABB(scale) {
        return new AABB(new Vector2(this.AABB.x * scale + this.parent.AABB.x * scale, this.AABB.y * scale + this.parent.AABB.y * scale), new Vector2(this.AABB.width * scale, this.AABB.height * scale));
    }
}
class GUISimple extends GUIElement {
    color;
    constructor(AABB, color) {
        super();
        this.AABB = AABB;
        this.color = color;
    }
    Draw(scale, offset) {
        RenderManager.ctx.fillStyle = this.color.get();
        RenderManager.ctx.fillRect(this.AABB.x * scale + offset.x, this.AABB.y * scale + offset.y, this.AABB.width * scale, this.AABB.height * scale);
    }
}
class GUIText extends GUIElement {
    text;
    textSize;
    textAlign;
    constructor(AABB, text, textSize = 20, textAlign = "left") {
        super();
        this.AABB = AABB;
        this.text = text;
        this.textSize = textSize;
        this.textAlign = textAlign;
    }
    Draw(scale, offset) {
        RenderManager.ctx.fillStyle = "white";
        RenderManager.ctx.textAlign = this.textAlign;
        RenderManager.ctx.font = `${this.textSize * scale}px Tiny5`;
        RenderManager.ctx.fillText(this.text, this.AABB.x * scale + offset.x, this.AABB.y * scale + offset.y);
    }
}
class GUIImage extends GUIElement {
    img;
    constructor(AABB, img) {
        super();
        this.AABB = AABB;
        this.img = img;
    }
    Draw(scale, offset) {
        RenderManager.ctx.drawImage(this.img, this.AABB.x * scale, this.AABB.y * scale, this.AABB.width * scale, this.AABB.height * scale);
    }
}
function IsInteractable(element) {
    return element.OnClick !== undefined;
}
class GUIInteractable extends GUIElement {
    onClick;
    constructor(AABB, onClick) {
        super();
        this.AABB = AABB;
        this.onClick = onClick;
    }
    OnClick() {
        this.onClick();
    }
}
class GUIButton extends GUIInteractable {
    text;
    constructor(AABB, text, onClick) {
        super(AABB, onClick);
        this.text = text;
    }
    Draw(scale, offset) {
        RenderManager.ctx.fillStyle = "white";
        RenderManager.ctx.fillRect(this.AABB.x * scale + offset.x, this.AABB.y * scale + offset.y, this.AABB.width * scale, this.AABB.height * scale);
        RenderManager.ctx.save();
        RenderManager.ctx.textAlign = "center";
        RenderManager.ctx.fillStyle = "black";
        RenderManager.ctx.font = "20px Tiny5";
        RenderManager.ctx.fillText(this.text, this.AABB.x * scale + offset.x + this.AABB.width / 2 + 1, this.AABB.y * scale + offset.y + this.AABB.height / 2 + 6);
        RenderManager.ctx.restore();
    }
}
class GUIImageButton extends GUIInteractable {
    img;
    constructor(AABB, img, onClick) {
        super(AABB, onClick);
        this.img = img;
    }
    Draw(scale, offset) {
        RenderManager.ctx.drawImage(this.img, this.AABB.x * scale + offset.x, this.AABB.y * scale + offset.y, this.AABB.width * scale, this.AABB.height * scale);
    }
}
class GUISlot extends GUIElement {
    itemInSlot;
    static InventoryItemOffset = 4;
    static InventorySlotImage;
    constructor(AABB, itemInSlot) {
        super();
        this.AABB = AABB;
        this.itemInSlot = itemInSlot;
        if (!GUISlot.InventorySlotImage) {
            GUISlot.InventorySlotImage = new Image();
            GUISlot.InventorySlotImage.src = "Images/GUI/ItemSlot.png";
        }
    }
    Draw(scale, offset) {
        //draw slot
        RenderManager.ctx.drawImage(GUISlot.InventorySlotImage, this.AABB.x * scale + offset.x, this.AABB.y * scale + offset.y, this.AABB.width * scale, this.AABB.height * scale);
        //draw item if not null
        if (this.itemInSlot && this.itemInSlot.item) {
            RenderManager.ctx.drawImage(this.itemInSlot.item.image, this.AABB.x * scale + offset.x + GUISlot.InventoryItemOffset / 2, this.AABB.y * scale + offset.y + GUISlot.InventoryItemOffset / 2, this.AABB.width * scale - GUISlot.InventoryItemOffset, this.AABB.height * scale - GUISlot.InventoryItemOffset);
            //draw amount
            if (this.itemInSlot.amount > 1) {
                RenderManager.ctx.strokeStyle = "black";
                RenderManager.ctx.fillStyle = "white";
                RenderManager.ctx.textAlign = "right";
                RenderManager.ctx.font = "20px Tiny5";
                RenderManager.ctx.lineWidth = 5;
                //outline
                RenderManager.ctx.strokeText(this.itemInSlot.amount.toString(), this.AABB.x * scale + offset.x + this.AABB.width * scale - GUISlot.InventoryItemOffset / 2 - 3, this.AABB.y * scale + offset.y + this.AABB.height * scale - GUISlot.InventoryItemOffset / 2 - 6);
                //fill text
                RenderManager.ctx.fillText(this.itemInSlot.amount.toString(), this.AABB.x * scale + offset.x + this.AABB.width * scale - GUISlot.InventoryItemOffset / 2 - 3, this.AABB.y * scale + offset.y + this.AABB.height * scale - GUISlot.InventoryItemOffset / 2 - 6);
            }
        }
    }
    OnClick() {
        this.itemInSlot.item = GetItem(ItemType.IronIngot);
    }
}
/// <reference path="./Math/Math.ts" />
/// <reference path="./Map/MapManager.ts" />
/// <reference path="./Player/Player.ts" />
/// <reference path="./Player/GUI.ts" />
class RenderManager {
    static canvas;
    static ctx;
    static ins;
    ActiveGUIs = [];
    constructor() {
        RenderManager.canvas = document.getElementById('GameCanvas');
        RenderManager.ctx = RenderManager.canvas.getContext('2d', { alpha: false });
        RenderManager.ins = this;
        window.addEventListener('resize', this.OnWindowResize);
        this.OnWindowResize();
        this.IndicatorImg.src = "images/indicators/MouseIndicator.png";
    }
    PreviousCameraOffset = Player.ins.camera.GetCameraOffset();
    PreviousCameraAABB = Player.ins.camera.AABB.copy();
    Draw() {
        const FrameOffset = Player.ins.camera.GetCameraOffset().subtract(this.PreviousCameraOffset);
        const cameraOffset = Player.ins.camera.GetCameraOffset();
        //draw chunks
        MapManager.ins.cPlanet.Chunks.forEach(chunk => {
            const chunkRender = chunk.GetChunkRender();
            RenderManager.ctx.drawImage(chunkRender, chunk.position.x * Chunk.ChunkSize * Chunk.PixelSize + cameraOffset.x, chunk.position.y * Chunk.ChunkSize * Chunk.PixelSize + cameraOffset.y, Chunk.ChunkSize * Chunk.PixelSize, Chunk.ChunkSize * Chunk.PixelSize);
            chunk.DrawChunkExtras(cameraOffset);
        });
        //draw entities
        MapManager.ins.entities.forEach(entity => entity.Draw(cameraOffset));
        Player.ins.Draw(Player.ins.camera.GetCameraOffset());
        this.RenderMouseIndicator(InputManager.ins.mousePos);
        //render GUI
        const GUIScale = GUI.GetGUIScale();
        this.ActiveGUIs.forEach(gui => gui.Draw(GUIScale));
        this.PreviousCameraAABB = Player.ins.camera.AABB.copy();
        this.PreviousCameraOffset = Player.ins.camera.GetCameraOffset();
        //rener item on cursor
        if (Player.ins.HandInventory.items[0].item != null) {
            const item = Player.ins.HandInventory.items[0];
            const ItemScale = GUIScale * 80;
            RenderManager.ctx.drawImage(item.item.image, InputManager.ins.mousePos.x - ItemScale / 2, InputManager.ins.mousePos.y - ItemScale / 2, ItemScale, ItemScale);
            if (item.amount > 1) {
                RenderManager.ctx.strokeStyle = "black";
                RenderManager.ctx.fillStyle = "white";
                RenderManager.ctx.textAlign = "right";
                RenderManager.ctx.font = "15px Tiny5";
                RenderManager.ctx.lineWidth = 5;
                //outline
                RenderManager.ctx.strokeText(item.amount.toString(), InputManager.ins.mousePos.x + ItemScale / 2, InputManager.ins.mousePos.y + ItemScale / 2);
                //fill text
                RenderManager.ctx.fillText(item.amount.toString(), InputManager.ins.mousePos.x + ItemScale / 2, InputManager.ins.mousePos.y + ItemScale / 2);
            }
        }
    }
    OnWindowResize() {
        RenderManager.canvas.width = window.innerWidth;
        RenderManager.canvas.height = window.innerHeight;
        RenderManager.ins.Draw();
        RenderManager.ctx.imageSmoothingEnabled = false;
    }
    IndicatorImg = new Image(Chunk.PixelSize, Chunk.PixelSize);
    RenderMouseIndicator(pos) {
        const camOffset = Player.ins.camera.GetCameraOffset();
        const worldPos = pos.subtract(camOffset).divide(Chunk.PixelSize);
        const EntityMouseIndex = Entity.IsInsideEntity(worldPos);
        if (EntityMouseIndex != -1) {
            const entity = MapManager.ins.entities[EntityMouseIndex];
            this.DrawIndicator(new AABB(new Vector2(entity.position.x * Chunk.PixelSize + camOffset.x, entity.position.y * Chunk.PixelSize + camOffset.y), new Vector2(entity.AABB.width * Chunk.PixelSize, entity.AABB.height * Chunk.PixelSize)));
            return;
        }
        else {
            const voxelPos = pos.subtract(camOffset).divideAndFloor(Chunk.PixelSize);
            this.DrawIndicator(new AABB(new Vector2(voxelPos.x * Chunk.PixelSize + camOffset.x, voxelPos.y * Chunk.PixelSize + camOffset.y), new Vector2(Chunk.PixelSize, Chunk.PixelSize)));
        }
    }
    DrawIndicator(at) {
        RenderManager.ctx.drawImage(this.IndicatorImg, at.x, at.y, at.width, at.height);
    }
    AddGUI(gui) {
        this.ActiveGUIs.push(gui);
    }
    RemoveGUI(gui) {
        const index = this.ActiveGUIs.indexOf(gui);
        if (index > -1)
            this.ActiveGUIs.splice(index, 1);
    }
    CloseAllGUIs() {
        this.ActiveGUIs.forEach(gui => gui.Close());
    }
    GetPlayerGUI() {
        return this.ActiveGUIs.find(gui => gui instanceof BottomClampGUI);
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
/// <reference path="../Player/Inventory.ts" />
class InputManager {
    static ins = new InputManager();
    MovementVector;
    usedInput;
    inputPresses;
    removeInputValues;
    clearMap;
    constructor() {
        this.MovementVector = new Vector2(0, 0);
        this.usedInput = false;
        this.inputPresses = [];
        this.removeInputValues = [];
        this.clearMap = { xMinus: false, xPlus: false, yMinus: false, yPlus: false };
        this.mousePos = new Vector2(0, 0);
        window.addEventListener("keydown", this.onKeyDown, false);
        window.addEventListener("keyup", this.onKeyUp, false);
        window.addEventListener("mousedown", this.onMouseDown, false);
        window.addEventListener("mouseup", this.onMouseUp, false);
        window.addEventListener("mousemove", this.onMouseMove, false);
        window.addEventListener("wheel", this.onMouseWheel, false);
        //disables right click context menu
        window.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        }, false);
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
        /*  Mouse Events
         * 0 - left click, 1 - middle click, 2 - right click, 3 - back, 4 - forward
        */
        switch (event.button) {
            case 0:
                InputManager.ins.OnLeftClick(event);
                break;
            case 2:
                InputManager.ins.OnRightClick(event);
                break;
        }
    }
    OnLeftClick(event) {
        const mousePos = new Vector2(event.clientX, event.clientY);
        const worldPos = mousePos.subtract(Player.ins.camera.GetCameraOffset()).divide(Chunk.PixelSize);
        const voxelPos = mousePos.subtract(Player.ins.camera.GetCameraOffset()).divideAndFloor(Chunk.PixelSize);
        /*
        console.log(voxelPos);
        const color = MapManager.ins.cPlanet.GetDataAt(voxelPos.x, voxelPos.y)?.color;
        console.log('%c color', `background: ${color?.get()}; color: ${color?.get()}`);
        */
        //check if item was clicked
        MapManager.ins.entities.every(entity => {
            if (entity instanceof EntityItem && entity.AABB.isDotInside(worldPos.x, worldPos.y)) {
                entity.OnClick();
                return false;
            }
            return true;
        });
        //check if any GUI element was clicked
        GUI.ForClickedGUIs(mousePos, (element) => {
            if (element instanceof GUISlot) {
                if (event.shiftKey) { //shift click item into player inventory
                    if (element.parent == RenderManager.ins.GetPlayerGUI())
                        return;
                    Player.ins.PlayerInventory.AddItem(element.itemInSlot);
                    element.itemInSlot.delete();
                }
                else if (Player.ins.HandInventory.items[0].item == element.itemInSlot.item) { //if item is the same, add to the clicked slot
                    element.itemInSlot.amount += Player.ins.HandInventory.items[0].amount;
                    Player.ins.HandInventory.items[0].delete();
                }
                else {
                    InventoryItem.Swap(Player.ins.HandInventory.items[0], element.itemInSlot); //if player has a different item in hand, swap
                }
            }
            else if (IsInteractable(element)) {
                element.OnClick();
            }
        });
        MapManager.ins.buildings.every(building => {
            if (building.AABB.isDotInside(voxelPos.x + .5, voxelPos.y + .5)) {
                building.OnClick();
                //once handeled a collision, exit
                return false;
            }
            return true;
        });
    }
    OnRightClick(event) {
        console.log("Right Click");
        const mousePos = new Vector2(event.clientX, event.clientY);
        const worldPos = mousePos.subtract(Player.ins.camera.GetCameraOffset()).divide(Chunk.PixelSize);
        const voxelPos = mousePos.subtract(Player.ins.camera.GetCameraOffset()).divideAndFloor(Chunk.PixelSize);
        GUI.ForClickedGUIs(mousePos, (element) => {
            if (element instanceof GUISlot) {
                if (Player.ins.HandInventory.items[0].item == element.itemInSlot.item) {
                    Player.ins.HandInventory.items[0].amount += Math.floor(element.itemInSlot.amount / 2);
                    element.itemInSlot.amount = Math.ceil(element.itemInSlot.amount / 2);
                }
                else {
                    if (Math.floor(element.itemInSlot.amount / 2) == 0)
                        return;
                    Player.ins.HandInventory.items[0].item = element.itemInSlot.item;
                    Player.ins.HandInventory.items[0].amount = Math.floor(element.itemInSlot.amount / 2);
                    element.itemInSlot.amount = Math.ceil(element.itemInSlot.amount / 2);
                }
            }
        });
    }
    onMouseUp(event) {
    }
    mousePos;
    onMouseMove(event) {
        InputManager.ins.mousePos = new Vector2(event.clientX, event.clientY);
        const voxelPos = InputManager.ins.mousePos.subtract(Player.ins.camera.GetCameraOffset()).divideAndFloor(Chunk.PixelSize);
        //InputManager.ins.UpdateMouseIndicator(mousePos); //already done by player move
    }
    onMouseWheel(event) {
        const WheelDir = event.deltaY > 0 ? -1 : 1;
        Chunk.PixelSize = clamp(Chunk.PixelSize + WheelDir, 6, 30);
    }
}
/// <reference path="../../Player/Inventory.ts" />
class Entity {
    AABB;
    position;
    texture = null;
    renderLayer;
    constructor(position, size, renderLayer = 0) {
        this.position = position;
        this.renderLayer = renderLayer;
        this.AABB = new AABB(position.subtract(size.divideAndFloor(2)), size);
        Entity.AddEntity(this);
    }
    static AddEntity(entity) {
        for (let i = 0; i < MapManager.ins.entities.length; i++) {
            if (MapManager.ins.entities[i].renderLayer > entity.renderLayer) {
                MapManager.ins.entities.splice(i, 0, entity);
                return;
            }
        }
        MapManager.ins.entities.push(entity);
    }
    SetTexture(texture) {
        this.texture = new Image(this.AABB.width * Chunk.PixelSize, this.AABB.height * Chunk.PixelSize);
        this.texture.src = "Images/Entities/" + texture + ".png";
    }
    /*
    * offsets by half a block
    */
    static GetAt(pos) {
        return MapManager.ins.entities.filter(entity => entity.AABB.isDotInside(pos.x + .5, pos.y + .5));
    }
    static GetAtPrecise(pos) {
        return MapManager.ins.entities.filter(entity => entity.AABB.isDotInside(pos.x, pos.y));
    }
    destroy() {
        MapManager.ins.entities.splice(MapManager.ins.entities.indexOf(this), 1);
    }
    //returns -1 if no entity found, else returns entity index
    static IsInsideEntity(pos) {
        for (let i = MapManager.ins.entities.length - 1; i >= 0; i--) {
            if (MapManager.ins.entities[i].AABB.isDotInside(pos.x, pos.y))
                return i;
        }
        return -1;
    }
}
class Building extends Entity {
    constructor(position, size) {
        super(position, size);
        MapManager.ins.buildings.push(this);
    }
    destroy() {
        MapManager.ins.buildings.splice(MapManager.ins.buildings.indexOf(this), 1);
        super.destroy();
    }
    /*
    * offsets by half a block
    */
    static GetAt(pos) {
        return MapManager.ins.buildings.filter(entity => entity.AABB.isDotInside(pos.x + .5, pos.y + .5));
    }
    static GetAtPrecise(pos) {
        return MapManager.ins.buildings.filter(entity => entity.AABB.isDotInside(pos.x, pos.y));
    }
    Draw(cameraOffset) {
        if (this.texture == null) {
            console.error(`Entity at ${this.position.x}x ${this.position.y}y: texture is null`);
            return;
        }
        ;
        RenderManager.ctx.drawImage(this.texture, this.position.x * Chunk.PixelSize + cameraOffset.x, this.position.y * Chunk.PixelSize + cameraOffset.y, this.AABB.width * Chunk.PixelSize, this.AABB.height * Chunk.PixelSize);
    }
}
class InventoryBuilding extends Building {
}
class Smelter extends InventoryBuilding {
    Inventory;
    constructor(position, size) {
        super(position, size);
        this.Inventory = new Inventory(2);
        this.Inventory.AddItem(new InventoryItem(GetItem(ItemType.CopperOre), 1, 0));
        this.Inventory.AddItem(new InventoryItem(GetItem(ItemType.IronPlate), 3, 1));
    }
    Act(deltaTime) {
    }
    OnClick() {
        this.OpenGUI();
    }
    OpenGUI() {
        const gui = new BuildingGUI(800, 400)
            .AddTopBar("Smelter!")
            .AddText(new AABB(new Vector2(400, 60), new Vector2(200, 10)), "Smelter", 40, "center")
            .AddSlot(new AABB(new Vector2(80, 150), new Vector2(100, 100)), this.Inventory.items[0])
            .AddSlot(new AABB(new Vector2(620, 150), new Vector2(100, 100)), this.Inventory.items[1]);
        return gui;
    }
    GetOutputItems() {
        throw new Error("Method not implemented.");
    }
    GetInputItems() {
        throw new Error("Method not implemented.");
    }
    GetWantedItems() {
        throw new Error("Method not implemented.");
    }
    AddInputItem(item) {
        throw new Error("Method not implemented.");
    }
}
class EntityItem extends Entity {
    item;
    static ITEM_SIZE = new Vector2(0.9, 0.9); // 1,1 = 1 block
    constructor(position, item) {
        super(position, EntityItem.ITEM_SIZE, 5);
        this.item = item;
    }
    Draw(cameraOffset) {
        RenderManager.ctx.drawImage(this.item.image, this.position.x * Chunk.PixelSize + cameraOffset.x, this.position.y * Chunk.PixelSize + cameraOffset.y, this.AABB.width * Chunk.PixelSize, this.AABB.height * Chunk.PixelSize);
    }
    OnClick() {
        Player.ins.PlayerInventory.AddItem(new InventoryItem(this.item, 1, 0));
        this.destroy();
    }
}
var ItemType;
(function (ItemType) {
    ItemType[ItemType["IronOre"] = 0] = "IronOre";
    ItemType[ItemType["IronIngot"] = 1] = "IronIngot";
    ItemType[ItemType["CopperOre"] = 2] = "CopperOre";
    ItemType[ItemType["CopperIngot"] = 3] = "CopperIngot";
    ItemType[ItemType["IronPlate"] = 4] = "IronPlate";
    ItemType[ItemType["Coal"] = 5] = "Coal";
})(ItemType || (ItemType = {}));
const ITEM_ICON_PREFIX = "Images/Items/";
const Items = {
    [ItemType.IronOre]: {
        name: "Iron Ore",
        image: new Image(32, 32),
        description: "A chunk of iron ore",
        weight: 1,
        tag: ItemTag.Ore,
    },
    [ItemType.IronIngot]: {
        name: "Iron Ingot",
        image: new Image(32, 32),
        description: "A bar of iron",
        weight: 1,
        tag: ItemTag.Ingot,
    },
    [ItemType.CopperOre]: {
        name: "Copper Ore",
        image: new Image(32, 32),
        description: "A chunk of copper ore",
        weight: 1,
        tag: ItemTag.Ore,
    },
    [ItemType.CopperIngot]: {
        name: "Copper Ingot",
        image: new Image(32, 32),
        description: "A bar of copper",
        weight: 1,
        tag: ItemTag.Ingot,
    },
    [ItemType.IronPlate]: {
        name: "Iron Plate",
        image: new Image(32, 32),
        description: "A plate of iron",
        weight: 1,
        tag: ItemTag.None,
    },
    [ItemType.Coal]: {
        name: "Coal",
        image: new Image(32, 32),
        description: "A chunk of coal",
        weight: 1,
        tag: ItemTag.Fuel,
    },
};
function GetItem(type) {
    return Items[type];
}
function LoadItems() {
    for (let i = 0; i < Object.keys(Items).length; i++) {
        GetItem(i).image.src = ITEM_ICON_PREFIX + GetItem(i).name.replace(/\s+/g, '_').toLowerCase() + ".png"; //replace spaces with underscores and find item image
    }
}
/// <reference path="./Player/Player.ts" />
/// <reference path="./Player/InputManager.ts" />
/// <reference path="./Map/Entities/Entity.ts" />
/// <reference path="./Map/Entities/Buildings/Smelter.ts" />
/// <reference path="./Map/Items/Item.ts" />
const fps = 50;
async function Main() {
    // Start
    LoadItems();
    Player.ins.move(new Vector2(0, 0)); //updates chunks and moves player
    new RenderManager();
    Player.ins.GetPlayerGUI(); //Generates player GUI
    //temp
    const a = new Smelter(new Vector2(1, 1), new Vector2(1, 1));
    a.SetTexture("SigmaMachine");
    const b = new Smelter(new Vector2(3, 2), new Vector2(1, 1));
    b.SetTexture("SigmaMachine");
    const c = new EntityItem(new Vector2(2.5, 2), GetItem(ItemType.CopperOre));
    const d = new EntityItem(new Vector2(5, 2), GetItem(ItemType.CopperIngot));
    const e = new EntityItem(new Vector2(6, 2), GetItem(ItemType.IronPlate));
    const f = new EntityItem(new Vector2(7, 2), GetItem(ItemType.Coal));
    let run = true;
    while (run) {
        // Update loop
        let startTime = performance.now();
        InputManager.ins.UpdateInput();
        Player.ins.move(InputManager.ins.MovementVector); //updates chunks and moves player   
        RenderManager.ins.Draw(); // draws everything
        let endTime = performance.now();
        const executionTime = endTime - startTime;
        //TODO: deltatime
        if (executionTime > 16)
            console.log("Lag spike! wait time designated for:", (1 / fps * 1000) - executionTime);
        await new Promise(r => setTimeout(r, Math.max((1 / fps * 1000) - executionTime, 0)));
    }
}
Main();
