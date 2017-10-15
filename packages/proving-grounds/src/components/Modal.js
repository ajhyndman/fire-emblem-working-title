// @flow
import React from 'react';

import { staticUrl } from '../../config';

type Props = {
  children?: React.Element<*>,
};

const BORDER_SIZE = 46;

const Modal = ({ children }: Props) => (
  <div className="root">
    <style jsx>{`
      .root {
        align-items: center;
        background-clip: padding-box;
        /* average of border-image color */
        background-color: #1c4654;
        border: ${BORDER_SIZE}px solid transparent;
        border-image: url(${staticUrl}Border_Blue.png) ${BORDER_SIZE} fill
          stretch;
        display: flex;
        flex-direction: column;
      }
    `}</style>
    {children}
  </div>
);

export default Modal;
