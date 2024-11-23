import React, { useEffect, useRef, useState } from 'react';

// Types
import type { Brick, Ball, Paddle } from './utils/types';

// Constants
import { GAME_CONSTANTS } from './utils/constants';

// Game constants
const { CANVAS, PADDLE, BALL, BRICK } = GAME_CONSTANTS;
const CANVAS_WIDTH = CANVAS.WIDTH;
const CANVAS_HEIGHT = CANVAS.HEIGHT;
const PADDLE_HEIGHT = PADDLE.HEIGHT;
const PADDLE_WIDTH = PADDLE.WIDTH;
const BALL_RADIUS = BALL.RADIUS;

const ArkanoidGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const ballRef = useRef<Ball>({
    x: CANVAS.WIDTH / 2,
    y: CANVAS.HEIGHT - 30,
    dx: BALL.SPEED,
    dy: -BALL.SPEED,
    radius: BALL.RADIUS,
  });
  const paddleRef = useRef<Paddle>({
    x: CANVAS.WIDTH / 2 - PADDLE.WIDTH / 2,
    width: PADDLE.WIDTH,
    height: PADDLE.HEIGHT,
  });

  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [bricks, setBricks] = useState<Brick[]>(initializeBricks());

  // Move brick initialization to separate function
  function initializeBricks(): Brick[] {
    const bricks: Brick[] = [];
    for (let row = 0; row < BRICK.ROWS; row++) {
      for (let col = 0; col < BRICK.COLS; col++) {
        bricks.push({
          x: col * (BRICK.WIDTH + BRICK.PADDING) + BRICK.LEFT_OFFSET,
          y: row * (BRICK.HEIGHT + BRICK.PADDING) + BRICK.TOP_OFFSET,
          width: BRICK.WIDTH,
          height: BRICK.HEIGHT,
          visible: true,
        });
      }
    }
    return bricks;
  }

  // Handle paddle movement
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const rect = canvas.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    
    // Calculate new paddle position while keeping it within canvas bounds
    const newX = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, relativeX));
    
    // Update paddle position directly through the ref
    paddleRef.current.x = newX;
  };

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      const paddle = paddleRef.current;
      const ball = ballRef.current;

      // Draw bricks
      bricks.forEach(brick => {
        if (brick.visible) {
          ctx.fillStyle = '#FF0000';
          ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        }
      });

      // Draw paddle
      ctx.fillStyle = '#0095DD';
      ctx.fillRect(paddle.x, CANVAS_HEIGHT - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Draw ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#0095DD';
      ctx.fill();
      ctx.closePath();

      // Draw score
      ctx.font = '16px Arial';
      ctx.fillStyle = '#0095DD';
      ctx.fillText(`Score: ${score}`, 8, 20);
    };

    const update = () => {
      if (gameOver) return;
    
      const ball = ballRef.current;
      const paddle = paddleRef.current;
    
      // Move ball
      ball.x += ball.dx;
      ball.y += ball.dy;
    
      // Wall collisions
      if (ball.x + ball.radius > CANVAS_WIDTH || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
      }
      if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
      }
    
      // Paddle collision
      if (
        ball.y + ball.radius > CANVAS_HEIGHT - paddle.height &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width
      ) {
        // Add angle based on where the ball hits the paddle
        const hitPosition = (ball.x - paddle.x) / paddle.width;
        const angle = hitPosition * Math.PI - Math.PI / 2; // Maps position to angle between -π/2 and π/2
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        
        ball.dx = speed * Math.cos(angle);
        ball.dy = -speed * Math.abs(Math.sin(angle)); // Ensure upward movement
      }
    
      // Game over condition
      if (ball.y + ball.radius > CANVAS_HEIGHT) {
        setGameOver(true);
        return;
      }
    
      // Brick collision
      bricks.forEach((brick, index) => {
        if (!brick.visible) return;
    
        const ballCenterX = ball.x;
        const ballCenterY = ball.y;
    
        // Find the closest point on the brick to the ball
        const closestX = Math.max(brick.x, Math.min(ballCenterX, brick.x + brick.width));
        const closestY = Math.max(brick.y, Math.min(ballCenterY, brick.y + brick.height));
    
        // Calculate distance between closest point and ball center
        const distanceX = ballCenterX - closestX;
        const distanceY = ballCenterY - closestY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    
        if (distance <= ball.radius) {
          // Determine which side was hit
          const fromLeft = ballCenterX < brick.x;
          const fromRight = ballCenterX > brick.x + brick.width;
          const fromTop = ballCenterY < brick.y;
          const fromBottom = ballCenterY > brick.y + brick.height;
    
          // Reverse appropriate velocity component
          if ((fromLeft || fromRight) && Math.abs(distanceX) > Math.abs(distanceY)) {
            ball.dx = -ball.dx;
          } else if ((fromTop || fromBottom) && Math.abs(distanceY) > Math.abs(distanceX)) {
            ball.dy = -ball.dy;
          }
    
          // Update brick visibility and score
          setBricks(prev => {
            const newBricks = [...prev];
            newBricks[index] = { ...brick, visible: false };
            return newBricks;
          });
          setScore(prev => prev + 1);
        }
      });
    };

    const gameLoop = () => {
      update();
      render();
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [bricks, gameOver, score]);

  const handleRestart = () => {
    setGameOver(false);
    setScore(0);
    ballRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 30,
      dx: BALL.SPEED,
      dy: -BALL.SPEED,
      radius: BALL_RADIUS,
    };

    setBricks(prev => prev.map(brick => ({ ...brick, visible: true })));
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onMouseMove={handleMouseMove}
        className="border border-gray-300"
      />
      {gameOver && (
        <div className="text-center">
          <p className="text-xl mb-4">Game Over! Final Score: {score}</p>
          <button
            onClick={handleRestart}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default ArkanoidGame;
