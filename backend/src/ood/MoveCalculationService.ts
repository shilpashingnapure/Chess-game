import { Cell } from "./cell";
import { Color } from "./enums";

// go left and right
export function getHorizontalMoves(
  row: number,
  col: number,
  color: Color,
  board: Cell[][],
  size: number,
  direction: number
) {
  let possibleIndexes: number[] = [];
  for (let i = col; i >= 0 && i < size; i += direction) {
    const cell = board[row][i].piece;
    const index = calculateIndex(row, i, size);

    if (!cell) {
      possibleIndexes.push(index);
    } else {
      if (cell.color != color) {
        possibleIndexes.push(index);
      }

      return possibleIndexes;
    }
  }

  return possibleIndexes;
}

// go up and down
export function getVerticalMoves(
  row: number,
  col: number,
  color: Color,
  board: Cell[][],
  size: number,
  direction: number
) {
  let possibleIndexes: number[] = [];
  for (let i = row; i >= 0 && i < size; i += direction) {
    const cell = board[i][col].piece;
    const index = calculateIndex(i, col, size);
    if (!cell) {
      possibleIndexes.push(index);
    } else {
      if (cell.color !== color) {
        possibleIndexes.push(index);
      }
      return possibleIndexes;
    }
  }
  return possibleIndexes;
}

export function getDignoalMoves(
  end: number,
  row: number,
  col: number,
  board: Cell[][],
  size: number,
  color: Color,
  rowDir: number,
  colDir: number
) {
  let possibleIndexes: number[] = [];

  for (let i = 1; i < end; i++) {
    const r = row + i * rowDir;
    const c = col + i * colDir;

    if (r >= size || r < 0 || c < 0 || c >= size) {
      break;
    }

    const cell = board[r][c].piece;
    const index = calculateIndex(r, c, size);
    if (!cell) {
      possibleIndexes.push(index);
    } else {
      if (cell.color != color) {
        possibleIndexes.push(index);
      }
      return possibleIndexes;
    }
  }

  return possibleIndexes;
}

export function getAvailableMoves(board : Cell[][] , color : Color){

  const availableMoves = [];
  for(let row = 0 ; row < board.length ; row++){
    for(let col = 0 ; col < board.length ; col++){
      const cell = board[row][col];
      const piece = cell.piece;

      if(piece && piece.color == color){
        const possibleMoves = cell.piece?.showAllPossibleMove(cell.x , cell.y , cell.piece.color , board); 

        if(possibleMoves.length){
          availableMoves.push({
            start : cell , 
            end : possibleMoves
          })

        }

      }

    }
  }

  return availableMoves;


}



export function isWithinBounds(row : number , col : number , size : number ) {
  return row >= 0 && row < size && col >= 0 && col < size;
}

export function calculateIndex(row : number , col : number , size : number ) {
  return row * size + col;
}
