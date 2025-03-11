import React from 'react';
import './MainMenu.css';

const MainMenu = ({ onPlay }) => {
  return (
    <div className="mainMenu">
      <div className="logo">Maze Game</div>
      <button className='mainMenuButtons' onClick={onPlay}>Play</button>
      <button className='mainMenuButtons'>Options</button>
    </div>
  );
};

export default MainMenu;
