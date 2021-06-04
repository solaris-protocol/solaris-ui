import { css } from '@linaria/core';

import { darkTheme } from './themes/dark';

export const globalCss = css`
  :global() {
    html,
    body,
    #root {
      height: 100%;
    }

    body[data-theme='light'] {
      /* TODO */
    }

    body[data-theme='dark'] {
      ${darkTheme}
    }

    body {
      font-family: 'Montserrat', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;

      background: var(--colors-background);
    }

    a {
      text-decoration: none;

      transition: color 0.3s;
    }

    button {
      white-space: nowrap;

      border: none;
      cursor: pointer;

      transition: color 0.3s;

      appearance: none;

      &:hover {
        color: #fff;
      }
    }

    &::-webkit-scrollbar {
      width: 8px !important;
      height: 8px !important;
    }

    &::-webkit-scrollbar-track {
      background: none;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.08);
      border-radius: 4px;
    }
  }
`;
