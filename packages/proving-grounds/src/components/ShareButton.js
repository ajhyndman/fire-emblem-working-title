// @flow
import React from 'react';
import clipboard from 'clipboard-js';
import Link from 'react-icons/lib/go/link';
import Color from 'color-js';

import type { Dispatch } from '../reducer';
import {
  colors,
  fontFamilies,
  fontSizes,
  lineHeights,
} from '../theme';


type Props = {
  dispatch: Dispatch;
  link: string;
};

const ShareButton = ({ dispatch, link }: Props) => (
  <div className="root">
    <style jsx>{`
      button {
        border: none;
        background: none;
        cursor: pointer;
        color: white;
        font-family: 'Mandali', sans-serif;
        font-size: 30px;
        margin: 0;
        line-height: 1;
        padding: 5px;
      }
      button:focus {
        outline: none;
      }
      .root {
        position: relative;
      }
      .share-text {
        color: ${Color(colors.iceberg).setAlpha(0.75)};
        font-family: ${fontFamilies.ui};
        font-size: ${fontSizes.small}px;
        position: absolute;
        left: 0;
        bottom: -2px;
        text-align: center;
        text-shadow: 0.5px 1px 2px rgba(0, 0, 0, 0.8);
        width: 100%;
      }
    `}</style>
    <button
      onClick={() => {
        clipboard.copy(link);
        dispatch({
          type: 'ENQUEUE_NOTIFICATION',
          value: 'Link copied to clipboard!',
        });
      }}
    >
      <Link />
      <div className="share-text">Share</div>
    </button>
  </div>
);

export default ShareButton;
