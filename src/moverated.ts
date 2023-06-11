import type {
  MoveratedHandler,
  MoveratedPointer
} from './types.js';

import type {
  GestureEvent,
  MoveratedUnlisten
} from './listen.js';

import {
  listenBind
} from './listen.js';

import {
  calculateAngleDelta,
  calculateDistanceFactor,
  calculateExpFactor
} from './calc.js';

import {
  needGesture,
  needMultiTouch
} from './detect.js';

import {
  UNKNOWN
} from './const.js';

export const moverated = (el: EventTarget, handler: MoveratedHandler) => {
  let lastX = 0;
  let lastY = 0;
  let lastScale = 1;
  let lastRotate = 0;

  let lastGestureX = 0;
  let lastGestureY = 0;
  let lastGestureScale = 1;
  let lastGestureRotate = 0;

  let activePointerId = UNKNOWN;
  const activePointers: MoveratedPointer[] = [];

  const createFastPointerFind = (compare: (a: number, b: number) => boolean) => (id: number) => {
    for (let i = 0, length = activePointers.length; i < length; ++i) {
      if (compare(activePointers[i].p, id)) {
        return i;
      }
    }

    return UNKNOWN;
  };

  const fastFindPointer = createFastPointerFind((a, b) => a === b);
  const fastNextPointer = createFastPointerFind((a, b) => a !== b);

  const handle = (
    dx: number,
    dy: number,
    ds: number,
    dr: number
  ) => {
    handler({
      x: lastX,
      y: lastY,
      s: lastScale,
      r: lastRotate,

      dx,
      dy,
      ds,
      dr
    });
  };

  const updateGesture = (event: GestureEvent) => {
    lastGestureX = event.screenX;
    lastGestureY = event.screenY;
    lastGestureScale = event.scale;
    lastGestureRotate = event.rotation;
  };

  const handleGesture = (event: GestureEvent) => {
    const deltaX = event.screenX - lastGestureX;
    const deltaY = event.screenY - lastGestureY;
    const deltaRotate = event.rotation - lastGestureRotate;

    const scaleFactor = event.scale - lastGestureScale;
    const nextScale = Math.max(0, lastScale + scaleFactor);
    const deltaScale = nextScale - lastScale;

    lastX += deltaX;
    lastY += deltaY;
    lastScale = nextScale;
    lastRotate += deltaRotate;

    updateGesture(event);

    handle(deltaX, deltaY, deltaScale, deltaRotate);
  };

  const registerPointer = (event: PointerEvent) => {
    if (
      event.ctrlKey ||
      event.button !== 0
    ) {
      return;
    }

    const id = event.pointerId;

    activePointerId = id;
    activePointers.push({
      p: id,
      x: event.screenX,
      y: event.screenY
    });
  };

  const disposePointer = (event: PointerEvent) => {
    const id = event.pointerId;

    const pointerIndex = fastFindPointer(id);

    if (pointerIndex !== UNKNOWN) {
      activePointers.splice(pointerIndex, 1);
    }

    if (activePointerId === id) {
      if (activePointers.length === 0) {
        activePointerId = UNKNOWN;
      } else {
        activePointerId = activePointers[0].p;
      }
    }
  };

  const handlePointer = (event: PointerEvent) => {
    const id = event.pointerId;
    const pointerIndex = fastFindPointer(id);

    if (pointerIndex === UNKNOWN) {
      return;
    }

    const pointer = activePointers[pointerIndex];

    const nextX = event.screenX;
    const nextY = event.screenY;

    let deltaX = nextX - pointer.x;
    let deltaY = nextY - pointer.y;

    if (
      !needMultiTouch ||
      activePointers.length === 1
    ) {
      pointer.x = nextX;
      pointer.y = nextY;

      lastX += deltaX;
      lastY += deltaY;

      handle(deltaX, deltaY, 0, 0);

      return;
    }

    const activePointerIndex = id === activePointerId ?
      fastNextPointer(activePointerId) :
      fastFindPointer(activePointerId);

    if (activePointerIndex === UNKNOWN) {
      return;
    }

    const activePointer = activePointers[activePointerIndex];

    const scaleFactor = calculateDistanceFactor(
      activePointer.x,
      activePointer.y,
      pointer.x,
      pointer.y,
      nextX,
      nextY
    );

    const deltaScale = (lastScale * scaleFactor) - lastScale;

    const deltaRotate = calculateAngleDelta(
      activePointer.x,
      activePointer.y,
      pointer.x,
      pointer.y,
      nextX,
      nextY
    );

    deltaX *= 0.5;
    deltaY *= 0.5;

    pointer.x = nextX;
    pointer.y = nextY;

    lastX += deltaX;
    lastY += deltaY;

    lastScale *= scaleFactor;
    lastRotate += deltaRotate;

    handle(deltaX, deltaY, deltaScale, deltaRotate);

    activePointerId = id;
  };

  const handleWheel = (event: WheelEvent) => {
    const deltaMulti = event.deltaMode > 0 ? -100 : -1;

    const deltaX = deltaMulti * event.deltaX;
    const deltaY = deltaMulti * event.deltaY;
    const deltaZ = deltaMulti * event.deltaZ;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const absZ = Math.abs(deltaZ);

    if (absZ !== 0) {
      const deltaRotate = 0.15 * deltaZ;

      lastRotate += deltaRotate;

      handle(0, 0, 0, deltaRotate);

      return;
    }

    if (event.ctrlKey) {
      const delta = absX > absY ? deltaX : deltaY;

      if (event.shiftKey) {
        const deltaRotate = 0.15 * delta;

        lastRotate += deltaRotate;

        handle(0, 0, 0, deltaRotate);

        return;
      }

      const scaleFactor = calculateExpFactor(delta);
      const nextScale = Math.max(0, lastScale + scaleFactor);
      const deltaScale = nextScale - lastScale;

      lastScale = nextScale;

      handle(0, 0, deltaScale, 0);

      return;
    }

    lastX += deltaX;
    lastY += deltaY;

    handle(deltaX, deltaY, 0, 0);
  };

  const listen = listenBind(el);
  const listeners: MoveratedUnlisten[] = [];

  if (needGesture) {
    listeners.push(
      listen('gesturestart', updateGesture),
      listen('gestureend', updateGesture),
      listen('gesturechange', handleGesture)
    );
  }

  listeners.push(
    listen('wheel', handleWheel),
    listen('pointerdown', registerPointer),
    listen('pointerup', disposePointer),
    listen('pointerleave', disposePointer),
    listen('pointermove', handlePointer)
  );

  return () => {
    listeners.forEach((callback) => callback());
    listeners.length = 0;
  };
};
