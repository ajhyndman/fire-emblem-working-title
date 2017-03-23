// @flow
import Link from 'next/link';
import React from 'react';
import withRedux from 'next-redux-wrapper';

// import Home from './index';
import initStore from '../src/store';


type State = {};

class Configure extends React.Component {
  state: State;

  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div>
        <h1>Configure</h1>
        <Link href="/" prefetch>Go back</Link>
      </div>
    );
  }
}

export default withRedux(initStore, state => ({ state }))(Configure);
