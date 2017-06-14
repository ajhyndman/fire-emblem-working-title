// @flow
import test from 'tape';

import {
  exportInstance,
  getDefaultInstance,
  importInstance,
} from '../src/heroInstance';
import { getDefaultSkills } from '../src/heroHelpers';


test('exportInstance', (t) => {
  t.plan(4);

  // default instance
  t.equal(
    exportInstance(getDefaultInstance('Anna')),
    `Anna (5★)\r
Weapon: Nóatún\r
Special: Astra\r
B: Vantage 3\r
C: Spur Res 3\r
`,
  );

  // with hero variance
  t.equal(
    exportInstance({
      ...getDefaultInstance('Anna', 4),
      mergeLevel: 8,
      boon: 'atk',
      bane: 'def',
    }),
    `Anna (4★+8 +atk -def)\r
Weapon: Silver Axe\r
Special: Astra\r
B: Vantage 2\r
C: Spur Res 3\r
`,
  );

  // with all skills
  t.equal(
    exportInstance({
      ...getDefaultInstance('Anna'),
      skills: {
        ...getDefaultSkills('Anna'),
        ASSIST: 'Reposition',
        PASSIVE_A: 'Fury 3',
        SEAL: 'HP +3',
      },
    }),
    `Anna (5★)\r
Weapon: Nóatún\r
Assist: Reposition\r
Special: Astra\r
A: Fury 3\r
B: Vantage 3\r
C: Spur Res 3\r
S: HP +3\r
`,
  );

  // with status effects
  t.equal(
    exportInstance({
      ...getDefaultInstance('Anna'),
      state: {
        hpMissing: 5,
        specialCharge: 1,
        buffs: {
          hp: 0,
          atk: 4,
          spd: 4,
          def: 8,
          res: 0,
        },
        debuffs: {
          hp: 0,
          atk: 3,
          spd: 3,
          def: 0,
          res: 3,
        },
      },
    }),
    `Anna (5★)\r
Weapon: Nóatún\r
Special: Astra\r
B: Vantage 3\r
C: Spur Res 3\r
:::Status\r
Buffs: atk 4, spd 4, def 8\r
Debuffs: atk -3, spd -3, res -3\r
Damage: 5\r
Charge: 1\r
`,
  );
});

test('importInstance', (t) => {
  t.plan(5);

  // default instance
  t.deepEqual(
    importInstance(`Anna (5★)
Weapon: Nóatún
Special: Astra
B: Vantage 3
C: Spur Res 3
`),
    getDefaultInstance('Anna'),
  );

  // default instance
  t.deepEqual(
    importInstance(`Anna (5★)
Weapon: Noatun
Special: Astra
B: Vantage 3
C: Spur Res 3
`),
    getDefaultInstance('Anna'),
  );

  // with hero variance
  t.deepEqual(
    importInstance(`Anna (4★+8 +atk -def)
Weapon: Silver Axe
Special: Astra
B: Vantage 2
C: Spur Res 3
`),
    {
      ...getDefaultInstance('Anna', 4),
      mergeLevel: 8,
      boon: 'atk',
      bane: 'def',
    },
  );

  // with all skills
  t.deepEqual(
    importInstance(`Anna (5★)
Weapon: Nóatún
Assist: Reposition
Special: Astra
A: Fury 3
B: Vantage 3
C: Spur Res 3
S: HP +3
`),
    {
      ...getDefaultInstance('Anna'),
      skills: {
        ...getDefaultSkills('Anna'),
        ASSIST: 'Reposition',
        PASSIVE_A: 'Fury 3',
        SEAL: 'HP +3',
      },
    },
  );

  // with status effects
  t.deepEqual(
    importInstance(`Anna (5★)
Weapon: Nóatún
Special: Astra
B: Vantage 3
C: Spur Res 3
:::Status
Buffs: atk 4, spd 4, def 8
Debuffs: atk -3, spd -3, res -3
Damage: 5
Charge: 1
`),
    {
      ...getDefaultInstance('Anna'),
      state: {
        hpMissing: 5,
        specialCharge: 1,
        buffs: {
          hp: 0,
          atk: 4,
          spd: 4,
          def: 8,
          res: 0,
        },
        debuffs: {
          hp: 0,
          atk: 3,
          spd: 3,
          def: 0,
          res: 3,
        },
      },
    },
  );
});
