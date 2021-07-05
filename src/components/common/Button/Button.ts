import { styled } from '@linaria/react';

export const withTopTooltip = `
  &::before {
    position: absolute;
    bottom: calc(15px + 100%);
    z-index: 1;

    display: block;
    width: max-content;
    max-width: 300px;
    padding: 15px 20px;

    color: #907A99;
    font-family: Roboto, sans-serif;
    font-size: 12px;
    text-align: left;
    line-height: 17px;
    letter-spacing: 0.01em;
    text-transform: none;
    word-wrap: break-word;
    word-break: break-word;
    white-space: normal;
    overflow-wrap: break-word;
    hyphens: auto;

    background-color: #2A202E;
    border-radius: 10px;
    opacity: 0.95;

    content: attr(aria-label);
  }

  &::after {
    position: absolute;
    bottom: calc(9px + 100%);

    display: block;
    width: 10px;
    height: 10px;

    background-color: #2A202E;
    border-radius: 2px;
    transform: rotate(-45deg);
    opacity: 0.95;

    content: '';
  }
`;

export const Button = styled.button`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;
  height: 45px;
  padding: 0 20px;

  color: #907a99;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: 0.02em;
  text-align: center;
  text-transform: uppercase;

  background-color: rgba(255, 255, 255, 0.02);
  border-radius: 5px;

  transition: background-color 200ms ease-in-out, color 200ms ease-in-out;

  &:hover {
    color: #fff;

    background-color: rgba(255, 255, 255, 0.05);
  }

  &:disabled {
    color: #907a99;

    background-color: rgba(255, 255, 255, 0.05);

    cursor: default;
  }

  &.full {
    width: 100%;
  }

  &[aria-label] {
    &:hover,
    &:focus {
      ${withTopTooltip}
    }
  }
`;
