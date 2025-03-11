import { useState } from 'react';
import './App.css';
import MainMenu from './Components/MainMenu';
import Game from './Components/Game';
import GameOver from './Components/GameOver';

function App() {
  // screen can be "menu", "game", or "gameover"
  const [screen, setScreen] = useState("menu");
  const [finalScore, setFinalScore] = useState(0);

  // Called when the game ends.
  const handleGameOver = (score) => {
    setFinalScore(score);
    setScreen("gameover");
  };

  // Called when "Play Again" is pressed in GameOver.
  const handlePlayAgain = () => {
    setScreen("game");
  };

  // Called when "Play" is pressed in MainMenu.
  const handlePlayGame = () => {
    setScreen("game");
  };

  return (
    <>
      {screen === "menu" && <MainMenu onPlay={handlePlayGame} />}
      {screen === "game" && <Game onGameOver={handleGameOver} />}
      {screen === "gameover" && <GameOver finalScore={finalScore} onPlayAgain={handlePlayAgain} />}
    </>
  );
}

export default App;
