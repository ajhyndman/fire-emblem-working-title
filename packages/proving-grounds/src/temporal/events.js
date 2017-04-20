// @flow
import {
  compose,
  filter,
  flatten,
  map,
  prop,
} from 'ramda';

import event0 from './2017.03.09-ursula';
import event1 from './2017.03.25-michalis';
import event2 from './2017.04.04-navarre';
import event3 from './2017.04.20-zephiel';


export function getEventHeroes(allEvents: boolean = false) {
  const now = new Date();
  return compose(
    flatten,
    map(prop('unitList')),
    filter((event) => allEvents || (now >= event.startTime && now <= event.endTime)),
  )([event1, event2, event3]);
}
