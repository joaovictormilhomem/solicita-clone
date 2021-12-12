import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { startFirebase } from './services/firebase'
import { ToastContainer, toast } from 'react-toastify';

import Login from './pages/Login/Login';
import Requests from './pages/Requests/Requests';
import SelectPlace from './pages/SelectPlace/SelectPlace';
import ResetPassword from './pages/ResetPassword/ResetPassword';

import Header from './components/Header/Header';
import Loading from './components/Loading/Loading';

import useNavigatorOnLine from './hooks/useNavigatorOnline'

import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const appVersion = 'Versão ALPHA 0.3';

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [placeOp, setPlaceOp] = useState(null);
  const isOnline = useNavigatorOnLine();
  const toastId = useRef(null);

  const notifyConnectionLost  = () => toastId.current = toast.error("Sem conexão", { autoClose: false });
  const notifyConnectionRestored = () => toast.update(toastId.current, { render: "Conexão restaurada", type: toast.TYPE.SUCCESS, autoClose: 3000 });

  function checkPlaceOp() {
    const storagePlaceOp = localStorage.getItem('PLACE_OP');
    if (storagePlaceOp)
      setPlaceOp(storagePlaceOp);
    else
      setPlaceOp(false);
  }

  useEffect(() => {
    isOnline ? notifyConnectionRestored() : notifyConnectionLost();
  }, [isOnline]);

  useEffect(() => {
    checkPlaceOp();
    let unsubscribeOnAuthStateChanged = () => { };
    if (placeOp) {
      unsubscribeOnAuthStateChanged = startFirebase(placeOp, setCurrentUser);
    }

    return (() => {
      unsubscribeOnAuthStateChanged();
    })
  }, [placeOp]);

  useEffect(() => {
    currentUser !== null &&
      setLoading(false);
  }, [currentUser])

  return (
    <div className='main-wrapper'>
      <ToastContainer
        position='bottom-right'
        newestOnTop={false}
        closeOnClick={false}
        closeButton={false}
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        theme= 'dark'
      />
      {loading && <Loading className='loading-screen' />}
      <Router>
        <Header version={appVersion} setLoading={setLoading} setPlaceOp={setPlaceOp} setCurrentUser={setCurrentUser} placeOp={placeOp} currentUser={currentUser}></Header>
        <Switch>
          <Route exact path='/'>
            {placeOp ?
              (currentUser ?
                <Redirect to="/requests" /> :
                <Redirect to="/login" />) :
              <SelectPlace setPlaceOp={setPlaceOp} setLoading={setLoading} />}
          </Route>

          <Route exact path='/login'>
            {placeOp ?
              (currentUser ?
                <Redirect to="/requests" /> :
                <Login setCurrentUser={setCurrentUser} currentUser={currentUser} setLoading={setLoading} />) :
              <Redirect to="/" />}
          </Route>

          <Route path='/login/reset'>
            {placeOp ?
              (currentUser ?
                <Redirect to="/requests" /> :
                <ResetPassword setLoading={setLoading} />) :
              <Redirect to="/" />}
          </Route>

          <Route path='/requests'>
            {placeOp ?
              (currentUser ?
                <Requests placeOp={placeOp} currentUser={currentUser} setLoading={setLoading} /> :
                <Redirect to="/login" />) :
              <Redirect to="/" />}
          </Route>

          <Route path='*'>
            <h1>Essa página não existe</h1>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;