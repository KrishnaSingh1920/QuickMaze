import React from 'react';
import './GameOver.css';

const GameOver = ({ finalScore, onPlayAgain }) => {
  return (
    <div className="GameOver">
      <div className="gameOver">Game Over</div>
      <div className="finalScore">Final Score: {finalScore}</div>
      <button className="mainMenuButtons" onClick={onPlayAgain}>Play Again</button>
    </div>
  );
};

export default GameOver;
