import React, { FC, useMemo, useState } from 'react';

import { Modal } from '../common/Modal';
import { SideModalPropsType } from '../types';
import { Main } from './Main';
import { Network } from './Network';

export const SideModalSettings: FC<SideModalPropsType> = ({ close, ...props }) => {
  const [state, setState] = useState('main');

  const { title, back, component } = useMemo(() => {
    switch (state) {
      case 'network':
        return {
          title: 'Network',
          back: () => setState('main'),
          component: <Network setState={setState} />,
        };
      case 'main':
      default:
        return {
          title: 'Network',
          component: <Main setState={setState} />,
        };
    }
  }, [state, setState]);

  return (
    <Modal back={back} title={title} close={close} {...props}>
      {component}
    </Modal>
  );
};
