// @flow
import {
  any,
  assocPath,
  clamp,
  compose,
  concat,
  drop,
  findIndex,
  findLastIndex,
  isNil,
  not,
  reverse,
  update,
} from 'ramda';
import { updateRarity } from 'fire-emblem-heroes-calculator';
import type { HeroInstance, Rarity, Stat } from 'fire-emblem-heroes-calculator';
import type { SkillType } from 'fire-emblem-heroes-stats';

import type { State } from './store';

export type Action =
  | {
      type: 'CHANGE_EXPORT_STRING',
      value: string,
    }
  | {
      type: 'CHANGE_SEARCH_STRING',
      value: string,
    }
  | {
      type: 'DEQUEUE_NOTIFICATION',
    }
  | {
      type: 'ENQUEUE_NOTIFICATION',
      value: string,
    }
  | {
      type: 'SELECT_HERO',
      hero: ?(HeroInstance | 'CLEAR'),
    }
  | {
      type: 'SELECT_SKILL',
      skillType: SkillType | void,
    }
  | {
      type: 'SELECT_SLOT',
      slot: 0 | 1 | void,
    }
  | {
      type: 'SET_HOST',
      host: string,
    }
  | {
      type: 'SET_MERGE_LEVEL',
      value: number,
    }
  | {
      type: 'SET_PREVIEW_LEVEL',
      level: 1 | 40,
    }
  | {
      type: 'SHOW_GUIDE_CHANGE',
      value: boolean,
    }
  | {
      type: 'TOGGLE_AGGRESSOR',
    }
  | {
      type: 'UPDATE_BANE',
      stat: Stat,
    }
  | {
      type: 'UPDATE_BOON',
      stat: Stat,
    }
  | {
      type: 'UPDATE_RARITY',
      rarity: Rarity,
    }
  | {
      type: 'UPDATE_SKILL',
      skill: ?string,
      skillType: SkillType,
    };

export type Dispatch = (action: Action) => void;

const clearActiveState = {
  activeHero: undefined,
  activeSlot: undefined,
};

const hasEmptySlot = (state: State) => any(isNil, state.heroSlots);
const getEmptySlot = (state: State) => findIndex(isNil, state.heroSlots);
const getActiveHero = (state: State) =>
  state.activeSlot === undefined
    ? undefined
    : state.heroSlots[state.activeSlot];
const getLastOccupiedIndex = findLastIndex(compose(not, isNil));

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'CHANGE_EXPORT_STRING':
      return { ...state, exportString: action.value };
    case 'CHANGE_SEARCH_STRING':
      return { ...state, searchString: action.value };
    case 'DEQUEUE_NOTIFICATION':
      return { ...state, notifications: drop(1, state.notifications) };
    case 'ENQUEUE_NOTIFICATION':
      return {
        ...state,
        notifications: concat(state.notifications, [action.value]),
      };
    case 'SELECT_HERO':
      if (state.activeSlot !== undefined && action.hero === 'CLEAR') {
        // clear active slot
        return {
          ...state,
          ...clearActiveState,
          heroSlots: update(state.activeSlot, undefined, state.heroSlots),
        };
      } else if (action.hero === 'CLEAR') {
        // clear the hero in highest occupied index
        const lastIndex = getLastOccupiedIndex(state.heroSlots);
        return {
          ...state,
          ...clearActiveState,
          heroSlots:
            lastIndex === -1
              ? state.heroSlots
              : update(lastIndex, undefined, state.heroSlots),
        };
      } else if (state.activeSlot === undefined && hasEmptySlot(state)) {
        // move hero to first empty slot
        return {
          ...state,
          ...clearActiveState,
          heroSlots: update(getEmptySlot(state), action.hero, state.heroSlots),
        };
      } else if (state.activeSlot === undefined) {
        // select hero
        return { ...state, activeHero: action.hero };
      } else {
        // move hero to selected slot.
        return {
          ...state,
          ...clearActiveState,
          heroSlots: update(state.activeSlot, action.hero, state.heroSlots),
        };
      }
    case 'SELECT_SKILL':
      return { ...state, activeSkill: action.skillType };
    case 'SELECT_SLOT':
      return state.activeHero === 'CLEAR'
        ? action.slot === undefined
          ? // clear active states
            { ...state, ...clearActiveState }
          : // clear the selected slot
            {
              ...state,
              ...clearActiveState,
              heroSlots: update(action.slot, undefined, state.heroSlots),
            }
        : state.activeHero === undefined
          ? // activate slot
            { ...state, activeSlot: action.slot }
          : action.slot === undefined
            ? // clear active states
              { ...state, ...clearActiveState }
            : // select new hero
              {
                ...state,
                ...clearActiveState,
                heroSlots: update(
                  action.slot,
                  state.activeHero,
                  state.heroSlots,
                ),
              };
    case 'SET_HOST':
      return { ...state, host: action.host };
    case 'SET_MERGE_LEVEL': {
      if (getActiveHero(state) === undefined) return state;
      const mergeLevel = clamp(0, 10, action.value);
      return assocPath(
        ['heroSlots', state.activeSlot, 'mergeLevel'],
        mergeLevel,
        state,
      );
    }
    case 'SET_PREVIEW_LEVEL':
      return { ...state, previewLevel: action.level };
    case 'SHOW_GUIDE_CHANGE':
      return { ...state, showGuide: action.value };
    case 'TOGGLE_AGGRESSOR':
      return {
        ...state,
        heroSlots: reverse(state.heroSlots),
      };
    case 'UPDATE_BANE':
      if (getActiveHero(state) === undefined) return state;
      return assocPath(
        ['heroSlots', state.activeSlot, 'bane'],
        action.stat,
        state,
      );
    case 'UPDATE_BOON':
      if (getActiveHero(state) === undefined) return state;
      return assocPath(
        ['heroSlots', state.activeSlot, 'boon'],
        action.stat,
        state,
      );
    case 'UPDATE_RARITY':
      if (getActiveHero(state) === undefined) return state;
      return assocPath(
        ['heroSlots', state.activeSlot],
        // $FlowIssue: Flow thinks that getActiveHero might be undefined or null.
        updateRarity(getActiveHero(state), action.rarity),
        state,
      );
    case 'UPDATE_SKILL':
      if (getActiveHero(state) === undefined) return state;
      return assocPath(
        ['heroSlots', state.activeSlot, 'skills', action.skillType],
        action.skill,
        state,
      );
    default:
      return state;
  }
};

export default reducer;
