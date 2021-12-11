import { useEffect } from "react";

const Timer = () => {
  useEffect(() => {
    var minutesLabel = document.getElementById("minutes");
    var secondsLabel = document.getElementById("seconds");
    var totalSeconds = 0;
    setInterval(setTime, 1000);

    function setTime() {
      ++totalSeconds;
      secondsLabel.innerHTML = pad(totalSeconds % 60);
      minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
    }

    function pad(val) {
      var valString = val + "";
      if (valString.length < 2) {
        return "0" + valString;
      } else {
        return valString;
      }
    }
  }, []);

  return (
    <div style={{ marginTop: "5px" }}>
      <label id="minutes">00</label>:<label id="seconds">00</label>
    </div>
  );
};

export default Timer;
