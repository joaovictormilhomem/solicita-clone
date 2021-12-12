import { useEffect, useState } from 'react';
import Request from '../../components/Request/Request'
import { onChangeRequests } from '../../services/firebase'
import { spawnNotification } from '../../services/notification/notification';
import './Requests.css';

function Requests({ placeOp, currentUser, setLoading }) {

  const [requests, setRequests] = useState();
  const [requestsNumber, setRequestsNumber] = useState(0);

  useEffect(() => {
    if (currentUser !== null && placeOp !== null) {
      onChangeRequests(setRequests);
    }
  }, [currentUser, placeOp]);

  useEffect(() => {
    if (requests) {
      let requestsWaiting = requests.filter(request => request.status === 0);
      if (requestsWaiting.length > requestsNumber) {
        spawnNotification('Tem solicitação aguardando atendimento!', 'Alerta!');
      }
      setRequestsNumber(requestsWaiting.length);
    }
  }, [requests, requestsNumber]);

  return (<div id='requests-screen' className='screen requests-screen'>
    <h1 className='text-base'>{`Solicitações ${placeOp}`}</h1>
    <div id='requests' className='requests'>
      {requests ? requests.map((request) => {
        return (
          <Request
            key={request.id}
            request={request}
            setLoading={setLoading}
            currentUser={currentUser}
            validating={request.validator === currentUser.email ? true : false}
          />
        )
      }) : <></>}
    </div>
  </div>
  );
}

export default Requests;