// @flow
import React from 'react';
import {
  calculateResult,
  getStat,
} from 'fire-emblem-heroes-calculator';
import type { HeroInstance } from 'fire-emblem-heroes-calculator';

import { staticUrl } from '../../config';
import { colors, fontSizes } from '../theme';


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
  <span className="root">
    <style jsx>{`
      .root {
        position: relative;
      }
      .special-damage {
        color: ${colors.blushPink};
        font-size: ${fontSizes.medium}px;
        position: absolute;
        right: -5px;
        top: 0;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        transform: translate(100%, 75%);
      }
    `}</style>
    {(isNaN(damage) ? '?' : numAttacks > 0 ? `${damage}` : '')}
    {(numAttacks > 1 ? ` × ${numAttacks}` : '')}
    <span className="special-damage">{(specialDamage > 0 ? ` +${specialDamage}` : '')}</span>
  </span>
);

const CombatResult = ({ leftHero, rightHero }: CombatResultProps) => {
  let result = leftHero && rightHero
    ? calculateResult(leftHero, rightHero) : undefined;

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
      {leftHero && rightHero && result && (
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
      )}
    </div>
  );
};

export default CombatResult;
