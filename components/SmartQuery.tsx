import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ArrowRight, ListFilter, XCircle } from 'lucide-react';
import { EchoVerseData } from '../types';
import DataView from './DataView';

interface SmartQueryProps {
  data: EchoVerseData;
}

type EntityType = 'artists' | 'albums' | 'tracks';
type OperatorType = 'contains' | 'equals' | 'gt' | 'lt' | 'gte' | 'lte';

interface FieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'number';
}

const FIELD_CONFIG: Record<EntityType, FieldDefinition[]> = {
  artists: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'bio', label: 'Biography', type: 'text' },
    { key: 'artist_id', label: 'Artist ID', type: 'text' },
  ],
  albums: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'release_year', label: 'Release Year', type: 'number' },
    { key: 'album_id', label: 'Album ID', type: 'text' },
  ],
  tracks: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'play_count', label: 'Play Count', type: 'number' },
    { key: 'duration_seconds', label: 'Duration (Seconds)', type: 'number' },
    { key: 'track_id', label: 'Track ID', type: 'text' },
  ]
};

const SmartQuery: React.FC<SmartQueryProps> = ({ data }) => {
  // State for manual filters
  const [selectedEntity, setSelectedEntity] = useState<EntityType>('albums');
  const [selectedField, setSelectedField] = useState<string>('release_year');
  const [operator, setOperator] = useState<OperatorType>('gt');
  const [searchValue, setSearchValue] = useState<string>('2010');
  
  const [results, setResults] = useState<any[]>([]);

  // Update field selection when entity changes to avoid mismatch
  useEffect(() => {
    setSelectedField(FIELD_CONFIG[selectedEntity][0].key);
  }, [selectedEntity]);

  // Execute Filter Logic
  useEffect(() => {
    if (searchValue === '') {
      setResults(data[selectedEntity]);
      return;
    }

    const collection = data[selectedEntity];
    const fieldDef = FIELD_CONFIG[selectedEntity].find(f => f.key === selectedField);
    const isNumberField = fieldDef?.type === 'number';

    const filtered = collection.filter((item: any) => {
      let itemValue = item[selectedField];
      let queryValue: any = searchValue;

      if (isNumberField) {
        itemValue = Number(itemValue);
        queryValue = Number(searchValue);
        if (isNaN(queryValue)) return false; // Don't filter if input is invalid number
      } else {
        itemValue = String(itemValue).toLowerCase();
        queryValue = String(searchValue).toLowerCase();
      }

      switch (operator) {
        case 'contains': return String(itemValue).includes(String(queryValue));
        case 'equals': return itemValue == queryValue;
        case 'gt': return itemValue > queryValue;
        case 'gte': return itemValue >= queryValue;
        case 'lt': return itemValue < queryValue;
        case 'lte': return itemValue <= queryValue;
        default: return true;
      }
    });

    setResults(filtered);
  }, [data, selectedEntity, selectedField, operator, searchValue]);

  // Dynamic Column Generation
  const getColumns = (entityType: EntityType) => {
    switch (entityType) {
      case 'artists':
        return [
          { header: 'ID', accessor: (a: any) => <span className="text-slate-500 text-xs">{a.artist_id}</span> },
          { header: 'Name', accessor: (a: any) => <span className="font-medium text-white">{a.name}</span> },
          { header: 'Bio', accessor: (a: any) => <span className="text-slate-400 truncate max-w-xs">{a.bio}</span> },
        ];
      case 'albums':
        return [
          { header: 'Title', accessor: (a: any) => <span className="font-medium text-white">{a.title}</span> },
          { header: 'Year', accessor: (a: any) => <span className="text-indigo-400 font-bold">{a.release_year}</span> },
          { header: 'Artist', accessor: (a: any) => data.artists.find(art => art.artist_id === a.artist_id)?.name || 'Unknown' },
        ];
      case 'tracks':
        return [
          { header: 'Title', accessor: (t: any) => <span className="font-medium text-white">{t.title}</span> },
          { header: 'Duration', accessor: (t: any) => `${Math.floor(t.duration_seconds / 60)}:${(t.duration_seconds % 60).toString().padStart(2, '0')}` },
          { header: 'Plays', accessor: (t: any) => <span className="text-green-400 font-mono">{t.play_count.toLocaleString()}</span> },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-2">
         <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <ListFilter className="text-indigo-400" />
            Advanced Search
         </h2>
         <p className="text-slate-400">Filter your database using specific criteria manually.</p>
      </div>

      {/* Filter Controls */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          
          {/* 1. Entity Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Table</label>
            <div className="relative">
              <select 
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value as EntityType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
              >
                <option value="albums">Albums</option>
                <option value="artists">Artists</option>
                <option value="tracks">Tracks</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
            </div>
          </div>

          {/* 2. Field Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Field</label>
            <div className="relative">
              <select 
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
              >
                {FIELD_CONFIG[selectedEntity].map(field => (
                  <option key={field.key} value={field.key}>{field.label}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
            </div>
          </div>

          {/* 3. Operator Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Operator</label>
            <div className="relative">
              <select 
                value={operator}
                onChange={(e) => setOperator(e.target.value as OperatorType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer font-mono text-sm"
              >
                <option value="contains">Contains (Abc)</option>
                <option value="equals">Equals (=)</option>
                <option value="gt">Greater Than (&gt;)</option>
                <option value="lt">Less Than (&lt;)</option>
                <option value="gte">Greater/Equal (&ge;)</option>
                <option value="lte">Less/Equal (&le;)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
            </div>
          </div>

          {/* 4. Value Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Value</label>
            <div className="relative">
              <input 
                type="text" 
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Enter value..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
               {searchValue && (
                <button 
                  onClick={() => setSearchValue('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
                >
                  <XCircle size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Suggestions / Filter Summary */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4">
           <div className="flex items-center gap-2 text-sm text-slate-400">
              <Filter size={16} className="text-indigo-400" />
              <span>Current Logic:</span>
              <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 font-mono">
                 {selectedField}
              </span>
              <span className="text-slate-600 font-bold">{operator}</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
                 "{searchValue}"
              </span>
           </div>
           <div className="text-sm text-slate-500">
             Found <span className="text-white font-bold">{results.length}</span> matches
           </div>
        </div>
      </div>

      {/* Results Area */}
      <div className="animate-in fade-in slide-in-from-bottom-4">
        <DataView 
          title={`${selectedEntity.charAt(0).toUpperCase() + selectedEntity.slice(1)} Results`}
          data={results}
          columns={getColumns(selectedEntity)}
        />
      </div>
    </div>
  );
};

export default SmartQuery;