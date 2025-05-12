import logo from './logo.svg';
import './App.css';
import MineSweeperBoard from './MineSweeperBoard';
import { useEffect, useState } from 'react';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR3PhLLS9ZxnmJQcM9QnRnDMpZZSiIipjD5wkLK1AGK_lr-kE0_4Dw6jkIANGufcJnEesuyHmQh_ip2/pub?gid=0&single=true&output=csv';

function App() {
  const [seeds, setSeeds] = useState([25])
  const [seed, setSeed] = useState(0);

  function csvJSON(csv){
    var values=csv.split(',');
    var ret = [];
    values.forEach(element => {
      ret.push(parseInt(element));
    });
    return ret;
  }
  
  useEffect(() => {
    fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vR3PhLLS9ZxnmJQcM9QnRnDMpZZSiIipjD5wkLK1AGK_lr-kE0_4Dw6jkIANGufcJnEesuyHmQh_ip2/pub?gid=0&single=true&output=csv')
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

  return (
    <div className="App">
      <header className="App-header">
        {seed === 0 ? <div>loading</div> : <MineSweeperBoard M={10} N={10} MINES={25} seed={seed}/>}
      </header>
    </div>
  );
}

export default App;
