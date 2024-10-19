/// <reference path="../Math/Math.ts" />

let MovementVector: Vector2 = new Vector2(0, 0);

let usedInput: boolean = false;
let inputPresses: string[] = [];
let removeInputValues: string[] = [];

//calls repeatedly on key hold
function onKeyDown(event: KeyboardEvent){
    switch(event.code){
        case "KeyW": //W
            if(MovementVector.y != 1){
                MovementVector.y = 1;
                usedInput = false;
         }
            break;
        case "KeyA": //A
            if(MovementVector.x != -1){
                MovementVector.x = -1;
                usedInput = false;
            }
            break;
        case "KeyS": //S
            if(MovementVector.y != -1){
                MovementVector.y = -1;
                usedInput = false;
            }
            break;
        case "KeyD": //D
            if(MovementVector.x != 1){
                MovementVector.x = 1;
                usedInput = false;
            }
            break;
        default:
            //for other keys add to input presses array
            if(!inputPresses.includes(event.code)){
                inputPresses.push(event.code);
                usedInput = false;
            }
            break;
    }
}
let clearMap =  {xMinus: false, xPlus: false, yMinus: false, yPlus: false};
//calls once on key release
function onKeyUp(event: KeyboardEvent){
    //clear movement vector if it was registered ingame
    if(usedInput){
        switch(event.code){
            case "KeyW":
                if(MovementVector.y == 1) MovementVector.y = 0;
                break;
            case "KeyD":
                if(MovementVector.x == 1) MovementVector.x = 0;
                break;
            case "KeyS":
                if(MovementVector.y == -1) MovementVector.y = 0;
                break;
            case "KeyA":
                if(MovementVector.x == -1) MovementVector.x = 0;
                break;
            default:
                if(inputPresses.includes(event.code)) inputPresses.splice(inputPresses.indexOf(event.code), 1);
                break;
        }
        return;
    }

    //if the key was not registered ingame, designate for later removal
    switch(event.code){
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
function UpdateInput(){
    usedInput = true;
    //clears any movement vector if its designated for clearing
    if(clearMap.xMinus) {
        if(MovementVector.x == -1) MovementVector.x = 0;
        clearMap.xMinus = false;
    }
    if(clearMap.xPlus) {
        if(MovementVector.x == 1) MovementVector.x = 0;
        clearMap.xPlus = false;
    }
    if(clearMap.yMinus) {
        if(MovementVector.y == -1) MovementVector.y = 0;
        clearMap.yMinus = false;
    }
    if(clearMap.yPlus) {
        if(MovementVector.y == 1) MovementVector.y = 0;
        clearMap.yPlus = false;
    }

    //removes any keys that were designated for removal
    if(removeInputValues.length > 0){
        removeInputValues.forEach(value => {
            if(inputPresses.includes(value)) inputPresses.splice(inputPresses.indexOf(value), 1);
        });
        removeInputValues = [];
    } 
}

window.addEventListener("keydown", onKeyDown, false);
window.addEventListener("keyup", onKeyUp, false);

//Mouse

function onMouseDown(event: MouseEvent){
    const mousePos: Vector2 = new Vector2(event.clientX, event.clientY);
    const worldPixelPos: Vector2 =  mousePos.subtract(Player.ins.camera.GetCameraOffset());
    const voxelPos: Vector2 = mousePos.subtract(Player.ins.camera.GetCameraOffset()).divideAndFloor(Chunk.PixelSize);
    const chunkPos: Vector2 = voxelPos.divideAndFloor(Chunk.ChunkSize);

    console.log(voxelPos);

    const color = MapManager.ins.cPlanet.GetDataAt(voxelPos.x, voxelPos.y)?.color;
    console.log('%c color', `background: ${color?.get()}; color: ${color?.get()}`);
}
function onMouseUp(event: MouseEvent){
    
}
function onMouseMove(event: MouseEvent){

}  
function onMouseWheel(event: WheelEvent){
    
}

window.addEventListener("mousedown", onMouseDown, false);
window.addEventListener("mouseup", onMouseUp, false);
window.addEventListener("mousemove", onMouseMove, false);
window.addEventListener("wheel", onMouseWheel, false);