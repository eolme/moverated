export type Moverated = {
  x: number;
  y: number;
  s: number;
  r: number;

  dx: number;
  dy: number;
  ds: number;
  dr: number;
};

export type MoveratedPointer = {
  p: number;
  x: number;
  y: number;
};

export type MoveratedHandler = (event: Moverated) => void;
