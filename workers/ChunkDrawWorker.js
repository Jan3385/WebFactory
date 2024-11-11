this.onmessage = (e) => {
    const { MapData, chunkPosition } = e.data;
    
    let WorkerCanvas = new OffscreenCanvas(MapData.length, MapData[0].length);
    let ctx = WorkerCanvas.getContext('2d', {alpha: false});

    for(let i = 0; i < MapData.length; i++) {
        for(let j = 0; j < MapData[0].length; j++) {
            ctx.fillStyle = GetColorFromBitPack(MapData[i][j].color.color);
            ctx.fillRect(j, i, 1, 1);
        }
    }

    createImageBitmap(WorkerCanvas).then((bitmap) => {
        this.postMessage({ ImageBits: bitmap, chunkPosition: chunkPosition });
    });
};

function GetColorFromBitPack(bitPackedRGB) {
    let r = (bitPackedRGB >> 16) & 0xff;
    let g = (bitPackedRGB >> 8) & 0xff;
    let b = bitPackedRGB & 0xff;
    return `rgb(${r}, ${g}, ${b})`;
}