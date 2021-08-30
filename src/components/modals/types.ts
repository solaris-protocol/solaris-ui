export type ModalType = 'stake' | null;
export type SideModalType = 'wallet' | 'settings' | 'network' | null;
export type CommonModalType = ModalType | SideModalType;

export type CommonModalPropsType = {
  close: () => void;
};
