export interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
}

export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
}

export interface Paddle {
  x: number;
  width: number;
  height: number;
}
