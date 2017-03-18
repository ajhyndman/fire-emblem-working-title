// @flow
import Color from 'color-js';

export const colors = Object.freeze({
  elephant: '#123346',
  aquaIsland: '#9ad8da',
  fadedJade: '#40737d',
  iceberg: '#dcf2f3',
});

export const activateColor = (color: string) =>
  Color(color)
    .valueByAmount(0.2)
    .shiftHue(-6.3)
    .saturateByAmount(-0.14)
    .toString();

export const fontFamilies = Object.freeze({
  ui: '"Mandali", sans-serif',
});

export const transition = '0.2s';
