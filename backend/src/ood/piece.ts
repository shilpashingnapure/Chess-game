import { Cell } from "./cell";
import { Color, PieceType } from "./enums";
import {
  calculateIndex,
  getDignoalMoves,
  getHorizontalMoves,
  getVerticalMoves,
  isWithinBounds,
} from "./MoveCalculationService";

export abstract class Piece {
  color: Color;
  pieceType: PieceType;
  code: string;

  constructor(piece: PieceType, color: Color, code: string) {
    this.color = color;
    this.pieceType = piece;
    this.code = code;
  }

  abstract showAllPossibleMove(
    row: number,
    col: number,
    color: Color,
    board: Cell[][]
  ): number[];
}

export class Pawns extends Piece {
  constructor(color: Color) {
    const code = "U+265F";
    super(PieceType.pawns, color, code);
  }

  /**
   *
   * @param row
   * @param col
   * @param color
   * @param board
   * @returns number[] (possible index)
   * based on piece , move pawns forward
   * in dignoal if have oppsitie piece add into array
   */
  showAllPossibleMove(row: number, col: number, color: Color, board: Cell[][]) {
    let addPossibleIndexs: number[] = [];

    const size = board.length;

    const direction = color == Color.white ? -1 : 1;

    const newRow = row + direction;

    // forward move
    if (
      isWithinBounds(row, col, size) &&
      board[newRow][col].piece == undefined
    ) {
      addPossibleIndexs.push(calculateIndex(newRow, col, size));
      // Check for the initial two-step move (only if the pawn is on its starting row)
      if (
        (color === Color.white && row === 6) ||
        (color === Color.black && row === 1)
      ) {
        const twoStepsRow = row + 2 * direction;
        if (
          isWithinBounds(twoStepsRow, col, board.length) &&
          !board[twoStepsRow][col].piece
        ) {
          addPossibleIndexs.push(
            calculateIndex(twoStepsRow, col, board.length)
          );
        }
      }
    }

    for (let dCol of [-1, 1]) {
      const r = row + direction;
      const c = col + dCol;

      if (isWithinBounds(r, c, size)) {
        const cell = board[r][c].piece;
        if (cell && cell.color !== color) {
          const index = calculateIndex(r, c, size);
          addPossibleIndexs.push(index);
        }
      }
    }

    return addPossibleIndexs;
  }
}

export class King extends Piece {
  constructor(color: Color) {
    const code = "U+265A";
    super(PieceType.king, color, code);
  }

  showAllPossibleMove(row : number , col : number , color : Color , board : Cell[][]) {
    let addPossibleIndexs: number[] = [];

    // [row , col]
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];

    for (let [drow, dcol] of directions) {
      const newRow = row + drow;
      const newCol = col + dcol;
      if (isWithinBounds(newRow, newCol, board.length)) {
        const cell = board[newRow][newCol].piece;
        if (!cell || cell.color !== color) {
          const index = calculateIndex(newRow, newCol, board.length);
          addPossibleIndexs.push(index);
        }
      }
    }

    return addPossibleIndexs;
  }
}

export class Queen extends Piece {
  constructor(color: Color) {
    const code = "U+265B";
    super(PieceType.Queen, color, code);
  }

  showAllPossibleMove(row: number, col: number, color: Color, board: Cell[][]) {
    let addPossibleIndexs: number[] = [];

    let size = board.length;
    addPossibleIndexs.push(
      ...getVerticalMoves(row + 1, col, color, board, size, 1), // Down
      ...getVerticalMoves(row - 1, col, color, board, size, -1), // to Down
      ...getHorizontalMoves(row, col + 1, color, board, size, 1), // to Right
      ...getHorizontalMoves(row, col - 1, color, board, size, -1), // to Left
      ...getDignoalMoves(col + 1, row, col, board, size, color, 1, -1), //down-left
      ...getDignoalMoves(size - col, row, col, board, size, color, 1, 1), // down-right
      ...getDignoalMoves(col + 1, row, col, board, size, color, -1, -1), // up-left
      ...getDignoalMoves(size - col, row, col, board, size, color, -1, 1) // up-right
    );

    return addPossibleIndexs;
  }
}

export class Rookies extends Piece {
  constructor(color: Color) {
    const code = "U+265C";
    super(PieceType.Rookes, color, code);
  }

  showAllPossibleMove(row: number, col: number, color: Color, board: Cell[][]) {
    let addPossibleIndexs: number[] = [];
    let size = board.length;
    addPossibleIndexs.push(
      ...getVerticalMoves(row + 1, col, color, board, size, 1), // to Down
      ...getVerticalMoves(row - 1, col, color, board, size, -1), // to Down
      ...getHorizontalMoves(row, col + 1, color, board, size, 1), // to Right
      ...getHorizontalMoves(row, col - 1, color, board, size, -1) // to Left
    );

    return addPossibleIndexs;
  }
}

export class Knight extends Piece {
  constructor(color: Color) {
    const code = "U+265E";
    super(PieceType.Knight, color, code);
  }

  showAllPossibleMove(row: number, col: number, color: Color, board: Cell[][]) {
    let addPossibleIndexs: number[] = [];

    const knightMoves = [
      [-2, -1],
      [-2, 1],
      [2, -1],
      [2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
    ];

    let size = board.length;
    for (let [dRow, dCol] of knightMoves) {
      const r = row + dRow;
      const c = col + dCol;

      if (r >= 0 && r < size && c >= 0 && c < size) {
        const cell = board[r][c].piece;
        const index = r * size + c;
        if (!cell || cell.color != color) {
          addPossibleIndexs.push(index);
        }
      }
    }
    return addPossibleIndexs;
  }
}

export class Bishop extends Piece {
  constructor(color: Color) {
    const code = "U+265D";
    super(PieceType.Bishop, color, code);
  }

  showAllPossibleMove(row: number, col: number, color: Color, board: Cell[][]) {
    let addPossibleIndexs: number[] = [];

    let size = board.length;
    addPossibleIndexs.push(
      ...getDignoalMoves(col + 1, row, col, board, size, color, 1, -1), //down-left
      ...getDignoalMoves(size - col, row, col, board, size, color, 1, 1), // down-right
      ...getDignoalMoves(col + 1, row, col, board, size, color, -1, -1), // up-left
      ...getDignoalMoves(size - col, row, col, board, size, color, -1, 1) // up-right
    );
    return addPossibleIndexs;
  }
}
