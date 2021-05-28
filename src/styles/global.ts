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
      transition: color 0.3s;
    }

    button {
      border: none;
      cursor: pointer;

      transition: color 0.3s;

      appearance: none;

      &:hover {
        color: #fff;
      }
    }
  }
`;
