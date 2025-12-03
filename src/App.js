import './App.css';
import MineSweeperBoard from './MineSweeperBoard';
import { useEffect, useState } from 'react';
import createModule from './bindings.js';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR3PhLLS9ZxnmJQcM9QnRnDMpZZSiIipjD5wkLK1AGK_lr-kE0_4Dw6jkIANGufcJnEesuyHmQh_ip2/pub?gid=0&single=true&output=csv';

function App() {
  const [seeds, setSeeds] = useState([25])
  const [seed, setSeed] = useState(0);

  function csvJSON(csv){
    var rows=csv.split('\n');
    var ret = [];
    rows.forEach(row => {
      var rowData = row.split(',');
      ret.push(parseInt(rowData[0]));
    });
    return ret;
  }
  
  useEffect(() => {
    fetch(SHEET_URL)
    .then(response => response.text())
    .then(data => {
      var jsondata = csvJSON(data);
      console.log(jsondata);
      var index = Math.floor(Math.random() * jsondata.length);
      console.log(index);
      setSeeds(jsondata);
      setSeed(jsondata[index]);
    });
  }, []);

  useEffect(() => {
    createModule();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {seed === 0 ? <div>loading</div> : <MineSweeperBoard M={16} N={16} MINES={60} seed={seed}/>}
      </header>
    </div>
  );
}

export default App;
