/* eslint-disable flowtype/require-valid-file-annotation */

const options = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};

export const deployTimestamp = process.env.NODE_ENV === 'production'
  ? new Date(require('./deployTimestamp').deployTimestamp).toDateString(undefined, options)
  : new Date(0).toLocaleDateString(undefined, options);

export const staticUrl = process.env.NODE_ENV === 'production'
  ? 'https://proving-grounds-static.ajhyndman.com/'
  : '/static/cdn/';
