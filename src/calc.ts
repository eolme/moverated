import { RAD_TO_DEG } from './const.js';

export const calculateAbsolute = Math.abs;

const calculateDegrees = (radians: number) => RAD_TO_DEG * radians;

const calculateAngleBetween = (
  ax: number,
  ay: number,
  bx: number,
  by: number
) => Math.atan2((ax * by) - (ay * bx), (ax * bx) + (ay * by));

export const calculateAngleDelta = (
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number
) => calculateDegrees(calculateAngleBetween(bx - ax, by - ay, cx - ax, cy - ay));

const calculateHypot = Math.hypot || ((a: number, b: number) => Math.sqrt((a * a) + (b * b)));

const calculateDistance = (
  ax: number,
  ay: number,
  bx: number,
  by: number
) => calculateHypot(ax - bx, ay - by);

export const calculateDistanceFactor = (
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number
) => calculateDistance(ax, ay, cx, cy) / calculateDistance(ax, ay, bx, by);

export const calculateExpFactor = (a: number) => Math.sign(a) * (Math.exp(0.01 * calculateAbsolute(a)) - 1);
