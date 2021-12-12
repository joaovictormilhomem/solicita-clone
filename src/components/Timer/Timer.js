import { useEffect, useState } from "react";

function Timer(props) {

  const [timer, setTimer] = useState();

  function zeroFill(n) {
    return ('0' + n).slice(-2);
  }

  useEffect(() => {
    function formatTime(milliseconds) {
      let seconds = milliseconds / 1000;
      let minutes;
      let hours;
  
      if (seconds >= 60) {
        minutes = seconds / 60;
        seconds = seconds % 60;
        if (minutes >= 60) {
          hours = minutes / 60;
          minutes = minutes % 60;
        }
        else
          hours = 0;
      }
      else {
        minutes = 0;
        hours = 0;
      }
  
      return zeroFill(Math.trunc(hours)) + ':' + zeroFill(Math.trunc(minutes)) + ':' + zeroFill(Math.trunc(seconds));
    }

    function updateTimer(startTime) {
      let now = new Date();
      let res = formatTime(now.valueOf() - startTime);
      return res;
    }

    setTimer(updateTimer(props.time))
    let interval = setInterval(() => setTimer(updateTimer(props.time)), 1000);

    return () => clearInterval(interval);
  },[props.time]);

  return (<div>
    {timer}
  </div>);
}

export default Timer;