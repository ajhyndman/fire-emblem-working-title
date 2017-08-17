// @flow
import Router from 'next/router';
import ReactGA from 'react-ga';

function logPageView() {
  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname);
}

if (
  typeof window !== 'undefined' &&
  window.location.hostname === 'proving-grounds.ajhyndman.com'
) {
  ReactGA.initialize('UA-97182834-1');
  ReactGA.pageview(window.location.pathname);
  Router.onRouteChangeComplete = logPageView;
}

export default Router;
