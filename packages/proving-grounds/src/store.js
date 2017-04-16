// @flow
import analytics from 'redux-analytics';
import ReactGA from 'react-ga';
import { forEach, map } from 'ramda';
import { applyMiddleware, createStore } from 'redux';

import reducer from './reducer';
import type { HeroInstance } from './heroInstance';


export type State = {
  host: string;
  activeHero: ?(HeroInstance | 'CLEAR');
  activeSlot: 0 | 1 | void;
  heroSlots: [?HeroInstance, ?HeroInstance];
  notifications: Array<string>;
  previewLevel: 1 | 40;
  searchString: string;
  showGuide: boolean;
};

const emptyState: State = {
  activeHero: undefined,
  activeSlot: undefined,
  heroSlots: [undefined, undefined],
  host: '',
  notifications: [],
  previewLevel: 40,
  searchString: '',
  showGuide: false,
};

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

const initStore = (initialState: State = emptyState) => {
  return createStore(reducer, initialState, applyMiddleware(gaMiddleware));
};

export default initStore;
