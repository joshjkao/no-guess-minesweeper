import { useEffect, useState } from 'react';
import './MineSweeper.css'

function Xorshift32(seed) {
  let state = seed >>> 0;

  return function(N=4294967296) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) % N;
  }
}

function WhichColor(state, value, isMine) {
  var colorarr = ["lightgray", "blue", "green", "red", "purple", "white", "white", "white", "white"];
  if (state === 0) return colorarr[0];
  else if (state === 2) return colorarr[0];
  else if (isMine) return colorarr[0];
  else return colorarr[value];
}

function WhichChar(state, value, isMine) {
  if (state === 0) return '.';
  else if (state === 2) return '🏴‍☠️';
  else if (isMine) return '💣';
  else if (value === 0) return '';
  else return value;
}

function MineSweeperTile({states, value, isMine, i, j, dig, flag, setHovered}) {
  return (
    <div style={{
      width: '30px',
      height: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: WhichColor(states[i][j], value, isMine)
    }} 
    onClick={() => dig(i, j)}
    tabIndex={0}
    role="button"
    onMouseEnter={() => { setHovered([i, j]);}}
    onMouseLeave={() => { setHovered([i, j]); }}
    >
      {WhichChar(states[i][j], value, isMine)}
    </div>
  );
}

function MineSweeperBoard({initState}) {
  const [M, setM] = useState(0);
  const [N, setN] = useState(0);
  const [MINES, setMINES] = useState(0);
  const [states, setStates] = useState([[0]]);
  const [mines, setMines] = useState([[0]]);
  const [values, setValues] = useState([[0]]);
  const [hovered, setHovered] = useState(null);
  const [gameState, setGameState] = useState(2);
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
    const [M, N, MINES, theStates, theValues, theMines] = initializeBoard(initState);
    setM(M);
    setN(N);
    setMINES(MINES);
    setStates(theStates);
    setValues(theValues);
    setMines(theMines);
    setMineCounter(MINES);
    setGameState(2);
  }, []);

  const dig = (i, j) => {
    if (states[i][j] !== 0) return;
    if (gameState === 2) {
      setGameState(1);
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

  const flag = (i, j) => {
    // console.log("flag", i, j);
    if (gameState === 0) return;
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
          if (mines[ni][nj] === 1) setGameState(-1);
          dig(ni, nj);
        }
      });
    }
  }

  const revealBoard = () => {
    for (let i = 0; i < M; i++) {
      for (let j = 0; j < N; j++) {
        if (mines[i][j] === 1 && states[i][j] !== 2) {
          flag(i, j);
        }
      }
    }
    return;
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
    revealBoard();
    setGameState(0);
    return;
  }

  return (
    <div autoFocus style={{ display: 'inline-block' }}
      onKeyDown={(e) => handleKeyDown(e)}
    >
      <div>
        {gameState === null ? "loading" : 
        gameState === 2 ? "🤨" :
        gameState === 1 ? "🙂" : 
        gameState === 0 ? "😎" : 
        gameState === -1 ? "💀" : ""}
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

function initializeBoard(initState) {
  var states = initState.states;
  var mines = initState.mines;
  var M = mines.length;
  var N = mines[0].length;

  const values = Array.from({ length: M }, () =>
    Array.from({ length: N }, () => 0)
  );

  var nMines = 0;
  for (let i = 0; i < M; ++i) {
    for (let j = 0; j < N; ++j) {
      if (mines[i][j] === 1) nMines++;
    }
  }
  var coveredTiles = M*N-nMines;
  var remainingMines = nMines;

  for (let i = 0; i < M; ++i) {
    for (let j = 0; j < N; ++j) {
      if (states[i][j] === 1) {
        --coveredTiles;
      } else if (states[i][j] === 2) {
        --remainingMines;
      }
    }
  }
  for (let i = 0; i < M; ++i) {
    for (let j = 0; j < N; ++j) {
      neighbors(M, N, i, j).forEach(([ni, nj]) => { values[i][j] += mines[ni][nj]; });
    }
  }

  return [M, N, nMines, states, values, mines];
}

// function initializeBoard(M, N, MINES, seed) {
//   console.log("init", seed);
//   const mines = Array.from({ length: M }, () =>
//     Array.from({ length: N }, () => 0)
//   );
//   const values = Array.from({ length: M }, () =>
//     Array.from({ length: N }, () => 0)
//   );
//   const states = Array.from({ length: M }, () =>
//     Array.from({ length: N }, () => 0)
//   );
//   const rand = Xorshift32(seed);

//   let placedMines = 0;
//   while (placedMines < MINES) {
//     const i = rand(M);
//     const j = rand(N);
//     if (mines[i][j] !== 1) {
//       mines[i][j] = 1;
//       placedMines++;
//     }
//   }

//   let zeroVals = [];
//   for (let i = 0; i < M; i++) {
//     for (let j = 0; j < N; j++) {
//       neighbors(M, N, i, j).forEach(([ni, nj]) => { values[i][j] += mines[ni][nj]; });
//       if (values[i][j] === 0 && mines[i][j] === 0) zeroVals.push([i, j]);
//     }
//   }
//   if (zeroVals.length === 0) return;
//   const initMove = zeroVals[rand(zeroVals.length)];

//   return [states, values, mines, initMove];
// }

export default MineSweeperBoard;
