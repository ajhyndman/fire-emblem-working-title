// @flow
import React from 'react';
import { replace } from 'ramda';


type Props = {
  name: string;
  weaponType: string;
};

const Hero = ({ name, weaponType }: Props) => {
  const weaponTypeUri = replace(' ', '_', weaponType);

  return (
    <div className="root">
      <style jsx>{`
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
          position: absolute;
          top: -7.5%;
          left: -7.5%;
          width: 115%;
        }
      `}</style>
      <img
        className="frame"
        src="/static/Frame_Rarity_5.png"
      />
      <img
        className="class"
        title={weaponType}
        src={`/static/35px-Icon_Class_${weaponTypeUri}.png 35w`}
        srcSet={`
          /static/35px-Icon_Class_${weaponTypeUri}.png 35w,
          /static/Icon_Class_${weaponTypeUri}.png 56w
        `}
        sizes="20px"
      />
      <img
        className="face"
        title={name}
        alt={name}
        src={`/static/75px-Icon_Portrait_${encodeURIComponent(name)}.png`}
        srcSet={`
          /static/113px-Icon_Portrait_${encodeURIComponent(name)}.png 113w,
          /static/150px-Icon_Portrait_${encodeURIComponent(name)}.png 150w
        `}
        sizes="56px"
      />
    </div>
  );
};

export default Hero;
