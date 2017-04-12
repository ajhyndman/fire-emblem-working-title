// @flow
import React from 'react';

import { calculateResult } from '../damageCalculation';
import { getStat } from '../heroHelpers';
import { getSpecialCooldown } from '../skillHelpers';
import { staticUrl } from '../../config';
import type { HeroInstance } from '../store';
import { colors } from '../theme';


type DamageInfoProps = {
  damage: number;
  numAttacks: number;
  specialDamage: number;
};

type CombatResultProps = {
  leftHero: ?HeroInstance;
  rightHero: ?HeroInstance;
};

const DamageInfo = ({damage, numAttacks, specialDamage}: DamageInfoProps) => (
  <span>
    <style jsx>{`
      .special-damage {
        color: ${colors.specialColor};
      }
    `}</style>
    {(isNaN(damage) ? '?' : numAttacks > 0 ? `${damage}` : '')}
    {(numAttacks > 1 ? ` × ${numAttacks}` : '')}
    <span className="special-damage">{(specialDamage > 0 ? ` +${specialDamage}` : '')}</span>
  </span>
);

const CombatResult = ({ leftHero, rightHero }: CombatResultProps) => {
  let result = leftHero && rightHero
    ? calculateResult(
      leftHero,
      rightHero,
      getStat(leftHero, 'hp'),
      getStat(rightHero, 'hp'),
      getSpecialCooldown(leftHero),
      getSpecialCooldown(rightHero),
    ) : undefined;

  return (
    <div className="root">
      <style jsx>{`
        .root {
          height: 80px;
        }
        .attack-indicator {
          display: block;
          width: 40px;
          filter: grayscale(100%);
        }
        .container {
          align-items: center;
          display: flex;
          justify-content: space-between;
          margin: 0 auto;
          width: 320px;
        }
        .result {
          align-self: stretch;
          flex-basis: 40%;
        }
        h1 {
          color: white;
          font-family: 'Mandali', sans-serif;
          line-height: 1;
          margin: 10px 0 0;
          text-align: center;
        }
        h2 {
          color: white;
          font-family: 'Mandali', sans-serif;
          line-height: 1;
          margin: 10px 0 0;
          text-align: center;
        }
      `}</style>
      {leftHero && rightHero && result
        ? (
          <div className="container">
            <div className="result">
              <h1>{`${
                !isNaN(getStat(leftHero, 'hp')) ? getStat(leftHero, 'hp') : '?'
              } → ${
                !isNaN(result.attackerHpRemaining) ? result.attackerHpRemaining : '?'
              }`}</h1>
              <h2><DamageInfo
                    damage={result.attackerDamage}
                    numAttacks={result.attackerNumAttacks}
                    specialDamage={result.attackerSpecialDamage}
                  /></h2>
            </div>
            <img
              className="attack-indicator"
              role="presentation"
              src={`${staticUrl}Attack.png`}
              srcSet={`
                ${staticUrl}40px-Attack.png 40w,
                ${staticUrl}Attack.png 71w
              `}
              sizes="40px"
            />
            <div className="result">
              <h1>{`${
                !isNaN(getStat(rightHero, 'hp')) ? getStat(rightHero, 'hp') : '?'
              } → ${
                !isNaN(result.defenderHpRemaining) ? result.defenderHpRemaining : '?'
              }`}</h1>
              <h2><DamageInfo
                    damage={result.defenderDamage}
                    numAttacks={result.defenderNumAttacks}
                    specialDamage={result.defenderSpecialDamage}
                  /></h2>
            </div>
          </div>
        )
        : null}
    </div>
  );
};

export default CombatResult;
