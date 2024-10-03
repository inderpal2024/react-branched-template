// App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const formatTime = (date, is24HourFormat) => {
  let hours = date.getHours();
  let period = '';
  if (!is24HourFormat) {
    period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
  }
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}${is24HourFormat ? '' : ` ${period}`}`;
};

export default function App() {
  const [currentTab, setCurrentTab] = useState('watch');
  const [is24Hour, setIs24Hour] = useState(false);
  const [time, setTime] = useState(new Date());
  const [alarms, setAlarms] = useState([]);
  const [alarmForm, setAlarmForm] = useState({ show: false, time: '', period: 'AM' });
  const [stopwatch, setStopwatch] = useState({ running: false, time: 0, laps: [] });

  // Clock update logic
  useEffect(() => {
    const timerID = setInterval(() => {
      setTime(new Date());
    }, 1000 - new Date().getMilliseconds());
    return () => clearInterval(timerID);
  }, []);

  // Stopwatch logic
  useEffect(() => {
    let interval;
    if (stopwatch.running) {
      interval = setInterval(() => {
        setStopwatch(prev => ({...prev, time: Date.now() - stopwatch.startTime + prev.time}));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stopwatch.running]);

  const addAlarm = () => {
    if (alarmForm.time) {
      const [hours, minutes, seconds] = alarmForm.time.split(':').map(Number);
      let date = new Date();
      date.setHours(is24Hour ? hours : (hours % 12) + (alarmForm.period === 'PM' ? 12 : 0));
      date.setMinutes(minutes);
      date.setSeconds(seconds);
      setAlarms([...alarms, { time: date, active: true }].sort((a, b) => a.time - b.time));
      setAlarmForm({ show: false, time: '', period: 'AM' });
    }
  };

  const toggleAlarm = (index) => {
    const newAlarms = [...alarms];
    newAlarms[index].active = !newAlarms[index].active;
    setAlarms(newAlarms);
  };

  const handleStartStopwatch = () => {
    setStopwatch({ 
      running: true, 
      time: stopwatch.time, 
      laps: [], 
      startTime: Date.now() - stopwatch.time 
    });
  };

  const handleStop = () => {
    setStopwatch({ running: false, time: 0, laps: [] });
  };

  return (
    <div className="min-h-screen bg-blue-100 p-4">
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="bg-blue-200 p-2 rounded-lg">
          <TabsTrigger value="watch">Watch</TabsTrigger>
          <TabsTrigger value="stopwatch">Stopwatch</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="watch">
          <ClockDisplay time={time} is24Hour={is24Hour} />
          <div className="mt-4">
            <Button onClick={() => setAlarmForm({...alarmForm, show: !alarmForm.show})}>
              {alarmForm.show ? "Add" : "Add Alarm"}
            </Button>
            {alarmForm.show && (
              <div className="flex items-center mt-2">
                <Input 
                  type="time" 
                  value={alarmForm.time} 
                  onChange={(e) => setAlarmForm({...alarmForm, time: e.target.value})}
                  className="mr-2"
                />
                {!is24Hour && <select 
                  value={alarmForm.period} 
                  onChange={(e) => setAlarmForm({...alarmForm, period: e.target.value})}
                  className="p-1">
                  <option>AM</option>
                  <option>PM</option>
                </select>}
                <Button onClick={addAlarm}>Add</Button>
              </div>
            )}
            <div className="mt-4 max-h-60 overflow-y-auto">
              {alarms.map((alarm, idx) => (
                <div key={idx} className="flex justify-between items-center mb-2 p-2 bg-white rounded">
                  <span>{formatTime(alarm.time, is24Hour)}</span>
                  <Switch checked={alarm.active} onCheckedChange={() => toggleAlarm(idx)} />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stopwatch">
          <StopwatchDisplay time={stopwatch.time} />
          <div className="flex space-x-2 mt-4">
            {!stopwatch.running ? 
              <Button onClick={handleStartStopwatch}>Start</Button> :
              <>
                <Button onClick={handleStop}>Stop</Button>
                <Button onClick={() => setStopwatch({...stopwatch, running: false})}>Pause</Button>
                <Button onClick={() => setStopwatch(prev => ({...prev, laps: [...prev.laps, prev.time]}))}>Split</Button>
              </>
            }
          </div>
          <ul className="mt-4 space-y-2">
            {stopwatch.laps.map((lap, idx) => (
              <li key={idx}>{formatTime(new Date(lap), true)}</li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="settings">
          <Switch checked={is24Hour} onCheckedChange={setIs24Hour}>24 Hour Format</Switch>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ClockDisplay({ time, is24Hour }) {
  return <div className="text-4xl font-mono text-center bg-blue-300 p-4 rounded-lg shadow-lg">{formatTime(time, is24Hour)}</div>;
}

function StopwatchDisplay({ time }) {
  const formattedTime = formatTime(new Date(time), true);
  return <div className="text-4xl font-mono text-center bg-blue-300 p-4 rounded-lg shadow-lg">{formattedTime}</div>;
}