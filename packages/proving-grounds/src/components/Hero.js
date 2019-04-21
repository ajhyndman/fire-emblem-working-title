// @flow
import React from 'react';
import { replace } from 'ramda';
import type { Assets } from 'fire-emblem-heroes-stats';
import type { MergeLevel, Rarity } from 'fire-emblem-heroes-calculator';

import Frame from './Frame';
import { colors, fontFamilies, fontSizes, gridSize } from '../theme';
import { staticUrl } from '../../config';

type Props = {
  assets: Assets,
  mergeLevel?: MergeLevel,
  name: string,
  rarity?: Rarity,
  specialCooldown?: number,
  weaponType: ?string,
};

const FRAME_WIDTH = gridSize * 1.14;
const CLASS_ICON_SIZE = 20;
const OVERSET = 4;

const HeroPortrait = ({
  assets,
  mergeLevel = 0,
  name,
  weaponType,
  rarity = 5,
  specialCooldown,
}: Props) => {
  const weaponTypeUri = weaponType ? replace(' ', '_', weaponType) : '';

  return (
    <div className="root">
      <style jsx>{`
        .root {
          position: relative;
          width: ${gridSize}px;
        }
        .backing {
          background-image: url(${staticUrl}Pane_${mergeLevel <= 0 ? rarity : 'Plus'}.png);
          background-size: 100% auto;
          height: ${FRAME_WIDTH}px;
          width: ${FRAME_WIDTH}px;
          position: absolute;
          top: ${-(0.07 * gridSize)}px;
          left: ${-(0.07 * gridSize)}px;
        }
        .class {
          height: ${CLASS_ICON_SIZE}px;
          left: -${OVERSET}px;
          position: absolute;
          top: -${OVERSET}px;
          width: ${CLASS_ICON_SIZE}px;
        }
        .portrait {
          display: block;
          height: ${gridSize}px;
          left: 0;
          margin: 0 auto;
          position: absolute;
          top: 0;
          width: ${gridSize}px;
        }
        .specialCooldown {
          color: ${colors.blushPink};
          font-family: ${fontFamilies.ui};
          font-size: ${fontSizes.medium}px;
          font-weight: bold;
          left: -${OVERSET}px;
          line-height: 1;
          position: absolute;
          text-align: center;
          /* simulated text-stroke: https://css-tricks.com/adding-stroke-to-web-text/ */
          text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
            1px 1px 0 #000;
          top: ${CLASS_ICON_SIZE - OVERSET - 2}px;
          width: ${CLASS_ICON_SIZE}px;
        }
        .frame {
          pointer-events: none;
          position: absolute;
          top: ${-(0.07 * gridSize)}px;
          left: ${-(0.07 * gridSize)}px;
          width: ${FRAME_WIDTH}px;
        }
      `}</style>
      <div className="backing" />
      <img
        className="portrait"
        title={name}
        alt={name}
        src={assets.portrait['75px']}
        srcSet={`
          ${encodeURI(assets.portrait['113px'])} 113w,
          ${encodeURI(assets.portrait['150px'])} 150w
        `}
        sizes={`${gridSize}px`}
      />
      <div className="frame">
        <Frame rarity={rarity} />
      </div>
      {weaponType && (
        <img
          className="class"
          title={weaponType}
          src={`${staticUrl}35px-Icon_Class_${weaponTypeUri}.png`}
          srcSet={`
          ${staticUrl}35px-Icon_Class_${weaponTypeUri}.png 35w,
          ${staticUrl}Icon_Class_${weaponTypeUri}.png 56w
        `}
          sizes={`${CLASS_ICON_SIZE}px`}
        />
      )}
      {specialCooldown !== undefined && specialCooldown !== -1 && (
        <span className="specialCooldown">{specialCooldown}</span>
      )}
    </div>
  );
};

export default HeroPortrait;
