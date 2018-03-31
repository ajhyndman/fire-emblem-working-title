// @flow
import React from 'react';

import { colors, gridSize } from '../theme';

type Props = {|
  // TODO: refine this type after upgrading React!
  children: any,
  isActive: boolean,
  onClick: (event: SyntheticMouseEvent<>) => void,
|};

const HeroSlot = ({ children, isActive, onClick }: Props) => (
  <div
    className={`${isActive ? 'active' : ''} hero-slot`}
    onClick={event => {
      event.stopPropagation();
      onClick(event);
    }}
  >
    <style jsx>{`
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
        box-shadow: 0 0 8px 4px rgba(255, 255, 255, 0.5),
          0 0 2px 4px rgba(223, 110, 134, 0.9);
      }
      .active:hover {
        box-shadow: 0 0 8px 4px rgba(255, 255, 255, 0.5),
          0 0 2px 4px rgba(223, 110, 134, 0.9);
      }
    `}</style>
    {children}
  </div>
);

export default HeroSlot;
