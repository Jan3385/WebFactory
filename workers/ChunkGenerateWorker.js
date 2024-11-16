this.onmessage = (e) => {
    const { chunkPosition, chunkSize, ValueNoiseGenerator, PerlinNoiseGenerator } = e.data;

    let MapData = [];
    console.log(ValueNoiseGenerator);
    for(let y = 0; y < chunkSize; y++){
        MapData[y] = [];
    }

    for(let y = 0; y < chunkSize; y++){
            for(let x = 0; x < chunkSize; x++){
                MapData[y][x] = ValueNoiseGenerator.GetGroundDataAt(x + chunkPosition.x * chunkSize, y + chunkPosition.y * chunkSize);
            }
        }

    this.postMessage({ GroundData: MapData, chunkPosition: chunkPosition });
};
class GroundData {
    color;
    constructor(color) {
        this.color = color;
    }
}