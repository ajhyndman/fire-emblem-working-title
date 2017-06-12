// @flow
import React from 'react';
import clipboard from 'clipboard-js';


type Props = {
  icon: ReactClass<*>;
  link: string;
  onClick: (link: string) => void;
  title?: string;
};

const ShareButton = ({ icon, link, onClick, title }: Props) => {
  const Icon = icon;
  return (
    <div className="root" title={title}>
      <style jsx>{`
        button {
          border: none;
          background: none;
          cursor: pointer;
          color: white;
          font-size: 30px;
          margin: 0;
          line-height: 1;
          padding: 5px;
        }
        button:focus {
          outline: none;
        }
      `}</style>
      <button
        onClick={() => {
          clipboard.copy(link);
          onClick(link);
        }}
      >
        <Icon style={{ display: 'block' }} />
      </button>
    </div>
  );
};

export default ShareButton;
