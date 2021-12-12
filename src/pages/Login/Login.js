import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import translateError from '../../services/authErrors';
import { login } from '../../services/firebase';
import './Login.css';

const initialFormValues = {
  user: '',
  password: '',
  error: undefined
}

function Login({setCurrentUser, currentUser, setLoading}) {

  const [formValues, setFormValues] = useState(initialFormValues);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setLoading(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    currentUser !== null &&
      setLoading(false);
  }, [currentUser, setLoading])

  function handleFormChangesValues(event) {
    const inputElement = event.target;
    const inputName = inputElement.name;
    const inputValue = inputElement.value;
    setFormValues({ ...formValues, [inputName]: inputValue });
  }

  async function handleLoginClick(e) {
    e.preventDefault();
    setLoading(true);
    const user = formValues.user;
    const password = formValues.password;
    const loginResponse = await login(user, password, setCurrentUser);
    if (loginResponse) {
        const errorMessage = translateError(loginResponse); 
        setFormValues({...formValues, error: errorMessage});
    }
    setLoading(false);
  }

  return (
    <div id="login-screen" className="screen slide-in">
      <div className="login-container slide-in">
        <h1>Login</h1>
        <form id="login-form" className="form">
          <label htmlFor='user-input'>Email</label>
          <input
            autoFocus
            autoComplete="email"
            onChange={handleFormChangesValues}
            value={formValues.user}
            type="text"
            className="form-input selection-if-bg-white"
            id="user-input"
            placeholder="Digite aqui o seu email"
            name='user'
          />
          <label htmlFor='password-input'>Senha</label>
          <input
            autoComplete="current-password"
            onChange={handleFormChangesValues}
            value={formValues.password}
            type={showPassword ? 'text' : 'password'}
            className="form-input"
            id="password-input"
            placeholder="Digite aqui a sua senha"
            name='password'
          />
          <div className='form-password-actions'>
            <div>
              <input
                onChange={() => { setShowPassword(!showPassword) }}
                type="checkbox"
                className="show-password-check"
                id="show-password"
                name="show-password"
                tabIndex='-1'
              />
              <label htmlFor="show-password" className="mb-0">Exibir senha</label>
            </div>
            <Link
              to='/login/reset'
              title="Para solicitar redefinição de senha, clique aqui."
              id="change-password-btn"
            >Esqueceu sua senha?
            </Link>
          </div>
          <button
            type='submit' id="login-btn"
            onClick={handleLoginClick}
            className="form-btn"
          >Entrar
          </button>
          {formValues.error && <span className='error'>{formValues.error}</span>}
        </form>
      </div>
    </div>
  );
}

export default Login;