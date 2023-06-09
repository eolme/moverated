import { RAD_TO_DEG } from "./const.js";

export const calculateDegrees = (radians: number) => RAD_TO_DEG * radians;

const calculateAngle = (
  ax: number,
  ay: number,
  bx: number,
  by: number
) => RAD_TO_DEG * Math.atan2(by - ay, bx - ax);

export const calculateAngleDelta = (
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number
) =>  calculateAngle(ax, ay, cx, cy) - calculateAngle(ax, ay, bx, by);

const calculateDistance = (
  ax: number,
  ay: number,
  bx: number,
  by: number
) => Math.hypot(ax - bx, ay - by);

export const calculateDistanceFactor = (
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number
) => calculateDistance(ax, ay, cx, cy) / calculateDistance(ax, ay, bx, by);

export const calculateExpFactor = (a: number) => Math.exp(-0.01 * a);
