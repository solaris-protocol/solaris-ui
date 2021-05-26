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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
        'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
        'Helvetica Neue', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;

      background: var(--colors-background);
    }

    code {
      font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
        monospace;
    }
  }
`;
