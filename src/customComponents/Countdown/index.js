import React, { useEffect, useState } from "react";
import moment from "moment";

const Countdown = ({ timeTillDate, timeFormat }) => {
  const [countdown, setCountdown] = useState({
    days: undefined,
    hours: undefined,
    minutes: undefined,
    seconds: undefined,
  });

  // const [isDisable, setIsDisable] = useState(true)

  // useEffect(()=>{
  //   if()

  // },[hours, minutes,seconds])

  useEffect(() => {
    const interval = setInterval(() => {
      const then = moment(timeTillDate, timeFormat);
      const now = moment();
      const duration = moment.duration(then.diff(now));

      
      const days = Math.floor(duration.asDays());
      const hours = duration.hours().toString().padStart(2, "0");
      const minutes = duration.minutes().toString().padStart(2, "0");
      const seconds = duration.seconds().toString().padStart(2, "0");
    
      
      setCountdown({ days, hours, minutes, seconds });

      if (hours <= "00" && minutes <= "00" && seconds <="00") {
        clearInterval(interval);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [timeTillDate, timeFormat]);

  const { days, hours, minutes, seconds } = countdown;

  return (
    <div className="btc_timer_section_wrapper">
      {hours <= "00" && minutes <= "00" && seconds <="00"  ?  <div id="clockdiv">
        {/* <div>
          <span className="days">0</span>
          <div className="smalltext">Days</div>
        </div> */}
        <div>
          <span className="hours">00</span>
          <div className="smalltext">Hours</div>
        </div>
        <div>
          <span className="minutes">00</span>
          <div className="smalltext">Minutes</div>
        </div>
        <div>
          <span className="seconds">00</span>
          <div className="smalltext">Seconds</div>
        </div>
      </div> :  <div id="clockdiv">
        {/* <div>
          <span className="days">{days}</span>
          <div className="smalltext">Days</div>
        </div> */}
        <div>
          <span className="hours">{hours}</span>
          <div className="smalltext">Hours</div>
        </div>
        <div>
          <span className="minutes">{minutes}</span>
          <div className="smalltext">Minutes</div>
        </div>
        <div>
          <span className="seconds">{seconds}</span>
          <div className="smalltext">Seconds</div>
        </div>
      </div>}
      
    </div>
  );
};

export default Countdown;
