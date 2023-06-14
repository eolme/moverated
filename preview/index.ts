/// <reference types="vite/client" />

import type { Moverated } from '../src/types.js';

import './index.css';

import { moverated } from '../src/moverated.js';
import { needGesture, needMultiTouch } from '../src/detect.js';

const $ = (id: string): HTMLElement => document.getElementById(id)!;

const value = (move: Moverated, key: keyof Moverated) => `${key}:${'\u00A0'.repeat(move[key] < 0 ? 1 : 2)}${move[key].toFixed(3)}`;
const print = (...values: string[]) => values.join('\n');

const info = $('info');
const box = $('box');

const absolute = $('absolute');
const relative = $('relative');
const pointer = $('pointer');

info.textContent = `gesture: ${needGesture} | multitouch: ${needMultiTouch}`;

moverated(document, (move) => {
  requestAnimationFrame(() => {
    absolute.textContent = print(
      value(move, 'x'),
      value(move, 'y'),
      value(move, 'r'),
      value(move, 's')
    );

    relative.textContent = print(
      value(move, 'dx'),
      value(move, 'dy'),
      value(move, 'dr'),
      value(move, 'ds')
    );

    pointer.textContent = print(
      value(move, 'mx'),
      value(move, 'my'),
      value(move, 'mt')
    );

    box.style.transform = `translate(${move.x}px, ${move.y}px) rotate(${move.r}deg) scale(${move.s})`;
  });
});

