export const GAME_CONSTANTS = {
  CANVAS: {
    WIDTH: 800,
    HEIGHT: 600,
  },
  PADDLE: {
    HEIGHT: 10,
    WIDTH: 75,
  },
  BALL: {
    RADIUS: 8,
    SPEED: 4,
  },
  BRICK: {
    ROWS: 5,
    COLS: 8,
    WIDTH: 80,
    HEIGHT: 20,
    PADDING: 10,
    TOP_OFFSET: 30,
    LEFT_OFFSET: 35,
  },
  COLORS: {
    BRICK: '#FF0000',
    BALL_AND_PADDLE: '#0095DD',
  },
} as const;