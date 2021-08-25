import React, { ElementType, useCallback, useContext, useMemo, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';

import { SideModalSettings } from 'components/modals/SideModalSettings';
import { SideModalWallet } from 'components/modals/SideModalWallet';
import { ModalStake } from 'components/modals/stakeModals/ModalStake';
import { CommonModalPropsType, CommonModalType } from 'components/modals/types';

type ModalState = { modalName: CommonModalType; modalId: number; props: any };

const modalsMap = new Map<CommonModalType, ElementType<CommonModalPropsType>>([
  ['wallet', SideModalWallet],
  ['settings', SideModalSettings],
  ['stake', ModalStake],
]);

let modalId = 0;

const ModalsContext = React.createContext<{
  openModal: (modalName: CommonModalType, props?: any) => void;
  closeModal: (modalId: number) => void;
  closeTopModal: () => void;
}>({
  openModal: () => {},
  closeModal: () => {},
  closeTopModal: () => {},
});

export function ModalsProvider({ children = null as any }) {
  const [modals, setModals] = useState<ModalState[]>([]);

  const openModal = useCallback((modalName: CommonModalType, props?: any) => {
    setModals((state) => [
      ...state,
      {
        modalName,
        modalId: ++modalId,
        props,
      },
    ]);
  }, []);

  const closeModal = useCallback((modalId: number, result?: any) => {
    setModals((state) => state.filter((modal) => modal.modalId !== modalId));
    return result;
  }, []);

  const closeTopModal = useCallback(() => {
    setModals((state) => state.slice(0, state.length - 1));
  }, []);

  const preparedModals = useMemo(() => {
    return modals.map((modal) => {
      const ModalComponent = modalsMap.get(modal.modalName);

      if (!ModalComponent) {
        return null;
      }

      return <ModalComponent key={modal.modalId} close={(result?: any) => closeModal(modal.modalId, result)} />;
    });
  }, [modals, closeModal]);

  return (
    <ModalsContext.Provider
      value={{
        openModal,
        closeModal,
        closeTopModal,
      }}
    >
      {children}
      <TransitionGroup>{preparedModals}</TransitionGroup>
    </ModalsContext.Provider>
  );
}

export function useModals() {
  const { openModal, closeModal, closeTopModal } = useContext(ModalsContext);
  return { openModal, closeModal, closeTopModal };
}
