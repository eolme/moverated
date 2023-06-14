export type Moverated = {
  x: number;
  y: number;
  s: number;
  r: number;

  dx: number;
  dy: number;
  ds: number;
  dr: number;

  mx: number;
  my: number;
  mt: number;
};

export type MoveratedPointer = {
  p: number;

  x: number;
  y: number;

  mx: number;
  my: number;
  mt: number;
};

export type MoveratedHandler = (event: Moverated) => void;
