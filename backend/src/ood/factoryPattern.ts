import { Color, PieceType } from "./enums";
import { Bishop, King, Knight, Pawns, Queen, Rookies } from "./piece";

export class FactoryPiece{

    createPiece(pieceType : PieceType , color : Color){
        switch(pieceType){
            case PieceType.pawns:
                return new Pawns(color);
            case PieceType.king:
                return new King(color);
            case PieceType.Queen:
                return new Queen(color);
            case PieceType.Rookes:
                return new Rookies(color);
            case PieceType.Knight:
                return new Knight(color);
            case PieceType.Bishop:
                return new Bishop(color);
            default:
                throw new Error('invaild piece type')
        }
    }

}