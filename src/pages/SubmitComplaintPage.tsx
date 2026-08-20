import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MapComponent } from '../components/MapComponent';
import {
  FilePlus,
  Sparkles,
  MapPin,
  Camera,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertOctagon,
  Bot,
  Scale,
  Building2,
  Clock,
  Zap
} from 'lucide-react';
import { Complaint } from '../types';

interface SubmitComplaintPageProps {
  onSuccess: (complaint: Complaint) => void;
}

export const SubmitComplaintPage: React.FC<SubmitComplaintPageProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationAddress, setLocationAddress] = useState('Ward 114, 4th Cross, 100ft Road, Indiranagar');
  const [latitude, setLatitude] = useState(12.9716);
  const [longitude, setLongitude] = useState(77.5946);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<number>(0);
  const [error, setError] = useState('');

  const quickTemplates = [
    {
      label: '⚡ Live Sparking High-Voltage Cable (Critical)',
      title: 'Exposed live 440V overhead cable sparking near primary school gate',
      desc: 'During the thunderstorm last night, a high-voltage wire snapped and is hanging at eye level right outside the Saraswati Primary School gate. Children and pedestrians are at immediate life-safety risk. Urgent power cut and replacement needed.',
      location: 'Near Gate 2, Saraswati Primary School, Ward 114',
      lat: 12.9725,
      lng: 77.5985,
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'
    },
    {
      label: '💧 Major Water Main Burst (High)',
      title: 'Pressurized water pipeline ruptured, flooding 200m roadway',
      desc: 'The underground BWSSB supply line burst this morning at 6 AM. Millions of liters of potable water are being wasted and flooding nearby ground-floor residences and disrupting traffic.',
      location: '12th Main Junction, Near Metro Pillar 42',
      lat: 12.9698,
      lng: 77.5912,
      image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80'
    },
    {
      label: '🗑️ Illegal Biomedical & Solid Waste Dump (Medium)',
      title: 'Open garbage dump accumulating for 10 days, severe foul smell',
      desc: 'Municipal garbage collection truck has skipped our sector for nearly two weeks. Stray dogs and rodents are scattering refuse across the footpath, blocking elderly walkers.',
      location: 'Crossroad 7, Sector 3, Residential Area',
      lat: 12.9750,
      lng: 77.6010,
      image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80'
    },
    {
      label: '🕳️ Deep Pothole Crater on Main Bus Route (High)',
      title: 'Dangerous 2-foot pothole causing two-wheeler skidding',
      desc: 'Massive crater formed after recent monsoons right in the middle lane. Three motorcyclists have lost balance in the last 48 hours. Urgent asphalt patching needed before fatal accident occurs.',
      location: 'Bus Stop 14, Ring Road Corridor',
      lat: 12.9735,
      lng: 77.5930,
      image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const applyTemplate = (t: typeof quickTemplates[0]) => {
    setTitle(t.title);
    setDescription(t.desc);
    setLocationAddress(t.location);
    setLatitude(t.lat);
    setLongitude(t.lng);
    setImageUrl(t.image);
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setLocationAddress(`Ward 114 Zone (Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)})`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setError('Please fill in title and detailed description.');
      return;
    }

    setError('');
    setIsProcessing(true);
    setProcessingStage(1);

    const stageTimer1 = setTimeout(() => setProcessingStage(2), 700);
    const stageTimer2 = setTimeout(() => setProcessingStage(3), 1400);

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.id || 'CITIZEN-1'}`
        },
        body: JSON.stringify({
          title,
          description,
          locationAddress,
          latitude,
          longitude,
          imageUrl: imageUrl.trim() || undefined
        })
      });

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setProcessingStage(4);

      const data = await res.json();
      if (res.ok && data.complaint) {
        setTimeout(() => {
          onSuccess(data.complaint);
        }, 600);
      } else {
        throw new Error(data.error || 'Failed to submit grievance');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while filing grievance.');
      setIsProcessing(false);
      setProcessingStage(0);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-[#020617] text-slate-200 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Zero-Friction Citizen Filing
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
          File a Public Grievance
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Civic AI will automatically structure your complaint, evaluate priority, calculate SLA, and assign the best available field officer.
        </p>
      </div>

      {/* Quick Templates Selector (Bento Tile) */}
      <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800 shadow-xl mb-6">
        <div className="flex items-center gap-2 mb-2.5">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400">
            Quick Realistic SIH Demo Scenarios (Click to auto-fill):
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quickTemplates.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyTemplate(item)}
              className="text-left p-3 rounded-xl border border-slate-700/60 hover:border-emerald-500/50 bg-[#1e293b]/60 hover:bg-[#1e293b] text-xs font-medium text-slate-200 transition-all cursor-pointer truncate"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs p-3.5 rounded-xl font-medium mb-6 flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
          {error}
        </div>
      )}

      {/* Form & Map Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-7 space-y-4">
          <form onSubmit={handleSubmit} className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Grievance Title / Problem Summary *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Broken water pipeline leaking near market square"
                className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-medium text-xs focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Natural-Language Description *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe what happened, how long it has persisted, who is affected, and any safety hazards..."
                className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs leading-relaxed focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                Tip: Feel free to use everyday phrasing. Civic AI's Gemini model extracts exact categories and risks automatically.
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Location Address or Landmark *
              </label>
              <input
                type="text"
                required
                value={locationAddress}
                onChange={e => setLocationAddress(e.target.value)}
                placeholder="e.g. Opposite Metro Pillar 128, Indiranagar 100ft Road"
                className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Photo Attachment URL (Optional Evidence)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs font-mono"
              />
            </div>

            {imageUrl && (
              <div className="p-2 bg-[#1e293b]/70 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Photo Preview:</span>
                <img
                  src={imageUrl}
                  alt="Complaint Preview"
                  className="w-full h-32 object-cover rounded-lg border border-slate-700"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-950/50"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              {isProcessing ? 'Processing with Civic AI Intelligence...' : 'Submit Grievance to Civic AI'}
            </button>
          </form>
        </div>

        {/* Right Column: Pin Drop Map & Real-time Pipeline visualizer */}
        <div className="lg:col-span-5 space-y-4">
          {/* Map Selector */}
          <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                <MapPin className="w-4 h-4 text-emerald-400" />
                Select GPS Location (Click on Map)
              </div>
              <span className="text-[10px] font-mono text-slate-400 font-semibold">
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </span>
            </div>
            <MapComponent
              mode="select"
              latitude={latitude}
              longitude={longitude}
              onLocationSelect={handleLocationSelect}
              height="280px"
            />
            <p className="text-[10px] text-slate-500 mt-2 font-mono">
              Click anywhere on the map or drag the pin to pinpoint the exact site.
            </p>
          </div>

          {/* AI Pipeline Architecture Display */}
          {isProcessing && (
            <div className="bg-[#0f172a] text-slate-100 p-5 rounded-2xl border border-slate-700 shadow-xl space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-400 font-mono">
                <Bot className="w-4 h-4 animate-spin text-amber-400" />
                Live Civic AI Pipeline Processing...
              </div>

              <div className="space-y-2 text-xs">
                <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${processingStage >= 1 ? 'bg-slate-800 border-emerald-500/40 text-emerald-400 font-bold' : 'border-slate-800 text-slate-600'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>1. AI Extraction: Parsing entities, safety risk, population</span>
                </div>
                <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${processingStage >= 2 ? 'bg-slate-800 border-emerald-500/40 text-emerald-400 font-bold' : 'border-slate-800 text-slate-600'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>2. Rule Engine: Computing Priority & SLA Timeline</span>
                </div>
                <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${processingStage >= 3 ? 'bg-slate-800 border-emerald-500/40 text-emerald-400 font-bold' : 'border-slate-800 text-slate-600'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>3. Routing: Auto load-balancing field officer assignment</span>
                </div>
                <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${processingStage >= 4 ? 'bg-slate-800 border-emerald-500/40 text-emerald-400 font-bold' : 'border-slate-800 text-slate-600'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>4. Vector Matching: Checking semantic duplicates & past cases</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
