import React, { useState } from 'react';
import { EchoVerseData } from '../types';
import { Plus, User, Disc, Music, CheckCircle, AlertCircle, Save } from 'lucide-react';

interface ManualEntryProps {
  currentData: EchoVerseData;
  onDataAdd: (newData: Partial<EchoVerseData>) => void;
}

type EntryType = 'artist' | 'album' | 'track';

const ManualEntry: React.FC<ManualEntryProps> = ({ currentData, onDataAdd }) => {
  const [activeType, setActiveType] = useState<EntryType>('artist');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form States
  // Artist
  const [artistName, setArtistName] = useState('');
  const [artistBio, setArtistBio] = useState('');

  // Album
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumYear, setAlbumYear] = useState<number>(2024);
  const [albumArtistId, setAlbumArtistId] = useState('');
  const [albumLabelId, setAlbumLabelId] = useState('');

  // Track
  const [trackTitle, setTrackTitle] = useState('');
  const [trackDuration, setTrackDuration] = useState<number>(180);
  const [trackPlayCount, setTrackPlayCount] = useState<number>(0);
  const [trackAlbumId, setTrackAlbumId] = useState('');

  const resetForms = () => {
    setArtistName(''); setArtistBio('');
    setAlbumTitle(''); setAlbumYear(2024); setAlbumArtistId(''); setAlbumLabelId('');
    setTrackTitle(''); setTrackDuration(180); setTrackPlayCount(0); setTrackAlbumId('');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);

    const timestamp = Date.now();

    if (activeType === 'artist') {
      if (!artistName) return;
      const newArtist = {
        artist_id: `art_m_${timestamp}`,
        name: artistName,
        bio: artistBio || 'No biography available.'
      };
      onDataAdd({ artists: [newArtist] });
      setSuccessMsg(`Artist "${artistName}" added successfully.`);
    } 
    
    else if (activeType === 'album') {
      if (!albumTitle || !albumArtistId || !albumLabelId) return;
      const newAlbum = {
        album_id: `alb_m_${timestamp}`,
        title: albumTitle,
        release_year: albumYear,
        artist_id: albumArtistId,
        label_id: albumLabelId
      };
      onDataAdd({ albums: [newAlbum] });
      setSuccessMsg(`Album "${albumTitle}" added successfully.`);
    } 

    else if (activeType === 'track') {
      if (!trackTitle || !trackAlbumId) return;
      const newTrack = {
        track_id: `trk_m_${timestamp}`,
        title: trackTitle,
        duration_seconds: trackDuration,
        album_id: trackAlbumId,
        play_count: trackPlayCount
      };
      onDataAdd({ tracks: [newTrack] });
      setSuccessMsg(`Track "${trackTitle}" added successfully.`);
    }

    resetForms();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
          <Plus className="text-indigo-400" />
          Manual Data Entry
        </h2>
        <p className="text-slate-400">Add new records to the database manually.</p>
      </div>

      {/* Type Selector Tabs */}
      <div className="flex justify-center gap-4">
        {[
          { id: 'artist', label: 'New Artist', icon: User },
          { id: 'album', label: 'New Album', icon: Disc },
          { id: 'track', label: 'New Track', icon: Music },
        ].map((type) => {
          const Icon = type.icon;
          const isActive = activeType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => { setActiveType(type.id as EntryType); setSuccessMsg(null); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {type.label}
            </button>
          );
        })}
      </div>

      {/* Form Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl">
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* --- ARTIST FORM --- */}
          {activeType === 'artist' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-400 uppercase">Artist Name</label>
                  <input 
                    required
                    type="text" 
                    value={artistName}
                    onChange={e => setArtistName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. The Midnight"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-400 uppercase">Biography</label>
                  <textarea 
                    value={artistBio}
                    onChange={e => setArtistBio(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none"
                    placeholder="Artist background and style..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* --- ALBUM FORM --- */}
          {activeType === 'album' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-400 uppercase">Album Title</label>
                  <input 
                    required
                    type="text" 
                    value={albumTitle}
                    onChange={e => setAlbumTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Endless Summer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-400 uppercase">Release Year</label>
                  <input 
                    required
                    type="number" 
                    value={albumYear}
                    onChange={e => setAlbumYear(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-400 uppercase">Artist</label>
                  <select 
                    required
                    value={albumArtistId}
                    onChange={e => setAlbumArtistId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                  >
                    <option value="">Select Artist...</option>
                    {currentData.artists.map(a => (
                      <option key={a.artist_id} value={a.artist_id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-400 uppercase">Label</label>
                  <select 
                    required
                    value={albumLabelId}
                    onChange={e => setAlbumLabelId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                  >
                    <option value="">Select Label...</option>
                    {currentData.labels.map(l => (
                      <option key={l.label_id} value={l.label_id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* --- TRACK FORM --- */}
          {activeType === 'track' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-semibold text-slate-400 uppercase">Track Title</label>
                  <input 
                    required
                    type="text" 
                    value={trackTitle}
                    onChange={e => setTrackTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Sunset Drive"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-400 uppercase">Duration (Seconds)</label>
                  <input 
                    required
                    type="number" 
                    value={trackDuration}
                    onChange={e => setTrackDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-400 uppercase">Initial Plays</label>
                  <input 
                    type="number" 
                    value={trackPlayCount}
                    onChange={e => setTrackPlayCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-semibold text-slate-400 uppercase">Album</label>
                  <select 
                    required
                    value={trackAlbumId}
                    onChange={e => setTrackAlbumId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                  >
                    <option value="">Select Album...</option>
                    {currentData.albums.map(a => (
                      <option key={a.album_id} value={a.album_id}>{a.title} ({a.release_year})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-lg flex items-center gap-3 animate-in fade-in">
              <CheckCircle size={20} />
              {successMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button 
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
            >
              <Save size={18} />
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualEntry;