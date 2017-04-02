// @flow
import React from 'react';
import Router from 'next/router';

import Hero from './Hero';
import { colors, gridSize, transition } from '../theme';
import { lookupStats } from '../heroHelpers';
import { staticUrl } from '../../config';
import type { Dispatch } from '../reducer';


type Props = {
  activeSlot: ?number;
  dispatch: Dispatch;
  leftHero: ?Object;
  rightHero: ?Object;
};

const openConfig = (event, dispatch, slot) => {
  event.preventDefault();
  dispatch({ type: 'SELECT_SLOT', slot: slot });
  Router.push('/configure');
};

const CombatPreview = ({ activeSlot, dispatch, leftHero, rightHero }: Props) => (
  <div className="root">
    <style jsx>{`
      .root {
        margin: 0 auto;
        width: ${gridSize * 3}px
      }
      .attack-indicator {
        box-sizing: border-box;
        cursor: pointer;
        display: block;
        padding: 5px;
        width: 30px;
        position: absolute;
        top: 30px;
        left: 50%;
        transform: translateX(-50%);
      }
      .configure-button {
        cursor: pointer;
        position: absolute;
        bottom: -${gridSize / 6}px;
        left: -${gridSize / 6}px;
        width: ${gridSize / 2}px;
      }
      .container {
        align-items: center;
        display: flex;
        height: ${gridSize * 1.5}px;
        justify-content: space-between;
      }
      .hero-slot {
        background: ${colors.frostedGlass};
        cursor: pointer;
        height: ${gridSize}px;
        position: relative;
        transition: box-shadow 0.2s;
        user-select: none;
        width: ${gridSize}px;
      }
      .hero-slot:hover {
        box-shadow: 0 5px 20px rgba(70, 183, 227, 0.5);
      }
      .active {
        box-shadow: 0 0 8px 4px rgba(255, 255, 255, 0.5), 0 0 2px 4px rgba(223, 110, 134, 0.9);
      }
      .active:hover {
        box-shadow: 0 0 8px 4px rgba(255, 255, 255, 0.5), 0 0 2px 4px rgba(223, 110, 134, 0.9);
      }
      .swap-button {
        box-sizing: border-box;
        cursor: pointer;
        display: block;
        opacity: 0.25;
        padding: 5px;
        width: 40px;
        height: 26.5px;
        transition: opacity ${transition};
        /* fix for weird flickering on Chrome */
        -webkit-backface-visibility: hidden;
      }
      .swap-button:hover {
        opacity: 1;
      }
      .swap-button:focus {
        outline: none;
      }
    `}</style>
    <div
      className="container"
    >
      <div
        className={`${activeSlot === 0 ? 'active' : ''} hero-slot`}
        onClick={(event) => {
          event.stopPropagation();
          dispatch({ type: 'SELECT_SLOT', slot: 0 });
        }}
        onContextMenu={event => openConfig(event, dispatch, 0)}
      >
        {leftHero
          ? (
            <div>
              <Hero
                name={leftHero.name}
                weaponType={lookupStats(leftHero.name).weaponType}
                rarity={leftHero.rarity}
              />
              <img
                className="configure-button"
                onClick={event => openConfig(event, dispatch, 0)}
                src={`${staticUrl}Button_Configure.png`}
                srcSet={`
                  ${staticUrl}28px-Button_Configure.png 28w,
                  ${staticUrl}56px-Button_Configure.png 56w
                `}
                sizes={`${gridSize / 2}px`}
              />
            </div>
          )
          : null}
      </div>
      <img
        className="swap-button"
        role="button"
        tabIndex={0}
        onClick={(event) => {
          event.stopPropagation();
          dispatch({ type: 'TOGGLE_AGGRESSOR' });
        }}
        src={`${staticUrl}Swap.png`}
        srcSet={`
          ${staticUrl}40px-Swap.png 40w,
          ${staticUrl}80px-Swap.png 80w,
          ${staticUrl}Swap.png 109w
        `}
        sizes="40px"
      />
      <div
        className={`${activeSlot === 1 ? 'active' : ''} hero-slot`}
        onClick={(event) => {
          event.stopPropagation();
          dispatch({ type: 'SELECT_SLOT', slot: 1 });
        }}
        onContextMenu={event => openConfig(event, dispatch, 1)}
      >
        {rightHero
          ? (
            <div>
              <Hero
                name={rightHero.name}
                weaponType={lookupStats(rightHero.name).weaponType}
                rarity={rightHero.rarity}
              />
              <img
                className="configure-button"
                onClick={event => openConfig(event, dispatch, 1)}
                src={`${staticUrl}Button_Configure.png`}
                srcSet={`
                  ${staticUrl}28px-Button_Configure.png 28w,
                  ${staticUrl}56px-Button_Configure.png 56w
                `}
                sizes={`${gridSize / 2}px`}
              />
            </div>
          )
          : null}
      </div>
    </div>
  </div>
);

export default CombatPreview;
