// @flow
import React from 'react';

type Props = {
  onClick?: (event: Event) => void,
  children?: any,
};

class Overlay extends React.Component {
  props: Props;

  componentDidMount() {
    if (document.body) document.body.style.overflowY = 'hidden';
  }

  componentWillUnmount() {
    if (document.body) document.body.style.overflowY = 'auto';
  }

  render() {
    const { onClick, children } = this.props;
    let root: HTMLElement;

    return (
      <div
        className="root"
        onClick={event => {
          if (event.target === root && onClick) onClick(event);
        }}
        ref={node => {
          root = node;
        }}
      >
        <style jsx>{`
          .root {
            position: fixed;
            top: 0;
            bottom: 0;
            right: 0;
            left: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 2;
            overflow: auto;
          }
        `}</style>
        {children}
      </div>
    );
  }
}

export default Overlay;
