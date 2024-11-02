/// <reference path="../Math/Math.ts" />

class InputManager{
    public static ins: InputManager = new InputManager();
    public MovementVector: Vector2;

    public usedInput: boolean;
    public inputPresses: string[];
    public removeInputValues: string[];

    public clearMap: {xMinus: boolean, xPlus: boolean, yMinus: boolean, yPlus: boolean};

    public mouseIndicatorPos: Vector2;

    constructor() {
        this.MovementVector = new Vector2(0, 0);
        this.usedInput = false;
        this.inputPresses = [];
        this.removeInputValues = [];

        this.clearMap = {xMinus: false, xPlus: false, yMinus: false, yPlus: false};

        this.mouseIndicatorPos = new Vector2(0, 0);

        window.addEventListener("keydown", this.onKeyDown, false);
        window.addEventListener("keyup", this.onKeyUp, false);

        window.addEventListener("mousedown", this.onMouseDown, false);
        window.addEventListener("mouseup", this.onMouseUp, false);
        window.addEventListener("mousemove", this.onMouseMove, false);
        window.addEventListener("wheel", this.onMouseWheel, false);
    }

    //calls repeatedly on key hold
    onKeyDown(event: KeyboardEvent){
        switch(event.code){
            case "KeyW": //W
                if(InputManager.ins.MovementVector.y != -1){
                    InputManager.ins.MovementVector.y = -1;
                    InputManager.ins.usedInput = false;
            }
                break;
            case "KeyA": //A
                if(InputManager.ins.MovementVector.x != -1){
                    InputManager.ins.MovementVector.x = -1;
                    InputManager.ins.usedInput = false;
                }
                break;
            case "KeyS": //S
                if(InputManager.ins.MovementVector.y != 1){
                    InputManager.ins.MovementVector.y = 1;
                    InputManager.ins.usedInput = false;
                }
                break;
            case "KeyD": //D
                if(InputManager.ins.MovementVector.x != 1){
                    InputManager.ins.MovementVector.x = 1;
                    InputManager.ins.usedInput = false;
                }
                break;
            default:
                //for other keys add to input presses array
                if(!InputManager.ins.inputPresses.includes(event.code)){
                    InputManager.ins.inputPresses.push(event.code);
                    InputManager.ins.usedInput = false;
                }
                break;
        }
    }
    //calls once on key release
    onKeyUp(event: KeyboardEvent){
        //clear movement vector if it was registered ingame
        if(InputManager.ins.usedInput){
            switch(event.code){
                case "KeyW":
                    if(InputManager.ins.MovementVector.y == -1) InputManager.ins.MovementVector.y = 0;
                    break;
                case "KeyD":
                    if(InputManager.ins.MovementVector.x == 1) InputManager.ins.MovementVector.x = 0;
                    break;
                case "KeyS":
                    if(InputManager.ins.MovementVector.y == 1) InputManager.ins.MovementVector.y = 0;
                    break;
                case "KeyA":
                    if(InputManager.ins.MovementVector.x == -1) InputManager.ins.MovementVector.x = 0;
                    break;
                default:
                    if(InputManager.ins.inputPresses.includes(event.code)) InputManager.ins.inputPresses.splice(InputManager.ins.inputPresses.indexOf(event.code), 1);
                    break;
            }
            return;
        }

        //if the key was not registered ingame, designate for later removal
        switch(event.code){
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
    UpdateInput(){
        InputManager.ins.usedInput = true;
        //clears any movement vector if its designated for clearing
        if(InputManager.ins.clearMap.xMinus) {
            if(InputManager.ins.MovementVector.x == -1) InputManager.ins.MovementVector.x = 0;
            InputManager.ins.clearMap.xMinus = false;
        }
        if(InputManager.ins.clearMap.xPlus) {
            if(InputManager.ins.MovementVector.x == 1) InputManager.ins.MovementVector.x = 0;
            InputManager.ins.clearMap.xPlus = false;
        }
        if(InputManager.ins.clearMap.yMinus) {
            if(InputManager.ins.MovementVector.y == -1) InputManager.ins.MovementVector.y = 0;
            InputManager.ins.clearMap.yMinus = false;
        }
        if(InputManager.ins.clearMap.yPlus) {
            if(InputManager.ins.MovementVector.y == 1) InputManager.ins.MovementVector.y = 0;
            InputManager.ins.clearMap.yPlus = false;
        }

        //removes any keys that were designated for removal
        if(InputManager.ins.removeInputValues.length > 0){
            InputManager.ins.removeInputValues.forEach(value => {
                if(InputManager.ins.inputPresses.includes(value)) InputManager.ins.inputPresses.splice(InputManager.ins.inputPresses.indexOf(value), 1);
            });
            InputManager.ins.removeInputValues = [];
        } 
    }

    //Mouse

    onMouseDown(event: MouseEvent){
        const mousePos: Vector2 = new Vector2(event.clientX, event.clientY);
        const voxelPos: Vector2 = mousePos.subtract(Player.ins.camera.GetCameraOffset()).divideAndFloor(Chunk.PixelSize);
        /*
        console.log(voxelPos);

        const color = MapManager.ins.cPlanet.GetDataAt(voxelPos.x, voxelPos.y)?.color;
        console.log('%c color', `background: ${color?.get()}; color: ${color?.get()}`);
        */

        //check if any GUI element was clicked
        RenderManager.ins.ActiveGUIs.forEach(gui => {
            gui.interactiveElements.forEach(element => {
                if(element.GetOnScreenAABB().isDotInside(mousePos.x, mousePos.y)) {
                    if(element instanceof GUIButton) element.OnClick();
                    return;
                }
            });
        });

        MapManager.ins.buildings.forEach(building => {
            if(building.AABB.isDotInside(voxelPos.x + .5, voxelPos.y + .5)){
                building.OnClick();
        }});
    }
    onMouseUp(event: MouseEvent){
        
    }
    private previouseMousePos: Vector2 = new Vector2(0, 0);
    onMouseMove(event: MouseEvent){
        const mousePos: Vector2 = new Vector2(event.clientX, event.clientY);
        InputManager.ins.previouseMousePos = mousePos.copy();
        const voxelPos: Vector2 = mousePos.subtract(Player.ins.camera.GetCameraOffset()).divideAndFloor(Chunk.PixelSize);

        //InputManager.ins.UpdateMouseIndicator(mousePos); //already done by player move
    }  
    onMouseWheel(event: WheelEvent){
        const WheelDir = event.deltaY > 0 ? -1 : 1;
        Chunk.PixelSize = clamp(Chunk.PixelSize + WheelDir, 6, 30);
    }

    UpdateMouseIndicator(mousePos: Vector2 = InputManager.ins.previouseMousePos){
        const voxelPos: Vector2 = mousePos.subtract(Player.ins.camera.GetCameraOffset()).divideAndFloor(Chunk.PixelSize);
        InputManager.ins.mouseIndicatorPos = voxelPos;
    }
}