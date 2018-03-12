// @flow
import React from 'react';
import type { Rarity } from 'fire-emblem-heroes-calculator';

import { gridSize } from '../theme';
import { staticUrl } from '../../config';

type Props = {
  rarity: Rarity,
};

const FRAME_WIDTH = gridSize * 1.14;

const Frame = ({ rarity }: Props) => (
  <div className="root">
    <style jsx>{`
      .root {
        background-image: url(${staticUrl}Frame_${rarity}.png);
        background-size: 100% auto;
        width: ${FRAME_WIDTH}px;
        height: ${FRAME_WIDTH}px;
      }
    `}</style>
  </div>
);

export default Frame;
