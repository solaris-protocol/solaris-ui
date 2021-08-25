import React, { FC, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import { Closed } from './Closed';
import { Opened } from './Opened';

const WIDTH_CLOSED = 110;
const WIDTH_OPENED = 260;
const TRANSITION_DURATION = 400;
const TRANSITION_DURATION_SMART = 300;

const PlaceHandler = styled.div`
  position: relative;

  flex-shrink: 0;
  width: ${WIDTH_CLOSED}px;

  transition: width ${TRANSITION_DURATION}ms cubic-bezier(0.7, -0.4, 0.4, 1.4);

  &.isOpen {
    width: ${WIDTH_OPENED}px;
  }
`;

const TransitionGroupWrapper = styled.div`
  /* starting ENTER animation */
  .transition-enter {
    opacity: 0;
  }

  /* ending ENTER animation */
  .transition-enter-active {
    opacity: 1;

    transition: opacity ${TRANSITION_DURATION}ms ease-in-out;
  }

  /* starting EXIT animation */
  .transition-exit {
    opacity: 1;
  }

  /* ending EXIT animation */
  .transition-exit-active {
    opacity: 0;

    transition: opacity ${TRANSITION_DURATION_SMART}ms ease-in-out;
  }
`;

const Main = styled.div`
  position: fixed;

  display: flex;
  flex-direction: column;
  align-items: center;

  width: ${WIDTH_CLOSED}px;
  height: 100%;
  padding: 30px 26px;

  background: #130e14;
  border-right: 1px solid #201a22;

  &.isOpen {
    width: ${WIDTH_OPENED}px;
  }
`;

const Logo = styled.div`
  flex-shrink: 0;
  width: 50px;
  height: 50px;

  background: url('./logo.svg') no-repeat 50% 50%;
  background-size: 50px;

  &.isOpen {
    width: 60px;
    height: 60px;

    background-size: 60px;
  }
`;

const Solaris = styled.div`
  width: 162px;
  height: 36px;
  margin: 20px 0 40px;

  background: url('./solaris-protocol.svg') no-repeat 50% 50%;
`;

const Delimiter = styled.div`
  width: 25px;
  height: 2px;
  margin: 20px 0;

  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
`;

export const SideBar: FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSidebarToggleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!(e.target as HTMLElement).closest('a') && !(e.target as HTMLElement).closest('button')) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <PlaceHandler className={classNames({ isOpen })}>
      <TransitionGroup component={TransitionGroupWrapper}>
        <CSSTransition key={isOpen ? 'open' : 'close'} timeout={300} classNames="transition">
          <Main className={classNames({ isOpen })} onClick={handleSidebarToggleClick}>
            <Logo className={classNames({ isOpen })} />
            {isOpen ? <Solaris /> : <Delimiter />}
            {isOpen ? <Opened /> : <Closed />}
          </Main>
        </CSSTransition>
      </TransitionGroup>
    </PlaceHandler>
  );
};
