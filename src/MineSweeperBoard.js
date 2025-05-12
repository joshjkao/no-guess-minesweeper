import { useEffect, useState } from 'react';
import './MineSweeper.css'

function LCG(seed) {
  let state = seed >>> 0; // Ensure unsigned 32-bit

  return function(N=4294967296) {
    state = (1664525 * state + 1013904223) >>> 0;
    return state % N;
  }
}

function Xorshift32(seed) {
  let state = seed >>> 0;

  return function(N=4294967296) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) % N;
  }
}

function MineSweeperTile({states, value, isMine, i, j, dig, flag, setHovered, isInit}) {
  return (
    <div style={{
      width: '30px',
      height: '30px',
      border: '1px solid black',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }} 
    onClick={() => dig(i, j)}
    tabIndex={0}
    role="button"
    onMouseEnter={() => { setHovered([i, j]);}}
    onMouseLeave={() => { setHovered([i, j]); }}
    >
      {states[i][j] === 0 ? (isInit ? "*" : ".") : states[i][j] === 2 ? "X" : isMine ? "M" : value === 0 ? "" : value}
    </div>
  );
}

function MineSweeperBoard({M, N, MINES, seed}) {

  const [states, setStates] = useState([[0]]);
  const [mines, setMines] = useState([[0]]);
  const [values, setValues] = useState([[0]]);
  const [hovered, setHovered] = useState(null);
  const [initialMove, setInitialMove] = useState([0,0]);
  const [gameState, setGameState] = useState(null);
  const [mineCounter, setMineCounter] = useState(MINES);

  const handleKeyDown = (e) => {
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      const [i, j] = hovered;
      if (states[i][j] === 1) digAllNeighbors(i, j)
      else flag(i, j);
    }
  };

  useEffect(() => {
    const [theStates, theValues, theMines, initialMove] = initializeBoard(M, N, MINES, seed);
    setStates(theStates);
    setMines(theMines);
    setValues(theValues);
    setInitialMove(initialMove);
    setGameState(2);
  }, []);

  const dig = (i, j) => {
    if (states[i][j] !== 0) return;
    if (gameState !== 1) {
      if (i === initialMove[0] && j === initialMove[1]) {
        setGameState(1);
        digInitial(i, j);
        return;
      }
      else return;
    }
    const statesCopy = [...states];
    statesCopy[i][j] = 1;
    setStates(statesCopy);
    if (mines[i][j] === 1) {
      setGameState(-1);
      return;
    }
    if (values[i][j] === 0) {
      neighbors(M, N, i, j).forEach(([ni, nj]) => { dig(ni, nj); });
    }
    checkGameState();
  };

  const digInitial = (i, j) => {
    if (states[i][j] !== 0) return;
    const statesCopy = [...states];
    statesCopy[i][j] = 1;
    setStates(statesCopy);
    if (values[i][j] === 0) {
      neighbors(M, N, i, j).forEach(([ni, nj]) => { digInitial(ni, nj); });
    }
  };

  const flag = (i, j) => {
    if (gameState !== 1) return;
    console.log("flag", i, j);
    if (states[i][j] === 1) return;
    const statesCopy = [...states];
    const currMineCounter = mineCounter;
    if (statesCopy[i][j] === 0) {
      statesCopy[i][j] = 2;
      setMineCounter(currMineCounter-1);
    }
    else if (statesCopy[i][j] === 2) {
      statesCopy[i][j] = 0;
      setMineCounter(currMineCounter+1);
    }
    setStates(statesCopy);
  }

  const digAllNeighbors = (i, j) => {
    let flagCount = 0;
    neighbors(M, N, i, j).forEach(([ni, nj]) => { if (states[ni][nj] === 2) flagCount++; });
    if (flagCount === values[i][j]) {
      neighbors(M, N, i, j).forEach(([ni, nj]) => {
        if (states[ni][nj] === 0) {
          console.log("digall", ni, nj);
          if (mines[ni][nj] === 1) setGameState(-1);
          dig(ni, nj);
        }
      });
    }
  }

  const checkGameState = () => {
    for (let i = 0; i < M; i++) {
      for (let j = 0; j < N; j++) {
        if (mines[i][j] === 0 && states[i][j] !== 1) {
          setGameState(1);
          return;
        }
      }
    }
    setGameState(0);
    return;
  }

  return (
    <div style={{ display: 'inline-block' }}
      onKeyDown={(e) => handleKeyDown(e)}
    >
      <div>
        {gameState === null ? "loading" : 
        gameState === 2 ? "ready" :
        gameState === 1 ? "incomplete" : 
        gameState === 0 ? "win" : 
        gameState === -1 ? "lose" : ""}
      </div>
      <div>
        {mineCounter}
      </div>
      {values.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: 'flex' }}>
          {row.map((_, colIndex) => (
            <MineSweeperTile
              key={colIndex}
              states={states}
              value={values[rowIndex][colIndex]}
              isMine={mines[rowIndex][colIndex]}
              i={rowIndex}
              j={colIndex}
              dig={dig}
              flag={flag}
              setHovered={setHovered}
              isInit={rowIndex === initialMove[0] && colIndex === initialMove[1]}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function neighbors(M, N, i, j) {
  let ret = [];
  if (i > 0) {
    ret.push([i-1, j]);
    if (j > 0) ret.push([i-1, j-1]);
    if (j < N-1) ret.push([i-1, j+1]);
  }
  if (i < M-1) {
    ret.push([i+1, j]);
    if (j > 0) ret.push([i+1, j-1]);
    if (j < N-1) ret.push([i+1, j+1]);
  }
  if (j > 0) ret.push([i, j-1]);
  if (j < N-1) ret.push([i, j+1]);
  return ret;
}

function initializeBoard(M, N, MINES, seed) {
  console.log("init", seed);
  const mines = Array.from({ length: M }, () =>
    Array.from({ length: N }, () => 0)
  );
  const values = Array.from({ length: M }, () =>
    Array.from({ length: N }, () => 0)
  );
  const states = Array.from({ length: M }, () =>
    Array.from({ length: N }, () => 0)
  );
  // const rand = LCG(seed);
  const rand = Xorshift32(seed);

  let placedMines = 0;
  while (placedMines < MINES) {
    const i = rand(M);
    const j = rand(N);
    if (mines[i][j] !== 1) {
      mines[i][j] = 1;
      placedMines++;
    }
  }

  let zeroVals = [];
  for (let i = 0; i < M; i++) {
    for (let j = 0; j < N; j++) {
      neighbors(M, N, i, j).forEach(([ni, nj]) => { values[i][j] += mines[ni][nj]; });
      if (values[i][j] === 0 && mines[i][j] === 0) zeroVals.push([i, j]);
    }
  }
  if (zeroVals.length === 0) return;
  const initMove = zeroVals[rand(zeroVals.length)];

  return [states, values, mines, initMove];
}

export default MineSweeperBoard;