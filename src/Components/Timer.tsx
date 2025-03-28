import { useState, useEffect } from 'react';
const END_DATE = new Date('2025-05-01T00:00:00Z');

const calculateTimeLeft = (): TimeLeft => {
  const now = new Date();
  const difference = END_DATE.getTime() - now.getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60)
  };
};

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const Timer = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

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
    <div className="flex gap-2 px-2 w-[100vw] justify-center items-center relative z-20 ">
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
    <div className="flex flex-col items-center ">
      <div className="w-1/4 h-18 bg-[#002dfe] rounded-lg flex items-center justify-center 
                    shadow-[0_0_15px_rgba(0,82,255,0.5)] border border-[#0066FF]/30">
        <span className="text-3xl font-[800] text-white flex flex-col  items-center justify-center">
          {value.toString().padStart(2, '0')}
          <span className="text-[10px] text-white font-light">{label}</span>
        </span>
      </div>
    </div>
  );
};

export default Timer; 