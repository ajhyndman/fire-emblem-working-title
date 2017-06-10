// @flow
import {
  compose,
  filter,
  flatten,
  map,
  prop,
} from 'ramda';

import event0 from './2017.02.10-narcian';
import event1 from './2017.03.09-ursula';
import event2 from './2017.03.25-michalis';
import event3 from './2017.04.04-navarre';
import event4 from './2017.04.20-zephiel';
import event5 from './2017.04.24-navarre';
import event6 from './2017.04.24-robin-f';
import event7 from './2017.05.02-xander';
import event8 from './2017.05.10-ursula';
import event9 from './2017.05.19-lloyd';
import event10 from './2017.05.26-narcian';
import event11 from './2017.06.02-camus';
import event12 from './2017.06.08-tempest-trials';
import event13 from './2017.06.09-zephiel';


export function getEventHeroes(allEvents: boolean = false) {
  const now = new Date();
  return compose(
    flatten,
    map(prop('unitList')),
    filter((event) => allEvents || (now >= event.startTime && now <= event.endTime)),
  )([
    event0,
    event1,
    event2,
    event3,
    event4,
    event5,
    event6,
    event7,
    event8,
    event9,
    event10,
    event11,
    event12,
    event13,
  ]);
}
