// @flow
import React from 'react';
import cn from 'classnames';

import Assist from './Assist';
import Passive from './Passive';
import Special from './Special';
import Weapon from './Weapon';
import { getSkillInfo } from '../../skillHelpers';
import { activateColor, colors, fontFamilies, fontSizes, transition } from '../../theme';


type Props = {
  active?: boolean;
  name: string;
  onClick?: (name: string) => void;
  showGuide?: boolean;
};

const Skill = ({ active, name, onClick, showGuide }: Props) => {
  const skill = getSkillInfo(name);

  return (
    <div
      className={cn('root', { active })}
      onClick={() => { if (onClick) onClick(name); }}
    >
      <style jsx>{`
        .root {
          border-top: 2px solid ${colors.aquaIsland};
          border-bottom: 2px solid ${colors.fadedJade};
          cursor: pointer;
          position: relative;
          transition:
            box-shadow ${transition},
            border-top ${transition},
            border-bottom ${transition};
        }
        .root.active {
          border-top: 2px solid ${activateColor(colors.aquaIsland)};
          border-bottom: 2px solid ${activateColor(colors.fadedJade)};
        }
        .root:hover, .root.active {
          box-shadow: 0 5px 20px rgba(70, 183, 227, 0.5);
        }
        .root::before, .root::after {
          background-image: linear-gradient(to bottom, ${colors.aquaIsland}, ${colors.fadedJade});
          content: "";
          display: block;
          position: absolute;
          top: -2px;
          bottom: -2px;
          transition: background-image ${transition};
          width: 2px;
        }
        .root.active::before, .root.active::after {
          background-image: linear-gradient(
            to bottom,
            ${activateColor(colors.aquaIsland)},
            ${activateColor(colors.fadedJade)}
          );
        }
        .root::before {
          left: -2px;
        }
        .root::after {
          right: -2px;
        }

        .exception {
          color: ${colors.iceberg};
          font-family: ${fontFamilies.ui};
          font-size: ${fontSizes.medium}px;
          font-weight: bold;
          line-height: 1;
          padding: 10px;
        }
      `}</style>
      {(() => {
        if (!skill) return <div className="exception">--</div>;
        switch (skill.type) {
          case 'ASSIST':
            return <Assist showGuide={showGuide} skill={skill} />;
          case 'PASSIVE_A':
          case 'PASSIVE_B':
          case 'PASSIVE_C':
            return <Passive showGuide={showGuide} skill={skill} />;
          case 'SPECIAL':
            return <Special showGuide={showGuide} skill={skill} />;
          case 'WEAPON':
            return <Weapon showGuide={showGuide} skill={skill} />;
        }
      })()}
    </div>
  );
};

export default Skill;
