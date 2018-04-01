// @flow
import React from 'react';
import { getSpecialCooldown } from 'fire-emblem-heroes-calculator';
import { getHero } from 'fire-emblem-heroes-stats';

import HeroPortrait from './Hero';
import HeroSlot from './HeroSlot';
import Router from '../router';
import { gridSize, transition } from '../theme';
import { staticUrl } from '../../config';
import type { Dispatch } from '../reducer';

type Props = {
  activeSlot: ?number,
  dispatch: Dispatch,
  leftHero: ?Object,
  rightHero: ?Object,
};

const openConfig = (event, dispatch, slot) => {
  event.preventDefault();
  // Need to select the slot without putting activeHero or null in the slot.
  dispatch({ type: 'SELECT_SLOT', slot: undefined });
  dispatch({ type: 'SELECT_HERO', hero: undefined });
  dispatch({ type: 'SELECT_SLOT', slot: slot });
  Router.push('/build');
};

const CombatPreview = ({
  activeSlot,
  dispatch,
  leftHero,
  rightHero,
}: Props) => (
  <div className="root">
    <style jsx>{`
      .root {
        margin: 0 auto;
        width: ${gridSize * 3}px;
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
      .build-button {
        cursor: pointer;
        position: absolute;
        bottom: -${gridSize / 6}px;
        left: -${gridSize / 6}px;
        width: ${gridSize / 2}px;
      }
      .build-button-active {
        opacity: 0;
        transition: opacity ${transition};
      }
      .build-button-active:hover {
        opacity: 1;
      }
      .container {
        align-items: center;
        display: flex;
        height: ${gridSize * 1.5}px;
        justify-content: space-between;
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
    <div className="container">
      <HeroSlot
        isActive={activeSlot === 0}
        onClick={() => {
          dispatch({ type: 'SELECT_SLOT', slot: 0 });
        }}
      >
        {leftHero && (
          <div onContextMenu={event => openConfig(event, dispatch, 0)}>
            <HeroPortrait
              assets={getHero(leftHero.name).assets}
              mergeLevel={leftHero.mergeLevel}
              name={leftHero.name}
              weaponType={getHero(leftHero.name).weaponType}
              rarity={leftHero.rarity}
              specialCooldown={getSpecialCooldown(leftHero)}
            />
            <img
              className="build-button"
              src={`${staticUrl}Button_Build.png`}
              srcSet={`
                ${staticUrl}28px-Button_Build.png 28w,
                ${staticUrl}56px-Button_Build.png 56w
              `}
              sizes={`${gridSize / 2}px`}
            />
            <img
              className="build-button build-button-active"
              onClick={event => openConfig(event, dispatch, 0)}
              src={`${staticUrl}Button_Build_Active.png`}
              srcSet={`
                ${staticUrl}28px-Button_Build_Active.png 28w,
                ${staticUrl}56px-Button_Build_Active.png 56w
              `}
              sizes={`${gridSize / 2}px`}
            />
          </div>
        )}
      </HeroSlot>
      <img
        className="swap-button"
        role="button"
        tabIndex={0}
        onClick={event => {
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
      <HeroSlot
        isActive={activeSlot === 1}
        onClick={() => {
          dispatch({ type: 'SELECT_SLOT', slot: 1 });
        }}
      >
        {rightHero && (
          <div onContextMenu={event => openConfig(event, dispatch, 1)}>
            <HeroPortrait
              assets={getHero(rightHero.name).assets}
              mergeLevel={rightHero.mergeLevel}
              name={rightHero.name}
              weaponType={getHero(rightHero.name).weaponType}
              rarity={rightHero.rarity}
              specialCooldown={getSpecialCooldown(rightHero)}
            />
            <img
              className="build-button"
              src={`${staticUrl}Button_Build.png`}
              srcSet={`
                ${staticUrl}28px-Button_Build.png 28w,
                ${staticUrl}56px-Button_Build.png 56w
              `}
              sizes={`${gridSize / 2}px`}
            />
            <img
              className="build-button build-button-active"
              onClick={event => openConfig(event, dispatch, 1)}
              src={`${staticUrl}Button_Build_Active.png`}
              srcSet={`
                ${staticUrl}28px-Button_Build_Active.png 28w,
                ${staticUrl}56px-Button_Build_Active.png 56w
              `}
              sizes={`${gridSize / 2}px`}
            />
          </div>
        )}
      </HeroSlot>
    </div>
  </div>
);

export default CombatPreview;
