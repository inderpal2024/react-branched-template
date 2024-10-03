import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, CardContent, Switch } from "@/components/ui";
import { cn } from "@/lib/utils";

const formatTime = (date, is24HourFormat) => {
  return date.toLocaleTimeString('en-US', {
    hour12: !is24HourFormat,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

function DigitalWatch() {
  const [currentTab, setCurrentTab] = useState('watch');
  const [is24Hour, setIs24Hour] = useState(false);
  const [time, setTime] = useState(new Date());
  const [alarms, setAlarms] = useState([]);
  const [alarmTime, setAlarmTime] = useState('');
  const [amPm, setAmPm] = useState('AM');

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addAlarm = () => {
    if (!alarmTime) return;
    const [hours, minutes, seconds] = alarmTime.split(':').map(Number);
    const alarmDate = new Date();
    alarmDate.setHours(is24Hour ? hours : hours % 12 + (amPm === 'PM' ? 12 : 0));
    alarmDate.setMinutes(minutes);
    alarmDate.setSeconds(seconds);
    setAlarms(prev => [...prev, { time: alarmDate, active: true }].sort((a, b) => a.time - b.time));
    setAlarmTime('');
  };

  const toggleAlarm = (index) => {
    const newAlarms = [...alarms];
    newAlarms[index].active = !newAlarms[index].active;
    setAlarms(newAlarms);
  };

  return (
    <Card className="bg-green-50 h-full sm:h-auto">
      <CardContent className="p-4 flex flex-col h-full">
        <div className="text-4xl font-mono mb-4 text-center shadow-lg">
          {formatTime(time, is24Hour)}
        </div>
        <div className="flex-grow overflow-y-auto">
          {currentTab === 'watch' && (
            <>
              <Button onClick={() => setAlarmTime('')}>Add Alarm</Button>
              {alarmTime !== '' && (
                <div className="mt-2 flex">
                  <input 
                    type="time" 
                    value={alarmTime} 
                    onChange={(e) => setAlarmTime(e.target.value)} 
                    className="mr-2"
                  />
                  {!is24Hour && (
                    <select value={amPm} onChange={(e) => setAmPm(e.target.value)}>
                      <option>AM</option>
                      <option>PM</option>
                    </select>
                  )}
                  <Button onClick={addAlarm}>Add</Button>
                </div>
              )}
              {alarms.map((alarm, index) => (
                <div key={index} className="flex justify-between items-center mt-2">
                  <span>{formatTime(alarm.time, is24Hour)}</span>
                  <Switch 
                    checked={alarm.active} 
                    onCheckedChange={() => toggleAlarm(index)} 
                    className={cn("shadow-lg", alarm.active ? "shadow-green-500" : "shadow-gray-500")}
                  />
                </div>
              ))}
            </>
          )}
        </div>
        <div className="mt-4 flex justify-around">
          {['watch', 'stopwatch', 'settings'].map(tab => (
            <Button 
              key={tab} 
              variant={currentTab === tab ? 'default' : 'outline'} 
              onClick={() => setCurrentTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function App() {
  return (
    <div className="flex justify-center items-center h-screen bg-green-100">
      <DigitalWatch />
    </div>
  );
}
