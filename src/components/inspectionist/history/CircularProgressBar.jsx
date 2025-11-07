import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useEffect, useState } from 'react';

const CircularProgressBar = ({ percentage }) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedValue(percentage);
    }, 200); // delay for visual effect

    return () => clearTimeout(timeout);
  }, [percentage]);

  return (
    <div className="h-12 w-12">
      {' '}
      {/* Slightly larger for better visibility */}
      <CircularProgressbar
        value={animatedValue}
        text={`${animatedValue}%`}
        styles={buildStyles({
          pathTransition: 'stroke-dashoffset 1s ease-in-out',
          pathColor: '#4CAF50',
          textColor: '#000',
          trailColor: '#eee',
          textSize: '28px',
        })}
      />
    </div>
  );
};

export default CircularProgressBar;
