// @flow
import React from 'react';
import { storiesOf } from '@kadira/storybook';
import { withState } from 'recompose';

import Hero from '../src/components/Hero';
import Input from '../src/components/Input';
import RaritySelector from '../src/components/RaritySelector';
import SegmentedControl from '../src/components/SegmentedControl';

storiesOf('Hero', module)
  .add('default', () => (
    <Hero name="Anna" weaponType="Green Axe" />
  ));

storiesOf('Input', module)
  .add('default', () => (
    <Input />
  ));

storiesOf('RaritySelector', module)
  .add('default', () => {
    const RaritySelectorStory = withState('selected', 'setSelected', 4)(
      ({ selected, setSelected }) => (
        <RaritySelector
          disabled={[true, true, false, false, false]}
          onChange={setSelected}
          selected={selected}
        />
      ),
    );
    return <RaritySelectorStory />;
  });

storiesOf('SegmentedControl', module)
  .add('default', () => {
    const SegmentedControlStory = withState('selected', 'setSelected', 0)(
      ({ selected, setSelected }) => (
        <SegmentedControl
          onChange={setSelected}
          options={['Lv 1', 'Lv 40']}
          selected={selected}
        />
      ),
    );
    return <SegmentedControlStory />;
  });
