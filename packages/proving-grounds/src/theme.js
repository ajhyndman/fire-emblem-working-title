// @flow
import Color from 'color-js';

export const colors = Object.freeze({
  elephant: '#123346',
  aquaIsland: '#9ad8da',
  fadedJade: '#40737d',
  frostedGlass: 'rgba(255, 255, 255, 0.2)',
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

export const fontSizes = Object.freeze({
  small: 13,
});

export const gridSize = 56;

export const lineHeights = Object.freeze({
  body: 1.375,
});

export const transition = '0.2s';
