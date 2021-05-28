import React, { FC, useState } from 'react';

import { styled } from '@linaria/react';
import { rgba } from 'polished';

import { ENDPOINTS } from 'app/contexts/connection';
import { useConnectionConfig } from 'app/contexts/connection';

import { Modal } from '../common/Modal';
import { SideModalPropsType } from '../types';

const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

const ItemLabelWrapper = styled.label`
  display: flex;
  align-items: center;
  height: 70px;
  padding: 0 45px;

  border-top: 1px solid ${rgba('#907A99', 0.1)};
  cursor: pointer;

  &:last-child {
    border-bottom: 1px solid ${rgba('#907A99', 0.1)};
  }
`;

const RadioHidden = styled.input`
  position: absolute;
  z-index: -1;

  width: 20px;
  height: 20px;

  opacity: 0;

  &:checked + span::before,
  &:focus + span::before {
    background: #78468c;
    border: none;
  }

  &:checked + span::after {
    opacity: 1;
  }
`;

const RadioVisible = styled.span`
  position: relative;

  padding-left: 40px;

  color: #fff;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.02em;

  &::before {
    position: absolute;

    top: 0;
    left: 0;

    width: 20px;
    height: 20px;

    background-color: rgba(144, 122, 153, 0.2);
    border: 2px solid #907a99;
    border-radius: 20px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

    content: '';
  }

  &::after {
    position: absolute;

    top: 5px;
    left: 5px;

    width: 10px;
    height: 10px;

    background-color: #fff;
    border-radius: 20px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

    opacity: 0;

    transition: opacity 0.2s;

    content: '';
  }
`;

export const SideModalNetwork: FC<SideModalPropsType> = ({ close, ...props }) => {
  const { endpoint, setEndpoint } = useConnectionConfig();

  const handleEndpointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndpoint(e.target.value);
  };

  return (
    <Modal noAnimation title="Settings" close={close} {...props}>
      <Content onChange={handleEndpointChange}>
        {ENDPOINTS.map((endpointItem) => (
          <ItemLabelWrapper key={endpointItem.endpoint}>
            <RadioHidden
              type="radio"
              defaultChecked={endpoint === endpointItem.endpoint}
              value={endpointItem.endpoint}
              name="endpoint"
            />
            <RadioVisible>{endpointItem.name}</RadioVisible>
          </ItemLabelWrapper>
        ))}
      </Content>
    </Modal>
  );
};
