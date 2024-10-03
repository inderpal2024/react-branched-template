import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { format, set, differenceInSeconds, addSeconds } from 'date-fns';

function App() {
  const [tab, setTab] = useState('watch');
  const [is24Hour, setIs24Hour] = useState(false);
  const [time, setTime] = useState(new Date());
  const [alarms, setAlarms] = useState([]);
  const [newAlarm, setNewAlarm] = useState({ time: '', isPM: false });
  const [stopwatch, setStopwatch] = useState({ running: false, startTime: null, currentTime: 0, splits: [] });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      if (stopwatch.running) {
        setStopwatch(prev => ({ ...prev, currentTime: Date.now() - prev.startTime }));
      }
      checkAlarms();
    }, 1000);

    return () => clearInterval(timer);
  }, [stopwatch.running]);

  const checkAlarms = () => {
    const now = new Date();
    alarms.forEach(alarm => {
      const alarmTime = set(new Date(), { hours: alarm.hour, minutes: alarm.minute, seconds: 0 });
      if (differenceInSeconds(now, alarmTime) === 0 && alarm.active) {
        // Trigger alarm logic here (simplified for this example)
        console.log('Alarm ringing for', alarmTime);
      }
    });
  };

  const addAlarm = () => {
    if (newAlarm.time) {
      const [hour, minute] = newAlarm.time.split(':').map(Number);
      const alarm = { 
        hour: is24Hour ? hour : (hour % 12) + (newAlarm.isPM ? 12 : 0), 
        minute, 
        active: true 
      };
      setAlarms(prev => [...prev, alarm].sort((a, b) => a.hour - b.hour || a.minute - b.minute));
      setNewAlarm({ time: '', isPM: false });
    }
  };

  const toggleAlarm = (index) => {
    setAlarms(prev => prev.map((alarm, i) => i === index ? { ...alarm, active: !alarm.active } : alarm));
  };

  const handleStopwatch = (action) => {
    switch(action) {
      case 'start':
        setStopwatch({ running: true, startTime: Date.now(), currentTime: 0, splits: [] });
        break;
      case 'stop':
        setStopwatch({ running: false, startTime: null, currentTime: 0, splits: [] });
        break;
      case 'pause':
        setStopwatch(prev => ({ ...prev, running: false }));
        break;
      case 'resume':
        setStopwatch(prev => ({ ...prev, running: true, startTime: Date.now() - prev.currentTime }));
        break;
      case 'split':
        setStopwatch(prev => ({ ...prev, splits: [...prev.splits, prev.currentTime] }));
        break;
    }
  };

  return (
    <div className="bg-blue-50 min-h-screen flex flex-col items-center p-4 sm:p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-mono text-shadow-md">
            {tab === 'watch' ? format(time, is24Hour ? 'HH:mm:ss' : 'hh:mm:ss a') : 
             tab === 'stopwatch' ? format(new Date(stopwatch.currentTime), 'HH:mm:ss') : 'Settings'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tab === 'watch' && (
            <>
              <Button onClick={() => setNewAlarm({...newAlarm, time: ''})} className="mb-2">
                {newAlarm.time === '' ? "Add Alarm" : "Add"}
              </Button>
              {newAlarm.time !== '' && (
                <div className="flex items-center space-x-2">
                  <Input 
                    type="time" 
                    value={newAlarm.time} 
                    onChange={(e) => setNewAlarm({...newAlarm, time: e.target.value})} 
                  />
                  {!is24Hour && (
                    <select onChange={(e) => setNewAlarm({...newAlarm, isPM: e.target.value === 'PM'})}>
                      <option>AM</option>
                      <option>PM</option>
                    </select>
                  )}
                  <Button onClick={addAlarm}>Add</Button>
                </div>
              )}
              <div className="mt-4 max-h-40 overflow-y-auto">
                {alarms.map((alarm, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <span>{format(set(new Date(), { hours: alarm.hour, minutes: alarm.minute }), is24Hour ? 'HH:mm' : 'hh:mm a')}</span>
                    <Switch checked={alarm.active} onCheckedChange={() => toggleAlarm(index)} />
                  </div>
                ))}
              </div>
            </>
          )}
          {tab === 'stopwatch' && (
            <>
              <div className="flex justify-center space-x-2 mb-4">
                {!stopwatch.running && <Button onClick={() => handleStopwatch('start')}>Start</Button>}
                {stopwatch.running ? (
                  <>
                    <Button onClick={() => handleStopwatch('pause')}>Pause</Button>
                    <Button onClick={() => handleStopwatch('split')}>Split</Button>
                  </>
                ) : (
                  <Button onClick={() => handleStopwatch('resume')}>Resume</Button>
                )}
                <Button onClick={() => handleStopwatch('stop')}>Stop</Button>
              </div>
              <ol className="list-decimal pl-5">
                {stopwatch.splits.map((split, idx) => (
                  <li key={idx}>{format(new Date(split), 'HH:mm:ss')}</li>
                ))}
              </ol>
            </>
          )}
          {tab === 'settings' && (
            <Switch 
              checked={is24Hour} 
              onCheckedChange={setIs24Hour} 
              className="mt-4"
            >
              24 Hour Format
            </Switch>
          )}
        </CardContent>
        <Tabs defaultValue="watch" className="w-full">
          <TabsList className="bg-blue-100">
            <TabsTrigger value="watch">Watch</TabsTrigger>
            <TabsTrigger value="stopwatch">Stopwatch</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="watch" />
          <TabsContent value="stopwatch" />
          <TabsContent value="settings" />
        </Tabs>
      </Card>
    </div>
  );
}

export default App;