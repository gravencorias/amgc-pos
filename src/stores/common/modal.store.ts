import { create } from "zustand";
import type { IModal } from "../../models/common/modal.model";
import { Modal } from "antd";

type States = {
  modal: IModal;
};

type Actions = {
  showModal: (modal: IModal) => void;
  closeModal: () => void;
};

const initialValues: States = {
  modal: {} as IModal,
};

export const useModalStore = create<States & Actions>()((set) => ({
  ...initialValues,
  showModal: (modal: IModal) =>
    set(() => ({
      modal: {
        ...modal,
        properties: {
          ...modal.properties,
          footer: false,
        },
      },
    })),
  closeModal: () => {
    set(() => ({
      modal: {
        body: undefined,
        properties: {
          open: false,
        },
      },
    }));
    Modal.destroyAll();
  },
}));
