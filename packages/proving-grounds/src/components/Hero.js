// @flow
import React from 'react';
import { replace } from 'ramda';

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
          width: 56px;
        }
        .class {
          left: -2px;
          position: absolute;
          top: -2px;
        }
        .face {
          display: block;
          margin: 0 auto;
        }
        .frame {
          pointer-events: none;
          position: absolute;
          top: -7.5%;
          left: -7.5%;
          width: 115%;
        }
      `}</style>
      <img
        className="frame"
        src={`${staticUrl}Frame_Rarity_5.png`}
      />
      <img
        className="class"
        title={weaponType}
        src={`${staticUrl}35px-Icon_Class_${weaponTypeUri}.png 35w`}
        srcSet={`
          ${staticUrl}35px-Icon_Class_${weaponTypeUri}.png 35w,
          ${staticUrl}Icon_Class_${weaponTypeUri}.png 56w
        `}
        sizes="20px"
      />
      <img
        className="face"
        title={name}
        alt={name}
        src={`${staticUrl}75px-Icon_Portrait_${encodeURIComponent(name)}.png`}
        srcSet={`
          ${staticUrl}113px-Icon_Portrait_${encodeURIComponent(name)}.png 113w,
          ${staticUrl}150px-Icon_Portrait_${encodeURIComponent(name)}.png 150w
        `}
        sizes="56px"
      />
    </div>
  );
};

export default Hero;
