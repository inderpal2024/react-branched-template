import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addSeconds, isEqual } from 'date-fns';

const App = () => {
  const [timeFormat, setTimeFormat] = useState(false); // false for 12-hour, true for 24-hour
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('watch');
  const [alarms, setAlarms] = useState([]);
  const [alarmInput, setAlarmInput] = useState({ time: '', ampm: 'AM' });
  const [stopwatch, setStopwatch] = useState({ running: false, time: 0, splits: [] });
  const [isAddingAlarm, setIsAddingAlarm] = useState(false);

  // Clock Update Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000 - new Date().getMilliseconds());

    return () => clearInterval(timer);
  }, []);

  // Stopwatch Logic
  useEffect(() => {
    let interval;
    if (stopwatch.running) {
      interval = setInterval(() => {
        setStopwatch(prev => ({ ...prev, time: prev.time + 1000 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stopwatch.running]);

  // Format time based on settings
  const formatTime = (date) => {
    return timeFormat 
      ? format(date, 'HH:mm:ss')
      : format(date, 'hh:mm:ss a');
  };

  // Add Alarm
  const addAlarm = () => {
    let timeParts = alarmInput.time.split(':');
    let date = new Date();
    date.setHours(
      timeFormat ? parseInt(timeParts[0], 10) : 
      (parseInt(timeParts[0], 10) % 12) + (alarmInput.ampm === 'PM' ? 12 : 0)
    );
    date.setMinutes(parseInt(timeParts[1], 10));
    date.setSeconds(parseInt(timeParts[2], 10));
    
    if (!isNaN(date.getTime())) {
      setAlarms([...alarms, { time: date, active: true }].sort((a, b) => a.time - b.time));
      setAlarmInput({ time: '', ampm: 'AM' });
      setIsAddingAlarm(false);
    }
  };

  // Toggle Alarm
  const toggleAlarm = (index) => {
    let newAlarms = [...alarms];
    newAlarms[index].active = !newAlarms[index].active;
    setAlarms(newAlarms);
  };

  // Stopwatch controls
  const startStopwatch = () => setStopwatch({...stopwatch, running: true});
  const stopStopwatch = () => setStopwatch({ running: false, time: 0, splits: [] });
  const pauseResumeStopwatch = () => setStopwatch({...stopwatch, running: !stopwatch.running});
  const splitTime = () => {
    if (stopwatch.running) {
      setStopwatch(prev => ({ ...prev, splits: [...prev.splits, prev.time] }));
    }
  };

  // Check if any alarm should trigger
  useEffect(() => {
    const checkAlarms = () => {
      alarms.forEach(alarm => {
        if (alarm.active && isEqual(alarm.time, currentTime)) {
          // Here you would typically trigger an alarm sound or notification
          console.log('Alarm triggered at', formatTime(alarm.time));
        }
      });
    };
    checkAlarms();
  }, [currentTime, alarms]);

  return (
    <div className="bg-green-50 h-screen flex flex-col items-center p-4 sm:p-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
        <TabsList className="bg-green-100 p-1 rounded-full mb-4">
          <TabsTrigger value="watch">Watch</TabsTrigger>
          <TabsTrigger value="stopwatch">Stopwatch</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="watch">
          <div className="text-4xl font-mono mb-4 text-center shadow-lg bg-white p-4 rounded-lg">
            {formatTime(currentTime)}
          </div>
          <Button onClick={() => setIsAddingAlarm(!isAddingAlarm)}>
            {isAddingAlarm ? "Add" : "Add Alarm"}
          </Button>
          {isAddingAlarm && (
            <div className="mt-2">
              <input 
                type="time" 
                value={alarmInput.time} 
                onChange={(e) => setAlarmInput({...alarmInput, time: e.target.value})} 
                className="mr-2"
              />
              {!timeFormat && (
                <select onChange={(e) => setAlarmInput({...alarmInput, ampm: e.target.value})}>
                  <option>AM</option><option>PM</option>
                </select>
              )}
              <Button onClick={addAlarm}>Add</Button>
            </div>
          )}
          <Card className="mt-4 overflow-y-auto">
            <CardContent>
              {alarms.map((alarm, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span>{formatTime(alarm.time)}</span>
                  <Switch checked={alarm.active} onCheckedChange={() => toggleAlarm(index)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stopwatch">
          <div className="text-4xl font-mono text-center shadow-lg bg-white p-4 rounded-lg">
            {formatTime(new Date(stopwatch.time))}
          </div>
          <div className="mt-4 space-x-2">
            {!stopwatch.running ? 
              <Button onClick={startStopwatch}>Start</Button> :
              <>
                <Button onClick={stopStopwatch}>Stop</Button>
                <Button onClick={pauseResumeStopwatch}>
                  {stopwatch.running ? "Pause" : "Resume"}
                </Button>
                <Button onClick={splitTime}>Split</Button>
              </>
            }
          </div>
          <Card className="mt-4">
            <CardContent>
              {stopwatch.splits.map((time, idx) => (
                <div key={idx}>{formatTime(new Date(time))}</div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Switch checked={timeFormat} onCheckedChange={setTimeFormat}>
            24-Hour Format
          </Switch>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default App;