import { useEffect } from 'react';
import places from '../../services/places';
import './SelectPlace.css';

function SelectPlace({setPlaceOp, setLoading}) {

  useEffect(() => {
    setLoading(false);
  });

  function handlePlaceClick(click) {
    const element = click.target;
    const place = element.getAttribute('data-place');
    localStorage.setItem('PLACE_OP', place);
    setPlaceOp(place);
  }

  return (
    <div id='select-place-screen' className='screen slide-in'>
      <h1 className='text-base'>Selecione o seu local</h1>

      {places.map((place, index) => { return(
        <div key={index} onClick={handlePlaceClick} className='location-option' id={'place-op-'+place.initials} data-place={place.initials}>
        <p className='place-name'>{place.name}</p>
      </div>
      )})}
    </div>
  );
}

export default SelectPlace;