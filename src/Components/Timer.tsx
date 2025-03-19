import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const Timer = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 23,
    hours: 12,
    minutes: 23,
    seconds: 23
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime.seconds > 0) {
          return { ...prevTime, seconds: prevTime.seconds - 1 };
        } else if (prevTime.minutes > 0) {
          return { ...prevTime, minutes: prevTime.minutes - 1, seconds: 59 };
        } else if (prevTime.hours > 0) {
          return { ...prevTime, hours: prevTime.hours - 1, minutes: 59, seconds: 59 };
        } else if (prevTime.days > 0) {
          return { ...prevTime, days: prevTime.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prevTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-4 justify-center items-center relative z-20">
      <TimeBox value={timeLeft.days} label="Days" />
      <TimeBox value={timeLeft.hours} label="Hours" />
      <TimeBox value={timeLeft.minutes} label="Min" />
      <TimeBox value={timeLeft.seconds} label="Sec" />
    </div>
  );
};

interface TimeBoxProps {
  value: number;
  label: string;
}

const TimeBox = ({ value, label }: TimeBoxProps) => {
  return (
    <div className="flex flex-col items-center drop-shadow-xl mt-20">
      <div className="w-18 h-18 bg-[#0d50e0] rounded-lg flex items-center justify-center 
                    shadow-[0_0_15px_rgba(0,82,255,0.5)] border border-[#0066FF]/30">
        <span className="text-4xl font-bold text-white flex flex-col items-center justify-center">
          {value.toString().padStart(2, '0')}
          <span className="text-sm text-white mt-1 font-light">{label}</span>
        </span>
      </div>
    </div>
  );
};

export default Timer; 