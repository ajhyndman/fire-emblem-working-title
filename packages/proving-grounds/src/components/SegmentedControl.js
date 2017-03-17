// @flow
import React from 'react';
import cn from 'classnames';
import { addIndex, map } from 'ramda';

type Props = {
  selected?: number;
  options: string[];
  onChange: (nextSelected: number) => void;
};

const SegmentedControl = ({ 
  selected,
  options,
  onChange,
}: Props) => (
  <div className="root">
    <style jsx>{`
      .root {
        display: flex;
        justify-content: space-around;
      }
      button {
        background: 
        flex-basis: ${(1 / options.length) * 100}%;
      }
      button.active {

      }
    `}</style>
    {addIndex(map)(
      (option, i) => (
        <button 
          className={cn({ active: (selected === i) })} 
          onClick={() => onChange(i)}
        >
          {option}
        </button>
      ),
      options,
    )}
  </div>
);

export default SegmentedControl;
