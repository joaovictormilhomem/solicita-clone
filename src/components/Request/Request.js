import { useState } from 'react';
import { finishRequest, startRequest, denyRequest } from '../../services/firebase';
import Timer from '../Timer/Timer'
import DenyRequestModal from '../DenyRequestModal/DenyRequestModal';
import './Request.css'

function Request({ request, setLoading, currentUser, validating }) {
  const [showRequestFooter, setShowRequestFooter] = useState(false);
  const [denyModalIsOpen, setDenyModalIsOpen] = useState(false);

  async function handleDenyRequest(request, reason) {
    setLoading(true);
    await denyRequest(request, reason);
    setLoading(false);
  }

  function handleDenyRequestClick() {
    if (request.validator === currentUser.email)
      setDenyModalIsOpen(true)
  }

  async function handleChangeRequestStatusClick(request) {
    if (request.status === 0 || request.validator === currentUser.email)
      if (window.confirm('Tem certeza que você deseja mudar o status dessa solicitação?')) {

        if (request.status === 0)
          await startRequest(request.id, request.techNumber);

        else
          if (request.status === 1)
            await finishRequest(request);
      }
  }

  const handleMouseOverStatus = () => {
    setShowRequestFooter(!showRequestFooter);
  }

  function copyToClipboard(status, e) {
    //if (status !== 0) {
      const text = e.target.innerHTML;
      if (text) {
        const finalText = text.trim();
        navigator.clipboard.writeText(finalText);
      }
    //}
  }

  return (<div className={validating ? 'request-started' : 'request'}>
    <DenyRequestModal request={request} handleDenyRequest={handleDenyRequest} denyModalIsOpen={denyModalIsOpen} setDenyModalIsOpen={setDenyModalIsOpen} />

    <div onClick={() => { handleChangeRequestStatusClick(request) }}
      onMouseOverCapture={handleMouseOverStatus}
      onMouseOutCapture={handleMouseOverStatus}
      className={`status ${request.status === 0 ? 'waiting' : 'started'}`}
    />

    {/* {request.validator === currentUser.email ?
      <div>
        <p className='type text-base'>{request.type}: </p>
        <p className='pon text-base' onClick={(e) => { copyToClipboard(request.status, e) }} title='Clique para copiar'>
          {request.pon}
        </p>

      </div>
      : <p className='pon text-base'>Solicitação</p>} */}

    <div>
      <p className='type text-base'>{request.type}: </p>
      <p className='pon text-base' onClick={(e) => { copyToClipboard(request.status, e) }} title='Clique para copiar'>
        {request.pon}
      </p>
    </div>

    <p className='deny-request text-base'
      onClick={handleDenyRequestClick}>
      Negativa
    </p>

    {validating && <div className='notes' title='Notas do técnico'>
      <p><span>{`${request.techNumber}: `}</span> {request.notes ? request.notes : 'O técnico não inseriu observações'}</p>
    </div>}

    {(showRequestFooter || validating) && <div className='request-footer'>
      <p className='validator text-base'>
        {request.status === 1 ?
          request.validator :
          ''}
      </p>

      <div className='timers'>
        {request.status === 1 ?
          <div className='timer timer-start'>{<Timer time={request.startTime} />}</div> : <></>}
        <div className='timer'><Timer time={request.createTime} /></div>
      </div>
    </div>}

  </div>);
}

export default Request;