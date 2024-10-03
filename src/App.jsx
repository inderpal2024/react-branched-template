import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";

function App() {
  const [timeFormat24, setTimeFormat24] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alarms, setAlarms] = useState([]);
  const [alarmInput, setAlarmInput] = useState({ time: '', period: 'AM' });
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [paused, setPaused] = useState(true);
  const [laps, setLaps] = useState([]);
  const [splitTime, setSplitTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (isRunning) {
        setStopwatchTime(Date.now() - splitTime);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, splitTime]);

  useEffect(() => {
    const checkAlarms = () => {
      const now = currentTime.toLocaleTimeString('en-US', { hour12: !timeFormat24 });
      alarms.forEach(alarm => {
        if (alarm.time === now && alarm.active) {
          // Here you would implement the alarm visual feedback
          console.log('Alarm ringing for:', alarm.time);
        }
      });
    };
    checkAlarms();
  }, [currentTime, alarms, timeFormat24]);

  const addAlarm = () => {
    if (alarmInput.time) {
      const [hours, minutes, seconds] = alarmInput.time.split(':').map(Number);
      let time = new Date();
      time.setHours(timeFormat24 ? hours : (hours % 12) + (alarmInput.period === 'PM' ? 12 : 0));
      time.setMinutes(minutes);
      time.setSeconds(seconds);
      setAlarms([...alarms, { time: time.toLocaleTimeString('en-US', { hour12: !timeFormat24 }), active: true }].sort((a, b) => new Date('1970/01/01 ' + a.time) - new Date('1970/01/01 ' + b.time)));
      setAlarmInput({ time: '', period: 'AM' });
    }
  };

  const formatTime = (date) => date.toLocaleTimeString('en-US', { hour12: !timeFormat24, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const startStopwatch = () => {
    setIsRunning(true);
    setPaused(false);
    setSplitTime(Date.now() - stopwatchTime);
  };

  const stopStopwatch = () => {
    setIsRunning(false);
    setPaused(true);
    setStopwatchTime(0);
    setLaps([]);
  };

  const pauseResumeStopwatch = () => {
    setPaused(!paused);
    if (!paused) {
      setSplitTime(Date.now() - stopwatchTime);
    } else {
      setStopwatchTime(Date.now() - splitTime);
    }
  };

  const split = () => {
    if (isRunning && !paused) {
      setLaps([...laps, stopwatchTime]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-green-50">
      <Tabs defaultValue="watch" className="flex-grow">
        <TabsList className="bg-green-100">
          <TabsTrigger value="watch">Watch</TabsTrigger>
          <TabsTrigger value="stopwatch">Stopwatch</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="watch">
          <div className="flex flex-col items-center justify-center flex-grow">
            <div className="text-4xl font-mono mb-4 shadow-lg">{formatTime(currentTime)}</div>
            <Button onClick={() => setAlarmInput({ ...alarmInput, time: '' })}>
              {alarmInput.time ? "Add" : "Add Alarm"}
            </Button>
            {alarmInput.time === '' && (
              <div className="mt-2 space-x-2">
                <Input 
                  type="time" 
                  value={alarmInput.time} 
                  onChange={(e) => setAlarmInput({ ...alarmInput, time: e.target.value })} 
                  className="w-32"
                />
                {!timeFormat24 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">{alarmInput.period}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setAlarmInput({ ...alarmInput, period: 'AM' })}>AM</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setAlarmInput({ ...alarmInput, period: 'PM' })}>PM</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}
            <div className="mt-4 overflow-y-auto">
              {alarms.map((alarm, index) => (
                <div key={index} className="flex justify-between w-full p-2 bg-green-200 mb-2 last:mb-0">
                  <span>{alarm.time}</span>
                  <Switch checked={alarm.active} onCheckedChange={(checked) => {
                    const newAlarms = [...alarms];
                    newAlarms[index].active = checked;
                    setAlarms(newAlarms);
                  }} />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="stopwatch">
          <div className="flex flex-col items-center justify-center flex-grow">
            <div className="text-4xl font-mono mb-4 shadow-lg">
              {new Date(stopwatchTime).toISOString().substr(11, 8)}
            </div>
            <div>
              {!isRunning ? (
                <Button onClick={startStopwatch}>Start</Button>
              ) : (
                <>
                  <Button onClick={paused ? pauseResumeStopwatch : stopStopwatch}>
                    {paused ? 'Resume' : 'Stop'}
                  </Button>
                  <Button onClick={paused ? startStopwatch : pauseResumeStopwatch}>
                    {paused ? 'Start' : 'Pause'}
                  </Button>
                  <Button onClick={split}>Split</Button>
                </>
              )}
            </div>
            <div className="mt-4">
              {laps.map((lap, idx) => (
                <div key={idx}>{new Date(lap).toISOString().substr(11, 8)}</div>
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="settings">
          <div className="p-4">
            <Switch checked={timeFormat24} onCheckedChange={setTimeFormat24}>
              24 Hour Format
            </Switch>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default App;