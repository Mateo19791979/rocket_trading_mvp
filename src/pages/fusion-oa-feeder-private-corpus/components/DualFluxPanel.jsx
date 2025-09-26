import React from 'react';
import { GitMerge, Database, TrendingUp } from 'lucide-react';

export default function DualFluxPanel({ data }) {
  if (!data) {
    return (
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 rounded-xl p-6 border border-slate-600">
        <div className="flex items-center gap-3 mb-4">
          <GitMerge className="w-6 h-6 text-teal-400" />
          <h2 className="text-xl font-bold text-teal-300">🔀 Double Flux</h2>
        </div>
        <div className="text-gray-400">Chargement des données de flux...</div>
      </div>
    );
  }

  const { flux1, flux2, totalEnrichment } = data;

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 rounded-xl p-6 border border-slate-600">
      <div className="flex items-center gap-3 mb-6">
        <GitMerge className="w-6 h-6 text-teal-400" />
        <h2 className="text-xl font-bold text-teal-300">🔀 Double Flux</h2>
      </div>
      {/* Flux 1: Open-Access Feeder */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
          <h3 className="font-semibold text-orange-300">Flux 1 : Open-Access Feeder</h3>
        </div>
        <div className="ml-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-300">• Articles, preprints, OA books</span>
            <span className="text-orange-300 font-medium">{flux1?.total || 0} docs</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-orange-200 font-medium">{flux1?.articles || 0}</div>
              <div className="text-gray-400">Articles</div>
            </div>
            <div className="text-center">
              <div className="text-orange-200 font-medium">{flux1?.preprints || 0}</div>
              <div className="text-gray-400">Preprints</div>
            </div>
            <div className="text-center">
              <div className="text-orange-200 font-medium">{flux1?.oa_books || 0}</div>
              <div className="text-gray-400">OA Books</div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-600">
            <span className="text-gray-400 text-xs">En traitement:</span>
            <span className="text-yellow-300 text-xs">{flux1?.processing || 0}</span>
          </div>
        </div>
      </div>
      {/* Flux 2: Private Corpus */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
          <h3 className="font-semibold text-blue-300">Flux 2 : Private Corpus</h3>
        </div>
        <div className="ml-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-300">• Livres PDF fournis</span>
            <span className="text-blue-300 font-medium">{flux2?.total || 0} livres</span>
          </div>
          <div className="text-xs space-y-1">
            {flux2?.categories && Object.entries(flux2?.categories)?.map(([category, count]) => (
              <div key={category} className="flex justify-between">
                <span className="text-gray-400 capitalize">{category}:</span>
                <span className="text-blue-200">{count}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-600">
            <span className="text-gray-400 text-xs">En traitement:</span>
            <span className="text-yellow-300 text-xs">{flux2?.processing || 0}</span>
          </div>
        </div>
      </div>
      {/* Enrichissement combiné */}
      <div className="bg-gradient-to-r from-teal-900/30 to-orange-900/30 rounded-lg p-4 border border-teal-500/30">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-5 h-5 text-teal-400" />
          <span className="text-teal-300 font-medium">→ Enrichissement Base Vectorielle & Registry</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm">Documents traités:</span>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-300 font-bold text-lg">{totalEnrichment}</span>
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Flux 1: {flux1?.enriching_vectordb || 0} + Flux 2: {flux2?.enriching_vectordb || 0}
        </div>
      </div>
    </div>
  );
}