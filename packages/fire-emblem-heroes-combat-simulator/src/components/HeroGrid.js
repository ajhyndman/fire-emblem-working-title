// @flow
import React from 'react';
import { map, range, replace } from 'ramda';

import Hero from './Hero';


type Props = {
  heroes: Array<Object>;
};

const HeroGrid = ({ heroes }: Props) => (
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
      div:empty {
        margin: 0 5px;
        width: 56px;
      }
    `}</style>
    {map(
      (hero) => (
        <Hero
          key={hero.name}
          name={hero.name}
          weaponType={replace(' ', '_', hero.weaponType)}
        />
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
