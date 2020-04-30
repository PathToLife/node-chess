import { BoardState } from '../../types';
/**
 * Deep copies board state, ensures current & previous board state(s) are independent of each other
 * Can use R or Lodash instead..
 *
 * @param boardState
 */
export default function deepCopy(boardState: BoardState): BoardState;
