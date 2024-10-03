import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";

const formatTime = (date, is24Hour = false) => {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  if (is24Hour) return `${hours}:${minutes}:${seconds}`;
  const period = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12}:${minutes}:${seconds} ${period}`;
};

function App() {
  const [currentTab, setCurrentTab] = useState('watch');
  const [is24Hour, setIs24Hour] = useState(false);
  const [time, setTime] = useState(new Date());
  const [alarms, setAlarms] = useState([]);
  const [alarmInput, setAlarmInput] = useState({ time: '', period: 'AM' });
  const [stopwatch, setStopwatch] = useState({ time: 0, running: false, splits: [] });
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      checkAlarms();
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const checkAlarms = () => {
    const now = new Date();
    alarms.forEach((alarm, index) => {
      const alarmTime = new Date(now);
      const [hours, minutes, seconds] = alarm.time.split(':').map(Number);
      alarmTime.setHours(is24Hour ? hours : (hours % 12) + (alarm.period === 'PM' ? 12 : 0), minutes, seconds);
      if (alarm.active && alarmTime - now < 1000 && alarmTime - now > 0) {
        setFlash(index);
        setTimeout(() => setFlash(null), 5000);
      }
    });
  };

  const addAlarm = () => {
    if (alarmInput.time.match(/^\d{2}:\d{2}:\d{2}$/)) {
      setAlarms(prev => [...prev, { ...alarmInput, active: true }].sort((a, b) => {
        const timeA = new Date(`1970-01-01T${a.time}Z`);
        const timeB = new Date(`1970-01-01T${b.time}Z`);
        return timeA - timeB;
      }));
      setAlarmInput({ time: '', period: 'AM' });
    }
  };

  const toggleAlarm = (index) => {
    setAlarms(prev => {
      const newAlarms = [...prev];
      newAlarms[index].active = !newAlarms[index].active;
      return newAlarms;
    });
  };

  const startStopwatch = () => {
    if (!stopwatch.running) {
      setStopwatch(prev => ({ ...prev, running: true, startTime: Date.now() - prev.time }));
    } else {
      setStopwatch(prev => ({ ...prev, running: false, time: Date.now() - prev.startTime }));
    }
  };

  const resetStopwatch = () => {
    setStopwatch({ time: 0, running: false, splits: [] });
  };

  const pauseStopwatch = () => {
    setStopwatch(prev => ({ ...prev, running: false, time: Date.now() - prev.startTime }));
  };

  const splitTime = () => {
    if (stopwatch.running) {
      setStopwatch(prev => ({ ...prev, splits: [...prev.splits, prev.time] }));
    }
  };

  useEffect(() => {
    let interval;
    if (stopwatch.running) {
      interval = setInterval(() => {
        setStopwatch(prev => ({ ...prev, time: Date.now() - prev.startTime }));
      }, 10);
    } else if (!stopwatch.running && stopwatch.time !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [stopwatch.running]);

  return (
    <div className="bg-green-50 min-h-screen flex flex-col items-center p-4 sm:p-8">
      <Tabs defaultValue="watch" className="w-full max-w-lg">
        <TabsList className="bg-green-100 border border-green-200">
          <TabsTrigger value="watch">Watch</TabsTrigger>
          <TabsTrigger value="stopwatch">Stopwatch</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="watch">
          <div className="text-center font-mono text-4xl mb-4 shadow-lg bg-green-200 p-4 rounded-lg">
            <div className={flash !== null ? 'animate-pulse bg-green-400' : ''}>
              {formatTime(time, is24Hour)}
            </div>
          </div>
          <Button onClick={() => setAlarmInput({...alarmInput, time: ''})} className="mb-2">
            {alarmInput.time ? 'Add' : 'Add Alarm'}
          </Button>
          {alarmInput.time === '' ? null : (
            <div className="flex items-center space-x-2">
              <Input 
                value={alarmInput.time} 
                onChange={e => setAlarmInput({...alarmInput, time: e.target.value})}
                placeholder="HH:MM:SS" 
                className="flex-grow"
              />
              {!is24Hour && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">{alarmInput.period}</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setAlarmInput({...alarmInput, period: 'AM'})}>AM</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setAlarmInput({...alarmInput, period: 'PM'})}>PM</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
          <div className="mt-4 overflow-y-auto max-h-60">
            {alarms.map((alarm, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-green-100 mb-2 rounded">
                <span>{alarm.time} {is24Hour ? '' : alarm.period}</span>
                <Switch checked={alarm.active} onCheckedChange={() => toggleAlarm(index)} />
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="stopwatch">
          <div className="text-center font-mono text-4xl mb-4 shadow-lg bg-green-200 p-4 rounded-lg">
            {new Date(stopwatch.time).toISOString().substr(11, 8)}
          </div>
          <div className="flex space-x-2">
            <Button onClick={startStopwatch}>{stopwatch.running ? 'Stop' : 'Start'}</Button>
            {stopwatch.running ? (
              <>
                <Button onClick={pauseStopwatch}>Pause</Button>
                <Button onClick={splitTime}>Split</Button>
              </>
            ) : stopwatch.time > 0 && <Button onClick={resetStopwatch}>Reset</Button>}
          </div>
          <div className="mt-4">
            {stopwatch.splits.map((split, i) => (
              <div key={i} className="p-1">{new Date(split).toISOString().substr(11, 8)}</div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="settings">
          <div className="flex items-center space-x-4">
            <label>24 Hour Format</label>
            <Switch checked={is24Hour} onCheckedChange={setIs24Hour} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default App;