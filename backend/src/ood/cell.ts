import { Piece } from "./piece";

export class Cell {
    x : number ;
    y : number ;
    piece : null | Piece = null;
    constructor(x : number  , y : number) {
        this.x = x;
        this.y = y;        
    }

    removePiece(){
        this.piece = null;
    }

    // factory pattern
    addPiece(piece : Piece){
        this.piece = piece;

    }
}