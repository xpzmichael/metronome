import React, { useState, useEffect, useRef } from 'react';
import oneAudio from '../assets/1.mp3';
import twoAudio from '../assets/2.mp3';
import threeAudio from '../assets/3.mp3';
import fourAudio from '../assets/4.mp3';

function Metronome() {
  const [bpm, setBpm] = useState(120); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState('tick'); 
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4); 
  const [audioLoaded, setAudioLoaded] = useState(false);

  const intervalRef = useRef(null);
  const audioCtxRef = useRef(null);
  const currentBeatRef = useRef(0);
  const vocalAudioRefs = useRef([]);

  useEffect(() => {
    // Initialize AudioContext once
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Preload audio files
    const audioFiles = [oneAudio, twoAudio, threeAudio, fourAudio];
    let loadedCount = 0;

    vocalAudioRefs.current = audioFiles.map((src) => {
      const audio = new Audio(src);
      audio.preload = "auto";
      audio.muted = true;  // Trick the browser into treating it as an interactive element
      audio.play().catch(() => {});  // Prevent errors if autoplay is blocked
      
      audio.oncanplaythrough = () => {
        loadedCount++;
        if (loadedCount === audioFiles.length) {
          setAudioLoaded(true); // Mark audio as loaded when all are ready
        }
      };
      return audio;
    });
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      vocalAudioRefs.current.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      currentBeatRef.current = 0;
      const intervalTime = 60000 / bpm;

      intervalRef.current = setInterval(() => {
        if (mode === 'tick') {
          playTick();
        } else {
          playVocal(currentBeatRef.current);
        }
        currentBeatRef.current = (currentBeatRef.current + 1) % beatsPerMeasure;
      }, intervalTime);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, bpm, mode, beatsPerMeasure]);

  const playTick = () => {
    const oscillator = audioCtxRef.current.createOscillator();
    const gainNode = audioCtxRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtxRef.current.destination);
    
    oscillator.frequency.value = 1000; 
    gainNode.gain.value = 1;
    
    oscillator.start();
    oscillator.stop(audioCtxRef.current.currentTime + 0.1);
  };

  const playVocal = (beatIndex) => {
    if (!audioLoaded) return; // Prevent playing if audio isn't loaded
    const audio = vocalAudioRefs.current[beatIndex];
    audio.pause();
    audio.currentTime = 0;
    audio.play();
  };

  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-6">节拍器</h1>
      <div className="mb-4">
        <label htmlFor="bpmInput" className="mr-2 font-medium">BPM:</label>
        <input
          id="bpmInput"
          type="number"
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-20 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="modeSelect" className="mr-2 font-medium">Mode:</label>
        <select
          id="modeSelect"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="tick">Tick</option>
          <option value="vocal">Vocal</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="timeSigSelect" className="mr-2 font-medium">Time Signature:</label>
        <select
          id="timeSigSelect"
          value={beatsPerMeasure}
          onChange={(e) => setBeatsPerMeasure(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="2">2/4</option>
          <option value="3">3/4</option>
          <option value="4">4/4</option>
        </select>
      </div>
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        disabled={!audioLoaded} // Prevent starting if audio isn't loaded
        className={`mt-4 px-6 py-2 rounded-lg text-white font-semibold ${
          isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {audioLoaded ? (isPlaying ? "Stop" : "Start") : "Loading..."}
      </button>
    </div>
  );
}

export default Metronome;
