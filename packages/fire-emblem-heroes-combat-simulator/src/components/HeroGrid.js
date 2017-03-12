// @flow
import React from 'react';
import { map, range } from 'ramda';

import Hero from './Hero';
import type { Dispatch } from '../reducer';


type Props = {
  activeHeroName: ?string;
  dispatch: Dispatch;
  heroes: Array<Object>;
};

const HeroGrid = ({ activeHeroName, dispatch, heroes }: Props) => (
  <div className="grid">
    <style jsx>{`
      .grid {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
      }
      .grid:after {
        content: "";
        flex: auto;
      }
      .gridSquare {
        background: #5e7b8a;
        box-shadow: 0 0 10px rgba(70, 183, 227, 0.4);
        cursor: pointer;
        height: 56px;
        margin: 5px;
        position: relative;
        transition: box-shadow 0.2s;
        width: 56px;
      }
      .gridSquare:hover {
        box-shadow: 0 5px 20px rgba(70, 183, 227, 0.5);
      }
      .active, .active:hover {
        box-shadow: 0 0 8px 4px rgba(255, 255, 255, 0.5), 0 0 2px 4px rgba(223, 110, 134, 0.9);
      }
      div:empty {
        margin: 0 5px;
        width: 56px;
      }
    `}</style>
    {map(
      (hero) => (
        <div
          className={`gridSquare ${activeHeroName === hero.name ? 'active' : ''}`}
          onClick={(event) => {
            event.stopPropagation();
            dispatch({ type: 'SELECT_HERO', hero })
          }}
        >
          <Hero
            key={hero.name}
            name={hero.name}
            weaponType={hero.weaponType}
          />
        </div>
      ),
      heroes,
    )}
    {/**
      * Flexbox doesn't really provide grid support.  Add enough empty
      * elements to preserve grid layout of last row on large screens.
      */}
    {map((i) => <div key={i} />, range(0, 30))}
  </div>
);

export default HeroGrid;
