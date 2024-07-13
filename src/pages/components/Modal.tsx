import { Modal } from 'antd';

const MyModal = ({
  title,
  modalVisible,
  hideModal,
  modalContent,
  footer,
  modalWidth,
}: {
  title: string;
  modalVisible: boolean;
  hideModal: () => void;
  modalContent: any;
  footer: any;
  modalWidth: number;
}) => {
  return (
    <Modal
      title={title}
      open={modalVisible}
      onCancel={hideModal}
      footer={footer}
      width={modalWidth}
    >
      {modalContent}
    </Modal>
  );
};

export default MyModal;
