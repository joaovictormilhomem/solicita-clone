import React, { useState } from 'react';
import translateError from '../../services/authErrors';
import { changePassword } from '../../services/firebase';
import './ResetPassword.css';

const initialFormValues = {
  user: '',
  error: undefined,
  confirm: undefined
}

function ResetPassword(props) {

  const [formValues, setFormValues] = useState(initialFormValues);

  function handleFormChangesValues(event) {
    const inputElement = event.target;
    const inputName = inputElement.name;
    const inputValue = inputElement.value;
    setFormValues({ ...formValues, [inputName]: inputValue });
  }

  function handleResetPasswordClick(e) {
    e.preventDefault();
    props.setLoading(true);
    const user = formValues.user;
    changePassword(user)
      .then(() =>{
        setFormValues({...formValues, error: undefined, confirm: true})
        props.setLoading(false);
      })
      .catch((error) => {
        const errorMessage = translateError(error); 
        setFormValues({...formValues, error: errorMessage, confirm: false});
        props.setLoading(false);
      })
  }

  return (
    <div id="login-screen" className="screen slide-in">
      <div className="login-container slide-in">
        <h1>Nova senha</h1>
        <p>Informe o mesmo email que foi cadastrado, para trocar sua senha.</p>
        <form id="login-form" className="form">
          <input
            autoFocus
            autoComplete="email"
            onChange={handleFormChangesValues}
            value={formValues.user}
            type="text"
            className="form-input"
            id="user-input"
            placeholder="Digite aqui o seu email"
            name='user'
          />
          <button
            disabled={formValues.confirm && true}
            type='submit' id="login-btn"
            onClick={handleResetPasswordClick}
            className="form-btn"
          >Enviar
          </button>
          {formValues.error && <span className='error'>{formValues.error}</span>}
          {formValues.confirm && <span className='confirm'>Um email foi enviado.</span>}
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;