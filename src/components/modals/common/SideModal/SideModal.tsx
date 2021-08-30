import React, { FC } from 'react';
import { CSSTransition } from 'react-transition-group';

import { styled } from '@linaria/react';
import { rgba } from 'polished';

import ArrowIcon from 'assets/icons/arrow-icon.svg';
import CloseIcon from 'assets/icons/close-icon.svg';
import { CommonModalPropsType } from 'components/modals/types';

const TRANSITION_DURATION = 600;

const OutsideWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;

  width: 100%;
  height: 100%;
`;

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1;

  display: flex;
  flex-direction: column;
  width: 423px;
  height: 100%;

  background: ${rgba('#130E14', 0.99)};
  border-color: ${rgba('#907A99', 0.2)};
  border-style: solid;
  border-width: 1px 1px 1px 0;
  border-radius: 0 30px 30px 0;

  /* starting ENTER animation */
  &.transition-enter {
    transform: translateX(-423px);
  }

  /* ending ENTER animation */
  &.transition-enter-active {
    transform: translateX(0);

    transition: transform ${TRANSITION_DURATION}ms cubic-bezier(0.7, -0.4, 0.4, 1.4);
  }

  /* starting EXIT animation */
  &.transition-exit {
    transform: translateX(0);
  }

  /* ending EXIT animation */
  &.transition-exit-active {
    transform: translateX(-423px);

    transition: transform ${TRANSITION_DURATION}ms cubic-bezier(0.7, -0.4, 0.4, 1.4);
  }
`;

const Header = styled.div`
  position: relative;

  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  height: 140px;
`;

const BackWrapper = styled.div`
  position: absolute;
  left: 35px;

  cursor: pointer;
`;

// @ts-ignore
const BackIcon = styled(ArrowIcon)`
  height: 28px;

  color: #fff;

  transform: rotate(180deg);
`;

const Title = styled.span`
  color: #fff;
  font-weight: bold;
  font-size: 30px;
  line-height: 37px;
  letter-spacing: 0.02em;
`;

const Content = styled.div`
  flex-basis: 510px;
`;

const ButtonClose = styled.button`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  align-self: center;
  height: 45px;
  margin-bottom: 20px;
  padding: 0 40px;

  color: #907a99;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: 0.02em;

  background: transparent;
`;

// @ts-ignore
const CloseIconStyled = styled(CloseIcon)`
  margin-top: -1px;
  margin-right: 10px;
`;

interface Props {
  noAnimation?: boolean;
  back?: () => void;
  title: string | React.ReactNode;
}

export const SideModal: FC<Props & CommonModalPropsType> = ({
  noAnimation,
  back,
  title,
  close,
  children,
  ...props
}) => {
  const handleOutsideWrapperClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      close();
    }
  };

  return (
    <OutsideWrapper onMouseDown={handleOutsideWrapperClick}>
      <CSSTransition timeout={noAnimation ? 0 : 600} classNames="transition" {...props}>
        <Wrapper>
          <Header>
            {back ? (
              <BackWrapper onClick={back}>
                <BackIcon />
              </BackWrapper>
            ) : null}
            <Title>{title}</Title>
          </Header>
          <Content>{children}</Content>
          <ButtonClose onClick={close}>
            <CloseIconStyled /> Close
          </ButtonClose>
        </Wrapper>
      </CSSTransition>
    </OutsideWrapper>
  );
};
