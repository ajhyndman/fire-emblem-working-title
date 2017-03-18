// @flow
import React from 'react';
import { storiesOf, action } from '@kadira/storybook';

import Hero from '../src/components/Hero';
import Input from '../src/components/Input';
import SegmentedControl from '../src/components/SegmentedControl';

storiesOf('Hero', module)
  .add('default', () => (
    <Hero name="Anna" weaponType="Green Axe" />
  ));

storiesOf('Input', module)
  .add('default', () => (
    <Input />
  ));

storiesOf('SegmentedControl', module)
  .add('default', () => (
    <SegmentedControl onChange={action('SELECT_SEGMENT')} options={['Lv 1', 'Lv 40']} />
  ));
