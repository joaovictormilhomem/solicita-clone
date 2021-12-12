import { useState } from 'react';
import Modal from 'react-modal';

import './DenyRequestModal.css'

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)'
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    border: 'none'
  }
};

Modal.setAppElement('#root');

function DenyRequestModal({ request, handleDenyRequest, denyModalIsOpen, setDenyModalIsOpen }) {
  const [value, setValue] = useState('');
  const [disabledButton, setDisabledButton] = useState(true);

  function closeModal() {
    setDenyModalIsOpen(false);
    setValue('');
    setDisabledButton(true)
  }

  function handleValueChange(event) {
    const inputElement = event.target;
    const newValue = inputElement.value;
    setValue(newValue);
    newValue.length > 3 ? setDisabledButton(false):setDisabledButton(true);
  }

  function handleConfirmClick(event) {
    event.preventDefault();
    handleDenyRequest(request, value);
    closeModal();
  }

  return (
    <Modal
      isOpen={denyModalIsOpen}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Example Modal"
    >
      <button className='modal-close-button' onClick={closeModal}>X</button>
      <h2 className='modal-title'>Por qual motivo deseja negar essa solicitação?</h2>
      <form className='modal-form'>
        <textarea placeholder='Insira o motivo aqui' autoComplete="on" onChange={handleValueChange} type='text' value={value} maxLength='140'/>
        <div>
          <button disabled={disabledButton} onClick={handleConfirmClick}>NEGAR</button>
        </div>
      </form>
    </Modal>
  );
}

export default DenyRequestModal;