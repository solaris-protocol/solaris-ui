import React, { FC } from 'react';

import { styled } from '@linaria/react';

const Wrapper = styled.div`
  width: 100%;
`;

export const RangeInput = styled.input`
  width: 100%;
  margin-bottom: 18px;

  background-color: transparent;

  -webkit-appearance: none;

  &:focus {
    outline: none;
  }

  &::-webkit-slider-runnable-track {
    width: 100%;
    height: 5px;

    background: linear-gradient(269.99deg, #dc1fff 0%, #00ffa3 99.99%);
    border-radius: 18px;
    cursor: pointer;
  }
  &:focus::-webkit-slider-runnable-track {
    background: linear-gradient(269.99deg, #dc1fff 0%, #00ffa3 99.99%);
  }
  &::-webkit-slider-thumb {
    width: 8px;
    height: 8px;
    margin-top: -2px;

    background: #1d171f;
    border: 1px solid #fff;
    border-radius: 50%;
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25), 0 0 12px rgba(255, 255, 255, 0.4), 0 0 0 3px rgb(144 122 153 / 50%);
    cursor: pointer;

    -webkit-appearance: none;
  }

  &::-moz-range-track {
    width: 100%;
    height: 5px;

    background: linear-gradient(269.99deg, #dc1fff 0%, #00ffa3 99.99%);
    border-radius: 18px;
    cursor: pointer;
  }
  &::-moz-range-thumb {
    width: 8px;
    height: 8px;

    background: #1d171f;
    border: 1px solid #fff;
    border-radius: 50%;
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25), 0 0 12px rgba(255, 255, 255, 0.4), 0 0 0 3px rgb(144 122 153 / 50%);
    cursor: pointer;
  }

  /* TODO: on ms system
  &::-ms-track {
    width: 100%;
    height: 5px;

    color: transparent;

    background: transparent;
    border-color: transparent;
    border-width: 16px 0;
    cursor: pointer;
  }
  &::-ms-fill-lower {
    background: linear-gradient(269.99deg, #dc1fff 0%, #00ffa3 99.99%);
    border: 0.2px solid #010101;
    border-radius: 18px;
    box-shadow: 1px 1px 1px #000, 0 0 1px #0d0d0d;
  }
  &::-ms-fill-upper {
    background: #3071a9;
    border: 0.2px solid #010101;
    border-radius: 2.6px;
    box-shadow: 1px 1px 1px #000, 0 0 1px #0d0d0d;
  }
  &::-ms-thumb {
    width: 16px;
    height: 36px;

    background: #fff;
    border: 1px solid #000;
    border-radius: 3px;
    box-shadow: 1px 1px 1px #000, 0 0 1px #0d0d0d;
    cursor: pointer;
  }
  &:focus::-ms-fill-lower {
    background: #3071a9;
  }
  &:focus::-ms-fill-upper {
    background: #367ebd;
  }
   */
`;

const Marks = styled.div`
  display: flex;
  justify-content: space-between;

  font-weight: 500;
  font-size: 12px;
  line-height: 15px;
  letter-spacing: 0.02em;
`;

const Safer = styled.span`
  color: #00ffa3;
`;

const Riskier = styled.span`
  color: #dc1fff;
`;

interface Props {
  value: number;
  onChange: (val: number) => void;
}

export const Range: FC<Props> = ({ value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <Wrapper>
      <RangeInput type="range" value={value} onChange={handleChange} />
      <Marks>
        <Safer>Safer</Safer>
        <Riskier>Riskier</Riskier>
      </Marks>
    </Wrapper>
  );
};
