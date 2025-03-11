import React, { useState, useEffect } from 'react';
import './Game.css';

const GRID_SIZE = 25;
const CELL_SIZE = 14.4; // 0.9rem in pixels (assuming 16px root font-size)
const BASE_POINTS = 100;
const BASE_WALL_COUNT = 200;
const WALL_INCREMENT = 20;
const MAX_LEVELS = 5; // Maximum number of levels you can define

// Generate walls based on the current level.
const generateWallsForLevel = (level) => {
  const wallCount = BASE_WALL_COUNT + (level - 1) * WALL_INCREMENT;
  const walls = new Set();
  while (walls.size < wallCount) {
    const wallPos = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
    // Ensure the starting cell (cell 0) is not a wall.
    if (wallPos === 0) continue;
    walls.add(wallPos);
  }
  return walls;
};

// Generate an anchor cell that is not a wall and not the starting cell.
const generateAnchor = (walls) => {
  let anchor;
  do {
    anchor = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
  } while (walls.has(anchor) || anchor === 0);
  return anchor;
};

// Check if there's a valid path from cell 0 to the anchor using BFS.
const isPathAvailable = (walls, anchor) => {
  const start = 0;
  const queue = [start];
  const visited = new Set([start]);

  while (queue.length > 0) {
    const cell = queue.shift();
    if (cell === anchor) return true;

    const row = Math.floor(cell / GRID_SIZE);
    const col = cell % GRID_SIZE;
    const directions = [
      { dr: -1, dc: 0 },
      { dr: 1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 }
    ];

    for (const { dr, dc } of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      if (newRow < 0 || newRow >= GRID_SIZE || newCol < 0 || newCol >= GRID_SIZE)
        continue;
      const neighbor = newRow * GRID_SIZE + newCol;
      if (!walls.has(neighbor) && !visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return false;
};

// Generate a maze (walls and anchor) ensuring a valid path exists.
const generateMaze = (level) => {
  let maze;
  do {
    const walls = generateWallsForLevel(level);
    const anchor = generateAnchor(walls);
    maze = { walls, anchor };
  } while (!isPathAvailable(maze.walls, maze.anchor));
  return maze;
};

const Game = ({ onGameOver }) => {
  // Player position stored in pixel values.
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  // Maze object containing walls and the anchor position.
  const [maze, setMaze] = useState(generateMaze(1));
  // Overall cumulative score.
  const [score, setScore] = useState(0);
  // Points available for the current level (starts at 100).
  const [pointsLeft, setPointsLeft] = useState(BASE_POINTS);
  // Current level.
  const [currentLevel, setCurrentLevel] = useState(1);
  // Game over state.
  const [gameOver, setGameOver] = useState(false);

  // Shared function to move the player in a given direction.
  const movePlayer = (direction) => {
    if (gameOver) return;

    let newX = playerPos.x;
    let newY = playerPos.y;

    if (direction === 'up' && playerPos.y > 0) newY -= CELL_SIZE;
    if (direction === 'down' && playerPos.y < (GRID_SIZE - 1) * CELL_SIZE) newY += CELL_SIZE;
    if (direction === 'left' && playerPos.x > 0) newX -= CELL_SIZE;
    if (direction === 'right' && playerPos.x < (GRID_SIZE - 1) * CELL_SIZE) newX += CELL_SIZE;

    // Use Math.round to convert pixel positions to grid indices.
    const col = Math.round(newX / CELL_SIZE);
    const row = Math.round(newY / CELL_SIZE);
    const newIndex = row * GRID_SIZE + col;

    // If the target cell is a wall, ignore the move.
    if (maze.walls.has(newIndex)) return;

    // Deduct one point for a valid move.
    const newPointsLeft = Math.max(pointsLeft - 1, 0);

    // If the player reaches the anchor...
    if (newIndex === maze.anchor) {
      const finalScore = score + newPointsLeft;
      if (currentLevel >= MAX_LEVELS) {
        setGameOver(true);
        if (typeof onGameOver === 'function') {
          onGameOver(finalScore);
        }
      } else {
        // Advance to the next level.
        const nextLevel = currentLevel + 1;
        setCurrentLevel(nextLevel);
        setMaze(generateMaze(nextLevel));
        setPlayerPos({ x: 0, y: 0 });
        setPointsLeft(BASE_POINTS);
        setScore(score + newPointsLeft);
      }
    } else {
      // Otherwise, update the player position and the level points.
      setPlayerPos({ x: newX, y: newY });
      setPointsLeft(newPointsLeft);
    }
  };

  // Handle keyboard input.
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (gameOver) return;
      switch (event.key) {
        case 'w':
        case 'ArrowUp':
          movePlayer('up');
          break;
        case 's':
        case 'ArrowDown':
          movePlayer('down');
          break;
        case 'a':
        case 'ArrowLeft':
          movePlayer('left');
          break;
        case 'd':
        case 'ArrowRight':
          movePlayer('right');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playerPos, maze, pointsLeft, gameOver, currentLevel, score, onGameOver]);

  return (
    <div className="game">
      <div className="score">
        {gameOver ? (
          <span>Game Over! Final Score: {score}</span>
        ) : (
          <div className='scoreboard'>
            <span>Score: {score}</span>
            <span className="level"> Level: {currentLevel}/{MAX_LEVELS}</span><br />
            <span className="levelPoints">Points Left: {pointsLeft}</span>
          </div>
        )}
      </div>
      <div className="gameboard">
        {[...Array(GRID_SIZE * GRID_SIZE)].map((_, index) => (
          <div 
            key={index} 
            className={`grid-item ${maze.walls.has(index) ? 'wall' : ''} ${maze.anchor === index ? 'anchor' : ''}`}
          ></div>
        ))}
        <div className="player" style={{ top: playerPos.y, left: playerPos.x }}></div>
      </div>
      {/* Gamepad with four directional buttons */}
      <div className="gamepad">
        <div></div>
        <button id='up' onClick={() => movePlayer('up')}>➤</button>
        <div></div>
        <button id='left' onClick={() => movePlayer('left')}>➤</button>
        <div></div>
        <button id='right' onClick={() => movePlayer('right')}>➤</button>
        <div></div>
        <button id='down' onClick={() => movePlayer('down')}>➤</button>
        <div></div>
      </div>
    </div>
  );
};

export default Game;
