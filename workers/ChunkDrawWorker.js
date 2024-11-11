this.onmessage = (e) => {
    console.log('sigma');
    const { MapData } = e.data;
    let OffscreenCanvas = new OffscreenCanvas(MapData.length, MapData[0].length);
    let ctx = OffscreenCanvas.getContext('2d');

    for(let i = 0; i < MapData.length; i++) {
        for(let j = 0; j < MapData[0].length; j++) {
            ctx.fillStyle = MapData[i][j].color.get();
            ctx.fillRect(i, j, 1, 1);
        }
    }

    postMessage(OffscreenCanvas);
};