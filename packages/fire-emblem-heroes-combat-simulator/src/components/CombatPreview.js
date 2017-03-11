// @flow
import React from 'react';

import Hero from './Hero';
import type { Dispatch } from '../reducer';


type Props = {
  activeSlot: ?number;
  dispatch: Dispatch;
  leftHero: ?Object;
  rightHero: ?Object;
};

const CombatPreview = ({ activeSlot, dispatch, leftHero, rightHero }: Props) => (
  <div className="root">
    <style jsx>{`
      .root {
        margin: 0 auto;
        width: ${56 * 3}px
      }
      .container {
        align-items: center;
        display: flex;
        height: ${56 * 2}px;
        justify-content: space-between;
      }
      .hero-slot {
        background: #27606f;
        cursor: pointer;
        height: 56px;
        position: relative;
        transition: box-shadow 0.2s;
        width: 56px;
      }
      .active {
        box-shadow: 0 0 8px 4px rgba(255, 255, 255, 0.5), 0 0 2px 4px rgba(223, 110, 134, 0.9);
      }
    `}</style>
    <div
      className="container"
    >
      <div
        className={`${activeSlot === 0 ? 'active' : ''} hero-slot`}
        onClick={(event) => {
          event.stopPropagation();
          dispatch({ type: 'ACTIVATE_SLOT', slot: 0 });
        }}
      >
        {leftHero
          ? <Hero name={leftHero.name} weaponType={leftHero.weaponType} />
          : null}
      </div>
      <div
        className={`${activeSlot === 1 ? 'active' : ''} hero-slot`}
        onClick={(event) => {
          event.stopPropagation();
          dispatch({ type: 'ACTIVATE_SLOT', slot: 1 });
        }}
      >
        {rightHero
          ? <Hero name={rightHero.name} weaponType={rightHero.weaponType} />
          : null}
      </div>
    </div>
  </div>
);

export default CombatPreview;
