// @flow
import React from 'react';
import { replace } from 'ramda';

import { colors, gridSize } from '../theme';
import { staticUrl } from '../../config';


type Props = {
  name: string;
  weaponType: string;
};

const Hero = ({ name, weaponType }: Props) => {
  const weaponTypeUri = replace(' ', '_', weaponType);

  return (
    <div className="root">
      <style jsx>{`
        .root {
          position: relative;
          width: ${gridSize}px;
        }
        .class {
          left: -2px;
          position: absolute;
          top: -2px;
        }
        .portrait {
          background-image: linear-gradient(170deg, ${colors.fadedJade}, ${colors.aquaIsland});
          display: block;
          margin: 0 auto;
        }
        .frame {
          pointer-events: none;
          position: absolute;
          top: ${-(0.075 * gridSize)}px;
          left: ${-(0.075 * gridSize)}px;
          width: ${1.15 * gridSize}px;
        }
      `}</style>
      <img
        className="frame"
        src={`${staticUrl}Frame_Rarity_5.png`}
      />
      <img
        className="class"
        title={weaponType}
        src={`${staticUrl}35px-Icon_Class_${weaponTypeUri}.png`}
        srcSet={`
          ${staticUrl}35px-Icon_Class_${weaponTypeUri}.png 35w,
          ${staticUrl}Icon_Class_${weaponTypeUri}.png 56w
        `}
        sizes="20px"
      />
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
    </div>
  );
};

export default Hero;
