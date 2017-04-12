// @flow
import React from 'react';
import { replace } from 'ramda';

import Frame from './Frame';
import { colors, fontFamilies, fontSizes, gridSize } from '../theme';
import { staticUrl } from '../../config';

type Rarity = 1 | 2 | 3 | 4 | 5;

type Props = {
  name: string;
  rarity?: Rarity;
  specialCooldown?: number;
  weaponType: ?string;
};

const CLASS_ICON_SIZE = 20;
const OVERSET = 4;

const HeroPortrait = ({ name, weaponType, rarity = 5, specialCooldown }: Props) => {
  const weaponTypeUri = weaponType ? replace(' ', '_', weaponType) : '';

  return (
    <div className="root">
      <style jsx>{`
        .root {
          position: relative;
          width: ${gridSize}px;
        }
        .backing {
          background-image: linear-gradient(170deg, ${colors.fadedJade}, ${colors.aquaIsland});
          height: ${gridSize}px;
          width: ${gridSize}px;
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
          text-shadow:
             -1px -1px 0 #000,
              1px -1px 0 #000,
              -1px 1px 0 #000,
               1px 1px 0 #000;
          top: ${CLASS_ICON_SIZE - OVERSET - 2}px;
          width: ${CLASS_ICON_SIZE}px;
        }
        .frame {
          pointer-events: none;
          position: absolute;
          top: ${-(0.07 * gridSize)}px;
          left: ${-(0.07 * gridSize)}px;
          width: ${1.14 * gridSize}px;
        }
      `}</style>
      <div className="backing" />
      <img
        className="portrait"
        title={name}
        alt={name}
        src={`${staticUrl}75px-Icon_Portrait_${encodeURIComponent(name)}.png`}
        srcSet={`
          ${staticUrl}113px-Icon_Portrait_${encodeURIComponent(name)}.png 113w,
          ${staticUrl}150px-Icon_Portrait_${encodeURIComponent(name)}.png 150w
        `}
        sizes={`${gridSize}px`}
      />
      <div className="frame">
        <Frame rarity={rarity} />
      </div>
      {weaponType && <img
        className="class"
        title={weaponType}
        src={`${staticUrl}35px-Icon_Class_${weaponTypeUri}.png`}
        srcSet={`
          ${staticUrl}35px-Icon_Class_${weaponTypeUri}.png 35w,
          ${staticUrl}Icon_Class_${weaponTypeUri}.png 56w
        `}
        sizes={`${CLASS_ICON_SIZE}px`}
      />}
      {(specialCooldown != null && specialCooldown !== -1)&& <span className="specialCooldown">
        {specialCooldown}
      </span>}
    </div>
  );
};

export default HeroPortrait;
