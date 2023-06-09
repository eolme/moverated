export type GestureEvent = WheelEvent & {
  rotation: number;
  scale: number;
}

export type MoveratedUnlisten = () => void;

export type MoveratedListen = {
  (name: 'wheel', listener: (event: WheelEvent) => void): MoveratedUnlisten;
  (name: 'gesturestart' | 'gesturechange' | 'gestureend', listener: (event: GestureEvent) => void): MoveratedUnlisten;
  (name: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointerleave', listener: (event: PointerEvent) => void): MoveratedUnlisten;
};

const listenOptions = { passive: false } as EventListenerOptions;

export const listenBind = (el: EventTarget): MoveratedListen => (name, listener) => {
  const listen = (event: Event) => {
    event.preventDefault();
    event.returnValue = false;

    listener(event as any);

    return false;
  };

  el.addEventListener(name, listen, listenOptions);

  return () => {
    el.removeEventListener(name, listen, listenOptions);
  }
};
