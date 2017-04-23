// @flow
import React from 'react';
import type { Rarity } from 'fire-emblem-heroes-calculator';

import { gridSize } from '../theme';
import { staticUrl } from '../../config';

type Props = {
  rarity: Rarity;
};

const FRAME_WIDTH = gridSize * 1.14;
const IMAGE_FRAME_WIDTH = 176;
const IMAGE_WIDTH = 220;

const Frame = ({ rarity }: Props) => {
  const offset = (rarity - 1) * -FRAME_WIDTH;

  return (
    <div className="root" style={{ backgroundPosition: `top ${offset}px left` }}>
      <style jsx>{`
        .root {
          background-image: url(${staticUrl}MiniFace.png);
          background-size: ${(IMAGE_WIDTH / IMAGE_FRAME_WIDTH) * 100}% auto;
          width: ${FRAME_WIDTH}px;
          height: ${FRAME_WIDTH}px;
        }
      `}</style>
    </div>
  );
};

export default Frame;
