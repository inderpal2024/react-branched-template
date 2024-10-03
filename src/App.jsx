import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function App() {
  const [currentTab, setCurrentTab] = useState('watch');
  const [is24Hour, setIs24Hour] = useState(false);
  const [alarms, setAlarms] = useState([]);
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [splits, setSplits] = useState([]);
  const [alarmForm, setAlarmForm] = useState({ show: false, time: '', period: 'AM' });

  // Clock functionality
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      checkAlarms();
    }, 1000 - new Date().getMilliseconds());

    return () => clearInterval(timer);
  }, []);

  // Stopwatch functionality
  useEffect(() => {
    let interval;
    if (isStopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchTime(prevTime => prevTime + 1000);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStopwatchRunning]);

  const formatTime = (time, is24 = is24Hour) => {
    const date = new Date(time);
    let hours = date.getHours();
    let period = '';
    if (!is24) {
      period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
    }
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}${!is24 ? ' ' + period : ''}`;
  };

  const checkAlarms = () => {
    alarms.forEach(alarm => {
      if (new Date().toLocaleTimeString() === new Date(`1/1/1 ${alarm.time}`).toLocaleTimeString() && alarm.active) {
        // Simple alert for alarm, you might want to enhance this
        alert('Alarm!');
      }
    });
  };

  const addAlarm = () => {
    if (alarmForm.time) {
      const newAlarm = { time: alarmForm.time + (is24Hour ? '' : ' ' + alarmForm.period), active: true };
      setAlarms([...alarms, newAlarm].sort((a, b) => new Date('1/1/1 ' + a.time) - new Date('1/1/1 ' + b.time)));
      setAlarmForm({ show: false, time: '', period: 'AM' });
    }
  };

  const toggleAlarm = (index) => {
    const updatedAlarms = [...alarms];
    updatedAlarms[index].active = !updatedAlarms[index].active;
    setAlarms(updatedAlarms);
  };

  return (
    <div className="bg-green-50 min-h-screen p-4 sm:p-8">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="bg-green-100 p-2 rounded mb-4">
          <TabsTrigger value="watch">Watch</TabsTrigger>
          <TabsTrigger value="stopwatch">Stopwatch</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="watch">
          <WatchView time={currentTime} alarms={alarms} formatTime={formatTime} 
            addAlarm={addAlarm} alarmForm={alarmForm} setAlarmForm={setAlarmForm} is24Hour={is24Hour} />
        </TabsContent>
        <TabsContent value="stopwatch">
          <StopwatchView time={stopwatchTime} isRunning={isStopwatchRunning} 
            onStart={() => setIsStopwatchRunning(true)}
            onStop={() => {setIsStopwatchRunning(false); setStopwatchTime(0); setSplits([]);}}
            onPause={() => setIsStopwatchRunning(false)}
            onResume={() => setIsStopwatchRunning(true)}
            onSplit={() => setSplits([...splits, stopwatchTime])} splits={splits} formatTime={formatTime} />
        </TabsContent>
        <TabsContent value="settings">
          <div className="flex items-center space-x-4">
            <Switch id="hour-format" checked={is24Hour} onCheckedChange={setIs24Hour} />
            <label htmlFor="hour-format">24 Hour Format</label>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WatchView({ time, alarms, formatTime, addAlarm, alarmForm, setAlarmForm, is24Hour }) {
  return (
    <div className="space-y-4">
      <div className="text-4xl text-center font-mono shadow-lg bg-green-200 p-4 rounded">
        {formatTime(time.getTime())}
      </div>
      <Button onClick={() => setAlarmForm({...alarmForm, show: !alarmForm.show})}>
        {alarmForm.show ? "Add" : "Add Alarm"}
      </Button>
      {alarmForm.show && (
        <div className="flex items-center">
          <Input type="time" value={alarmForm.time} onChange={e => setAlarmForm({...alarmForm, time: e.target.value})} />
          {!is24Hour && (
            <select value={alarmForm.period} onChange={e => setAlarmForm({...alarmForm, period: e.target.value})}>
              <option>AM</option>
              <option>PM</option>
            </select>
          )}
          <Button onClick={addAlarm}>Add</Button>
        </div>
      )}
      <div className="overflow-y-auto max-h-60">
        {alarms.map((alarm, index) => (
          <div key={index} className="flex justify-between items-center p-2 border-b">
            <span>{alarm.time}</span>
            <Switch checked={alarm.active} onCheckedChange={() => toggleAlarm(index)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function StopwatchView({ time, isRunning, onStart, onStop, onPause, onResume, onSplit, splits, formatTime }) {
  return (
    <div className="text-center space-y-4">
      <div className="text-4xl font-mono shadow-lg bg-green-200 p-4 rounded">
        {formatTime(time, true)}
      </div>
      <div>
        {!isRunning ? 
          <Button onClick={onStart}>Start</Button> : 
          <>
            <Button onClick={onStop}>Stop</Button>
            <Button onClick={isRunning ? onPause : onResume}>{isRunning ? 'Pause' : 'Resume'}</Button>
            <Button onClick={onSplit}>Split</Button>
          </>
        }
      </div>
      <div className="overflow-y-auto max-h-40">
        {splits.map((split, i) => (
          <div key={i}>{formatTime(split, true)}</div>
        ))}
      </div>
    </div>
  );
}

export default App;