import React, { FC, HTMLAttributes, InputHTMLAttributes, useEffect, useState } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

const InputElement = styled.input`
  position: relative;

  width: 100%;
  padding: 0;

  color: #fff;
  font-weight: 600;
  font-size: 30px;
  line-height: 37px;
  letter-spacing: 0.02em;

  background-color: transparent;
  border: none;
  outline: none;

  appearance: none;

  &.isZero {
    color: #45364d;
  }

  &::placeholder {
    color: #45364d;
  }

  &::before {
    position: absolute;

    display: block;

    color: #45364d;

    content: attr(placeholder);
  }
`;

interface Props {}

// TODO: Try to implement a less complex logic
export const Input: FC<Props & InputHTMLAttributes<HTMLInputElement>> = ({ value, onChange, className, ...props }) => {
  const [localValue, setLocalValue] = useState(String(value));

  useEffect(() => {
    const isSame = Number(value) === Number(localValue);
    const isLastDot = localValue.slice(-1) === '.';
    const isLastDotZero = localValue.slice(-2) === '.0';

    if (!isSame || (!isSame && !isLastDot && !isLastDotZero)) {
      setLocalValue(String(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChange) {
      return;
    }

    let nextValue = e.target.value
      .replace(',', '.')
      .replace(/[^\d.,]/g, '')
      .replace(/^0(\d+)/g, '$1')
      .replace(/^(\d*\.?)|(\d*)\.?/g, '$1$2');

    if (nextValue === '.') {
      nextValue = '0.';
    }

    // some hack in ultimate hack component
    e.target.value = nextValue;

    setLocalValue(e.target.value);
    onChange(e);
  };

  return (
    <InputElement
      {...props}
      value={localValue}
      onChange={handleChange}
      className={classNames(className, { isZero: !localValue })}
    />
  );
};
