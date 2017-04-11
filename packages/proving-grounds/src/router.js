// @flow
import Router from 'next/router';

export const push = (route: string) => {
  ga('set', 'page', route);
  ga('send', 'pageview');
  Router.push(route);
};
