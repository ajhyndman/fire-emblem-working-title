// @flow
import analytics from 'redux-analytics';
import ReactGA from 'react-ga';
import { forEach, map } from 'ramda';

import type { HeroInstance } from '../heroInstance';
import type { State } from '.';


const gaMiddleware = analytics(({ type, payload }, state: State) => {
  switch (type) {
    case 'CREATED_SHARE_LINK':
      // TODO: I'm not sure which of these formats is goign to prove most
      // interesting, so I'm just sending them all for now!
      ReactGA.event({
        category: 'SOCIAL',
        action: 'created share link',
        label: payload.url,
      });
      ReactGA.event({
        category: 'SOCIAL',
        action: 'shared heroes',
        label: JSON.stringify(map(
          (heroInstance: ?HeroInstance) => heroInstance && heroInstance.name,
          state.heroSlots,
        )),
      });
      forEach(
        (heroInstance: ?HeroInstance) => {
          if (heroInstance) {
            ReactGA.event({
              category: 'SOCIAL',
              action: `shared ${heroInstance.name}`,
            });
          }
        },
        state.heroSlots,
      );
      break;
    default:
      // pass
  }
});

export default gaMiddleware;
