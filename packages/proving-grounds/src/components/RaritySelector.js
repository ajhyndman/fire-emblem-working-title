// @flow
import React from 'react';
import { map } from 'ramda';
import cn from 'classnames';

import { staticUrl } from '../../config';
import type { Rarity } from '../heroInstance';


type Props = {
  disabled?: [boolean, boolean, boolean, boolean, boolean];
  selected: Rarity;
  onChange: (rarity: Rarity) => void;
};

const RaritySelector = ({
  disabled = [false, false, false, false, false],
  selected,
  onChange,
}: Props) => (
  <div className="root">
    <style jsx>{`
      .root {
        display: flex;
      }
      img {
        cursor: pointer;
        filter: brightness(0);
        width: 30px;
      }
      img:focus {
        outline: none;
      }
      .active {
        filter: none;
      }
      .active.disabled {
        filter: opacity(35%);
      }
      .disabled {
        cursor: default;
        filter: opacity(35%) brightness(0);
      }
    `}</style>
    {map(
      i => {
        const isDisabled = disabled[i - 1];
        return (
          <img
            key={`${i}`}
            role="button"
            tabIndex="0"
            className={cn({
              active: i <= selected,
              disabled: isDisabled,
            })}
            onClick={() => { if (!isDisabled) onChange(i); }}
            src={`${staticUrl}20px-Icon_Rarity_${selected}.png`}
            srcSet={`
              ${staticUrl}20px-Icon_Rarity_${selected}.png 20w,
              ${staticUrl}40px-Icon_Rarity_${selected}.png 40w
            `}
            sizes="30px"
          />
        );
      },
      [1, 2, 3, 4, 5],
    )}
  </div>
);

export default RaritySelector;
