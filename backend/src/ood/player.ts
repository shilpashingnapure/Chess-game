import { Color } from "./enums";

export class Player {
    totalPieaces : number = 16;
    color : Color;

    constructor(color : Color) {
        this.color = color;
        
    }
}