// @flow
import React from 'react';
import type { WeaponSkill } from 'fire-emblem-heroes-stats';

import { colors, fontFamilies, fontSizes } from '../../theme';

type Props = {
  showGuide?: boolean,
  skill: WeaponSkill,
};

const Weapon = ({ showGuide, skill }: Props) => (
  <div className="root">
    <style jsx>{`
      .root {
        color: ${colors.iceberg};
        font-family: ${fontFamilies.ui};
        font-size: ${fontSizes.medium}px;
        line-height: 1;
        padding: 10px;
      }
      .name {
        font-weight: bold;
      }
      .stat-name {
        color: ${colors.aquaIsland};
        font-size: ${fontSizes.small}px;
        font-weight: bold;
      }
      .stat-value {
        font-size: ${fontSizes.small}px;
        font-weight: bold;
      }
      .description {
        font-size: ${fontSizes.small}px;
      }
      .row:not(:last-of-type) {
        margin-bottom: 5px;
      }
    `}</style>
    <div className="row">
      <span className="name">{skill.name}</span>
    </div>
    {showGuide && (
      <div>
        <div className="row">
          <span className="stat-name">Mt </span>
          <span className="stat-value">{skill['damage(mt)']}</span>
          <span className="stat-name"> Rng </span>
          <span className="stat-value">{skill['range(rng)']}</span>
        </div>
        <div className="row">
          <span
            className="description"
            dangerouslySetInnerHTML={{ __html: skill.effect }}
          />
        </div>
      </div>
    )}
  </div>
);

export default Weapon;
