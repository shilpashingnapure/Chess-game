import { Board } from "./board";
import { Color } from "./enums";
import { Player } from "./player";

export class Game {
    players : Player[] = [];
    board : Board;
    playerTurn : string = 'white';

    constructor() {
        this.players[0] = new Player(Color.white);
        this.players[1] = new Player(Color.black);

        this.board = new Board();
        this.board.initialBoard();

        
    }

    getPlayers(){
        return this.players;
    }
    changeTurn(){
        this.playerTurn = this.playerTurn == 'white' ?  'black' : 'white' ;  
        return this.playerTurn;

    }
}


