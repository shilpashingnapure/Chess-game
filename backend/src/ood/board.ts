import { Cell } from "./cell";
import { Color, gameStatus, PieceType } from "./enums";
import { FactoryPiece } from "./factoryPattern";
import { calculateIndex, getVerticalMoves } from "./MoveCalculationService";
import { Piece } from "./piece";

const BoardSize = 8;
export class Board {
  board: Cell[][] = [];

  killedPieces: Piece[] = [];

  undoStack: { start: Cell; end: Cell; killedPiece: Piece | null }[] = [];
  redoStack: { start: Cell; end: Cell; killedPiece: Piece | null }[] = [];

  moveHistory = [];

  constructor() {}

  initialBoard() {
    const factory = new FactoryPiece();
    for (let row = 0; row < BoardSize; row++) {
      let temp: Cell[] = [];
      for (let col = 0; col < BoardSize; col++) {
        let cell = new Cell(row, col);

        // for pawns
        if (row === 1) {
          const piece = factory.createPiece(PieceType.pawns, Color.black);
          cell.addPiece(piece);
        } else if (row === 6) {
          const piece = factory.createPiece(PieceType.pawns, Color.white);
          cell.addPiece(piece);
        }
        temp.push(cell);
      }

      this.board.push(temp);

      // to add for white
      if (row === 0) {
        this.assignedPieces(row, Color.black, factory);
      } else if (row === BoardSize - 1) {
        this.assignedPieces(row, Color.white, factory);
      }
    }
  }

  assignedPieces(row: number, color: Color, factory: FactoryPiece) {
    this.board[row][0].addPiece(factory.createPiece(PieceType.Rookes, color));
    this.board[row][BoardSize - 1].addPiece(
      factory.createPiece(PieceType.Rookes, color)
    );

    this.board[row][1].addPiece(factory.createPiece(PieceType.Knight, color));

    this.board[row][BoardSize - 2].addPiece(
      factory.createPiece(PieceType.Knight, color)
    );

    this.board[row][2].addPiece(factory.createPiece(PieceType.Bishop, color));
    this.board[row][BoardSize - 3].addPiece(
      factory.createPiece(PieceType.Bishop, color)
    );

    this.board[row][3].addPiece(factory.createPiece(PieceType.king, color));
    this.board[row][4].addPiece(factory.createPiece(PieceType.Queen, color));
  }

  movePiece(start: Cell, end: Cell) {
    const killedPiece = this.board[end.x][end.y].piece;

    // track of killed piece
    if (killedPiece) {
      this.killedPieces.push(killedPiece);
    }

    this.redoStack = [];
    this.undoStack.push({ start, end, killedPiece });
    this.handleMoveHistory(start, end, killedPiece, start.piece);
    this.board[end.x][end.y].piece = this.board[start.x][start.y].piece;
    this.board[start.x][start.y].removePiece();

    return true;
  }

  handleMoveHistory(start, end, isKilled, piece) {
    let moveNotation = "";

    const startMove = String.fromCharCode(start.y + 97) + (start.x + 1);
    const endMove = String.fromCharCode(end.y + 97) + (end.x + 1);
    if (isKilled) {
      moveNotation = startMove + " x " + endMove;
    } else {
      moveNotation = startMove + " - " + endMove;
    }
    this.moveHistory.push(moveNotation);
  }

  undoMove() {
    const lastMove = this.undoStack.pop();
    if (lastMove) {
      let start = lastMove.start;
      let end = lastMove.end;
      let killedPiece = lastMove.killedPiece;

      this.redoStack.push({ start, end, killedPiece });

      this.board[start.x][start.y].piece = this.board[end.x][end.y].piece;

      if (killedPiece) {
        this.board[end.x][end.y].addPiece(killedPiece);
      } else {
        this.board[end.x][end.y].removePiece();
      }

      if (killedPiece && this.killedPieces.length > 0) {
        this.killedPieces.pop();
      }
    }
  }

  redoMove() {
    const lastMove = this.redoStack.pop();
    if (lastMove) {
      let start = lastMove.start;
      let end = lastMove.end;
      let killedPiece = lastMove.killedPiece;

      this.board[end.x][end.y].piece = this.board[start.x][start.y].piece;
      this.board[start.x][start.y].removePiece();

      if (killedPiece) {
        this.killedPieces.push(killedPiece);
      }

      this.undoStack.push({ start, end, killedPiece });
    }
  }

  getRemovedPiece() {
    let whiteKilledPieces: Piece[] = [];
    let blackKilledPieces: Piece[] = [];

    for (let i = 0; i < this.killedPieces.length; i++) {
      if (this.killedPieces[i].color == Color.white) {
        whiteKilledPieces.push(this.killedPieces[i]);
      } else {
        blackKilledPieces.push(this.killedPieces[i]);
      }
    }

    return [whiteKilledPieces, blackKilledPieces];
  }

  getKingPosition(color: Color) {
    // find the king position of oppsite color
    let kingRow = -1;
    let kingCol = -1;

    for (let i = 0; i < this.board.length; i++) {
      for (let j = 0; j < this.board.length; j++) {
        const val = this.board[i][j].piece;
        if (val?.pieceType == PieceType.king && val.color == color) {
          kingRow = i;
          kingCol = j;
        }
      }
    }

    return [kingRow, kingCol];
  }

  getAttackers(kingRow , kingCol , opponentColor){
    const attackersPieces = [];
    for (let row = 0; row < this.board.length; row++) {
      for (let col = 0; col < this.board.length; col++) {
        const cell = this.board[row][col];

        if (cell.piece && cell.piece.color === opponentColor) {
          // get all piece possible moves for opponent piece
          const possibleMoves = this.getPossibleMoves(row, col);
          const kingIndex = calculateIndex(kingRow, kingCol, this.board.length);
          if (possibleMoves && possibleMoves.includes(kingIndex)) {
            attackersPieces.push(cell);
          }
        }
      }
    }

    return attackersPieces;

  }

  isKingInCheck(kingRow, kingCol, opponentColor: Color) {
    // check all opponent pieces to see if they can move to the king's position
    const getAttackersPieces = this.getAttackers(kingRow , kingCol , opponentColor);

    if(getAttackersPieces.length){
      return true;
    }
    return false;
  }

  getPossibleMoves(kingRow: number, kingCol: number) {
    const cell = this.board[kingRow][kingCol];
    const possibleMoves = cell.piece?.showAllPossibleMove(
      cell.x,
      cell.y,
      cell.piece.color,
      this.board
    );

    return possibleMoves;
  }

  checkKingMove(kingRow , kingCol , opponentColor){
    const kingMoves = this.getPossibleMoves(kingRow, kingCol);

    if (!kingMoves?.length) {
      return false;
    }

    for (const index of kingMoves) {
      const row = Math.floor(index / this.board.length);
      const col = index % this.board.length;

      const endCell = this.board[row][col];
      const startCell = this.board[kingRow][kingCol];

      this.movePiece(startCell, endCell);

      // if king is get check when move from position
      if (this.isKingInCheck(row, col, opponentColor)) {
        this.undoMove();
        return false;
      }

      this.undoMove();
    }

    return true;

  }

  checkBlockAttack(kingRow , kingCol , opponentColor){
    const attackersPieces = this.getAttackers(kingRow , kingCol , opponentColor);
    for (let row = 0; row < this.board.length; row++) {
      for (let col = 0; col < this.board.length; col++) {
        const cell = this.board[row][col];

        if (cell.piece && cell.piece.color !== opponentColor) {
          // get all piece possible moves for opponent piece
          const possibleMoves = this.getPossibleMoves(row, col);
          
          for(const attackerCell of attackersPieces){
            const attackerIndex = calculateIndex(attackerCell.x , attackerCell.y , this.board.length);

            for(const move of possibleMoves){
              const moveRow = Math.floor(move / this.board.length);
              const moveCol = move % this.board.length;

              const starteCell = this.board[row][col];
              const endCell = this.board[moveRow][moveCol];

              this.movePiece(starteCell , endCell);

              const isBlocked = this.isKingInCheck(kingRow , kingCol , opponentColor);

              this.undoMove();

              if(!isBlocked){
                return true;
              }

            }

          }
          
        }
      }
    }

    return false;



  }

  checkToCaptureAttackPiece(kingRow , kingCol , opponentColor){
    const attackersPieces = this.getAttackers(kingRow , kingCol , opponentColor);

    for (let row = 0; row < this.board.length; row++) {
      for (let col = 0; col < this.board.length; col++) {
        const cell = this.board[row][col];

        if (cell.piece && cell.piece.color !== opponentColor) {
          // get all piece possible moves for opponent piece
          const possibleMoves = this.getPossibleMoves(row, col);
          
          for(const attackerCell of attackersPieces){
            const attackerIndex = calculateIndex(attackerCell.x , attackerCell.y , this.board.length);

            if(possibleMoves && possibleMoves.includes(attackerIndex)){
              return true;
            }

          }
          
        }
      }
    }

    return false;

  }

  isKingCheckMate(kingRow, kingCol, opponentColor) {

    const canKingMove = this.checkKingMove(kingRow , kingCol , opponentColor);
    const canBlockAttack = this.checkBlockAttack(kingRow , kingCol , opponentColor);
    const canCaptureAttackPiece = this.checkToCaptureAttackPiece(kingRow , kingCol , opponentColor);
    if(canKingMove || canBlockAttack || canCaptureAttackPiece){
      return false;
    }
    return true;
  }

  checkWinner() {
    const colors = [Color.white, Color.black];

    let response = {
      status: gameStatus.Continue,
      winner : "",
      checkedColor : '',
    };

    for (const color of colors) {
      const [kingRow, kingCol] = this.getKingPosition(color);

      const opponentColor = color == Color.white ? Color.black : Color.white;

      // if king is not present
      if (kingRow == -1 || kingCol == -1) {
        response.status = gameStatus.GameOver;
        response.winner  = opponentColor;
        break; // game over
      }

      // check and checkmate for king
      const isCheck = this.isKingInCheck(kingRow, kingCol, opponentColor);
      if (isCheck) {
        const isCheckMate = this.isKingCheckMate(kingRow, kingCol, opponentColor);
        response.status = isCheckMate ? gameStatus.CheckMate : gameStatus.Checked; // 1: ChecekMate , 2:Check
        response.checkedColor = color;
        
        break;
      }
    }

    return response; // no check or checkmate
  }
}
