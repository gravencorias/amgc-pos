import { Modal as AntModal } from "antd";
import { useModalStore } from "../../../stores/common/modal.store";

const Modal = () => {
  const { closeModal, modal } = useModalStore();
  const { properties, body } = modal;

  return (
    <AntModal forceRender={true} onCancel={closeModal} {...properties}>
      {body}
    </AntModal>
  );
};

export default Modal;
