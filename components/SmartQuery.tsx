import React, { useState } from 'react';
import { Search, Sparkles, Filter, AlertCircle, ArrowRight } from 'lucide-react';
import { interpretQuery, QueryInterpretation } from '../services/geminiService';
import { EchoVerseData } from '../types';
import DataView from './DataView';

interface SmartQueryProps {
  data: EchoVerseData;
}

const SmartQuery: React.FC<SmartQueryProps> = ({ data }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ items: any[], interpretation: QueryInterpretation } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const interpretation = await interpretQuery(query);

      if (!interpretation) {
        setError("AI could not understand the query. Please try being more specific.");
        setLoading(false);
        return;
      }

      // Apply Filters locally
      const collection = data[interpretation.targetEntity];
      
      const filteredItems = collection.filter((item: any) => {
        return interpretation.conditions.every((cond) => {
          const itemValue = item[cond.field];
          
          switch (cond.operator) {
            case 'equals': return itemValue == cond.value;
            case 'contains': return String(itemValue).toLowerCase().includes(String(cond.value).toLowerCase());
            case 'gt': return itemValue > cond.value;
            case 'gte': return itemValue >= cond.value;
            case 'lt': return itemValue < cond.value;
            case 'lte': return itemValue <= cond.value;
            default: return true;
          }
        });
      });

      setResult({
        items: filteredItems,
        interpretation
      });

    } catch (err) {
      setError("An error occurred while processing your request.");
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Column Generation based on Entity Type
  const getColumns = (entityType: string) => {
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
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-2">
         <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Sparkles className="text-indigo-400" />
            Smart Query
         </h2>
         <p className="text-slate-400">Ask questions in plain language to filter your database.</p>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Show me albums released after 2018"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-12 pr-4 py-4 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-transparent placeholder-slate-600 transition-all"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || !query.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? 'Analyzing...' : 'Search'}
          </button>
        </form>

        {/* Suggested Queries */}
        <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider pt-1.5 mr-2">Try:</span>
            {['Albums after 2020', 'Tracks with more than 1,000,000 plays', 'Artists containing "Blue"', 'Songs shorter than 200 seconds'].map(s => (
                <button key={s} onClick={() => setQuery(s)} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full transition-colors">
                    {s}
                </button>
            ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Results Area */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-lg flex items-start gap-4">
            <Filter className="text-indigo-400 mt-1" size={20} />
            <div>
                <h4 className="text-indigo-300 font-semibold text-sm uppercase tracking-wide mb-1">Active Filter Logic</h4>
                <p className="text-slate-300 text-sm">
                    {result.interpretation.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                    {result.interpretation.conditions.map((c, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-indigo-500/20 text-indigo-300 text-xs px-2 py-1 rounded border border-indigo-500/30 font-mono">
                            {c.field} <ArrowRight size={10} /> {c.operator} <ArrowRight size={10} /> {String(c.value)}
                        </span>
                    ))}
                </div>
            </div>
          </div>

          <DataView 
            title={`Search Results: ${result.interpretation.targetEntity.charAt(0).toUpperCase() + result.interpretation.targetEntity.slice(1)}`}
            data={result.items}
            columns={getColumns(result.interpretation.targetEntity)}
          />
        </div>
      )}
    </div>
  );
};

export default SmartQuery;