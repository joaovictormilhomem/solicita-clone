import { useHistory, useLocation } from 'react-router';
import { logout } from '../../services/firebase';
import './Header.css';

function Header({version, setLoading, setPlaceOp, setCurrentUser, placeOp, currentUser }) {
  const location = useLocation();
  const history = useHistory();

  async function handleBackClick(){
    if(location.pathname === '/login/reset')
      history.push('/login')
    else{
      const logged = currentUser && true;
      const located = placeOp && true;
      if (logged){
        setLoading(true);
        await logout(setCurrentUser);
        setLoading(false);
      }
      else if(located) {
        setPlaceOp(null);
        localStorage.removeItem('PLACE_OP');
      }
    }
  };
  
  return (
    <header>
      {location.pathname !== '/' ? <button id="back-btn" className="header-btn" onClick={handleBackClick}></button> : <div></div>}
      <div id="version" className="text-base">{version}</div>
    </header>
  );
}

export default Header;