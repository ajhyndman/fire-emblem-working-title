// @flow
import React from 'react';
import clipboard from 'clipboard-js';
import Link from 'react-icons/lib/go/link';


type Props = {
  link: string;
};

const ShareButton = ({ link }: Props) => (
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
    `}</style>
    <button onClick={() => clipboard.copy(link)}>
      <Link />
    </button>
  </div>
);

export default ShareButton;
