// @flow

export const staticUrl = process.env.NODE_ENV === 'production'
  ? 'https://proving-grounds-static.ajhyndman.com/'
  : '/static/cdn/';
