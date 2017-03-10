// @flow
import React from 'react';


type Props = {
  name: string;
  weaponType: string;
};

const Hero = ({ name, weaponType }: Props) => (
  <div className="root">
    <style jsx>{`
      .root {
        background: #5e7b8a;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
        cursor: pointer;
        margin: 5px;
        position: relative;
        transition: box-shadow 0.2s;
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
      .root:hover {
        box-shadow: 0 5px 30px rgba(0, 0, 0, 0.6);
      }
    `}</style>
    <img
      className="class"
      title={weaponType}
      src={`/static/35px-Icon_Class_${weaponType}.png 35w`}
      srcSet={`
        /static/35px-Icon_Class_${weaponType}.png 35w,
        /static/Icon_Class_${weaponType}.png 56w
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

export default Hero;
