self.onmessage = function(event) {
    const { cameraAABB, chunkSize, existingChunks } = event.data;
    let newChunks = [];

    for (let x = Math.floor(cameraAABB.x / chunkSize); x <= Math.floor((cameraAABB.x + cameraAABB.width) / chunkSize); x += 1) {
        for (let y = Math.floor(cameraAABB.y / chunkSize); y <= Math.floor((cameraAABB.y + cameraAABB.height) / chunkSize); y += 1) {
            const chunkPos = { x: x, y: y };

            // Check if chunk already exists
            if (!existingChunks.some(chunk => chunk.x === chunkPos.x && chunk.y === chunkPos.y)) {
                newChunks.push({ position: chunkPos }); // remaje lol
            }
        }
    }
    // Send the new chunks back to the main thread
    self.postMessage(newChunks);
};