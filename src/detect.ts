import { UNKNOWN } from './const.js';

type FutureNavigator = Navigator & {
  userAgentData?: {
    platform: string;
  };
};

type GlobalContext = {
  navigator: FutureNavigator;
  safari?: unknown;
  webkit?: unknown;
};

const global: GlobalContext =
  typeof globalThis !== 'undefined' ?
    globalThis :
    self;

const nav = global.navigator || {};

export const needGesture = (global.safari || global.webkit) && ((nav.userAgentData || nav).platform || '').toLowerCase().indexOf('mac') > UNKNOWN;
export const needMultiTouch = !needGesture && nav.maxTouchPoints > 1;
