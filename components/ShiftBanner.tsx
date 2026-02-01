
import React, { useState, useEffect } from 'react';
import { Clock, Info } from 'lucide-react';
import { Engineer } from '../types';

interface ShiftBannerProps {
  engineer: Engineer;
}

const ShiftBanner: React.FC<ShiftBannerProps> = ({ engineer }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = currentTime.getHours();
  const isBusinessHours = hours >= 9 && hours < 20;

  return (
    <div className={`px-8 py-3 flex items-center justify-between text-sm font-medium border-b ${
      isBusinessHours ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-amber-50 border-amber-100 text-amber-700'
    }`}>
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Clock size={16} />
          <span>{currentTime.toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isBusinessHours ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`} />
          <span>{isBusinessHours ? 'Shift Hours (09:00 - 20:00)' : 'Off-Hours - Automatic assignment disabled'}</span>
        </div>
      </div>
      
      {engineer.isOnShift ? (
        <div className="flex items-center space-x-2 text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs">
          <span>Currently Active on Shift</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2 text-red-700 bg-red-100 px-3 py-1 rounded-full text-xs">
          <span>Inactive / On Break</span>
        </div>
      )}
    </div>
  );
};

export default ShiftBanner;
