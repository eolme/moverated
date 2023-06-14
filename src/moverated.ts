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
  calculateAbsolute,
  calculateAngleDelta,
  calculateDistanceFactor,
  calculateExpFactor
} from './calc.js';

import {
  needGesture,
  needMultiTouch
} from './detect.js';

import {
  EVENT_ID,
  EVENT_TIME,
  EVENT_X,
  EVENT_Y,
  LENGTH,
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
    for (let i = 0, length = activePointers[LENGTH]; i < length; ++i) {
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
    dr: number,
    mx: number,
    my: number,
    mt: number
  ) => {
    handler({
      x: lastX,
      y: lastY,
      s: lastScale,
      r: lastRotate,

      dx,
      dy,
      ds,
      dr,

      mx,
      my,
      mt
    });
  };

  const updateGesture = (event: GestureEvent) => {
    lastGestureX = event[EVENT_X];
    lastGestureY = event[EVENT_Y];
    lastGestureScale = event.scale;
    lastGestureRotate = event.rotation;
  };

  const handleGesture = (event: GestureEvent) => {
    const deltaX = event[EVENT_X] - lastGestureX;
    const deltaY = event[EVENT_Y] - lastGestureY;
    const deltaRotate = event.rotation - lastGestureRotate;

    const scaleFactor = event.scale - lastGestureScale;
    const nextScale = Math.max(0, lastScale + scaleFactor);
    const deltaScale = nextScale - lastScale;

    lastX += deltaX;
    lastY += deltaY;
    lastScale = nextScale;
    lastRotate += deltaRotate;

    updateGesture(event);

    handle(deltaX, deltaY, deltaScale, deltaRotate, 0, 0, 0);
  };

  const registerPointer = (event: PointerEvent) => {
    if (
      event.ctrlKey ||
      event.button > 0
    ) {
      return;
    }

    const id = event[EVENT_ID];

    activePointerId = id;
    activePointers.push({
      p: id,

      x: event[EVENT_X],
      y: event[EVENT_Y],

      mx: 0,
      my: 0,
      mt: event[EVENT_TIME]
    });
  };

  const disposePointer = (event: PointerEvent) => {
    const id = event[EVENT_ID];

    const pointerIndex = fastFindPointer(id);

    if (pointerIndex !== UNKNOWN) {
      if (activePointers[LENGTH] === 1) {
        const pointer = activePointers[pointerIndex];

        handle(0, 0, 0, 0, pointer.mx, pointer.my, event[EVENT_TIME] - pointer.mt);
      }

      activePointers.splice(pointerIndex, 1);
    }

    if (activePointerId === id) {
      if (activePointers[LENGTH] < 1) {
        activePointerId = UNKNOWN;
      } else {
        activePointerId = activePointers[0].p;
      }
    }
  };

  const handlePointer = (event: PointerEvent) => {
    const id = event[EVENT_ID];
    const pointerIndex = fastFindPointer(id);

    if (pointerIndex === UNKNOWN) {
      return;
    }

    const pointer = activePointers[pointerIndex];

    const nextX = event[EVENT_X];
    const nextY = event[EVENT_Y];

    let deltaX = nextX - pointer.x;
    let deltaY = nextY - pointer.y;

    if (
      !needMultiTouch ||
      activePointers[LENGTH] === 1
    ) {
      pointer.x = nextX;
      pointer.y = nextY;

      pointer.mx += calculateAbsolute(deltaX);
      pointer.my += calculateAbsolute(deltaY);

      lastX += deltaX;
      lastY += deltaY;

      handle(deltaX, deltaY, 0, 0, 0, 0, 0);

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

    handle(deltaX, deltaY, deltaScale, deltaRotate, 0, 0, 0);

    activePointerId = id;
  };

  const handleWheel = (event: WheelEvent) => {
    const deltaMulti = event.deltaMode > 0 ? -100 : -1;

    const deltaX = deltaMulti * event.deltaX;
    const deltaY = deltaMulti * event.deltaY;
    const deltaZ = deltaMulti * event.deltaZ;

    const absX = calculateAbsolute(deltaX);
    const absY = calculateAbsolute(deltaY);
    const absZ = calculateAbsolute(deltaZ);

    if (absZ !== 0) {
      const deltaRotate = 0.15 * deltaZ;

      lastRotate += deltaRotate;

      handle(0, 0, 0, deltaRotate, 0, 0, 0);

      return;
    }

    if (event.ctrlKey) {
      const delta = absX > absY ? deltaX : deltaY;

      if (event.shiftKey) {
        const deltaRotate = 0.15 * delta;

        lastRotate += deltaRotate;

        handle(0, 0, 0, deltaRotate, 0, 0, 0);

        return;
      }

      const scaleFactor = calculateExpFactor(delta);
      const nextScale = Math.max(0, lastScale + scaleFactor);
      const deltaScale = nextScale - lastScale;

      lastScale = nextScale;

      handle(0, 0, deltaScale, 0, 0, 0, 0);

      return;
    }

    lastX += deltaX;
    lastY += deltaY;

    handle(deltaX, deltaY, 0, 0, 0, 0, 0);
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
    listeners[LENGTH] = 0;
  };
};
