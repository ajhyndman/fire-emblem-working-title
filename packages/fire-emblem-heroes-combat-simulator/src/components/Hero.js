// @flow
import React from 'react';

type Props = { name: string; };

const Hero = ({ name }: Props) => (
  <div className="root">
    <style jsx>{`
      .root {
        margin: 10px;
      }
      img {
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
        display: block;
        margin: 0 auto;
      }
    `}</style>
    <img
      title={name}
      alt={name}
      src={`/static/75px-Icon_Portrait_${encodeURIComponent(name)}.png`}
      srcSet={`
        /static/113px-Icon_Portrait_${encodeURIComponent(name)}.png 1.5x,
        /static/150px-Icon_Portrait_${encodeURIComponent(name)}.png 2x
      `}
    />
  </div>
);

export default Hero;
