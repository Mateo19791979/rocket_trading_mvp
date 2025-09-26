import React, { useState } from 'react';
import { FolderOpen, FileText, Trash2, Play, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const ContentPanel = ({ books, processingStats, onDeleteBook, onStartProcessing }) => {
  const [selectedBooks, setSelectedBooks] = useState(new Set());

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-400" size={16} />;
      case 'pending':
        return <Clock className="text-yellow-400" size={16} />;
      case 'ingesting': case'extracting':
        return <AlertCircle className="text-blue-400" size={16} />;
      case 'failed':
        return <XCircle className="text-red-400" size={16} />;
      default:
        return <Clock className="text-gray-400" size={16} />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'En attente',
      'ingesting': 'Ingestion',
      'extracting': 'Extraction',
      'completed': 'Terminé',
      'failed': 'Échec'
    };
    return statusMap?.[status] || status;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(1)) + ' ' + sizes?.[i];
  };

  const getBookCategories = () => {
    const categories = {
      'Trading': books?.filter(book => 
        book?.title?.toLowerCase()?.includes('trading') || 
        book?.title?.toLowerCase()?.includes('trade')
      )?.length || 0,
      'Finance': books?.filter(book => 
        book?.title?.toLowerCase()?.includes('finance') || 
        book?.title?.toLowerCase()?.includes('invest')
      )?.length || 0,
      'IA': books?.filter(book => 
        book?.title?.toLowerCase()?.includes('ai') || 
        book?.title?.toLowerCase()?.includes('intelligence') ||
        book?.title?.toLowerCase()?.includes('machine')
      )?.length || 0,
      'Islamique': books?.filter(book => 
        book?.title?.toLowerCase()?.includes('islam') || 
        book?.title?.toLowerCase()?.includes('halal')
      )?.length || 0,
      'Corporate': books?.filter(book => 
        book?.title?.toLowerCase()?.includes('corporate') || 
        book?.title?.toLowerCase()?.includes('business')
      )?.length || 0
    };
    return categories;
  };

  const categories = getBookCategories();
  const totalBooks = processingStats?.totalBooks || 0;

  return (
    <div className="bg-slate-800/30 border border-teal-500/30 rounded-lg backdrop-blur-sm">
      <div className="p-6 border-b border-teal-500/20">
        <h2 className="text-xl font-semibold text-teal-400 flex items-center">
          <FolderOpen className="mr-2" size={24} />
          Contenu
        </h2>
      </div>
      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl font-bold text-white">{totalBooks}</div>
            <div className="text-sm text-slate-300">Livres total</div>
          </div>
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl font-bold text-teal-400">{processingStats?.processedBooks || 0}</div>
            <div className="text-sm text-slate-300">Traités</div>
          </div>
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl font-bold text-orange-400">{processingStats?.pendingBooks || 0}</div>
            <div className="text-sm text-slate-300">En attente</div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Catégories identifiées</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(categories)?.map(([category, count]) => (
              <div key={category} className="flex justify-between items-center p-3 bg-slate-700/20 rounded-lg">
                <span className="text-slate-300">{category}</span>
                <span className="text-teal-400 font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Source Information */}
        <div className="p-4 bg-slate-700/20 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
            <span className="text-white font-medium">Source directe: PDF uploadés par l'utilisateur</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <span className="text-white font-medium">Corpus extensible à 500+ ouvrages</span>
          </div>
        </div>

        {/* Books List */}
        {books?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Livres récents</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {books?.slice(0, 10)?.map((book) => (
                <div key={book?.id} className="flex items-center justify-between p-3 bg-slate-700/20 rounded-lg hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-center space-x-3 flex-1">
                    <FileText className="text-slate-400" size={16} />
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">
                        {book?.title || 'Sans titre'}
                      </div>
                      <div className="text-slate-400 text-xs">
                        {book?.author && `${book?.author} • `}
                        {formatFileSize(book?.file_size)} • {getStatusText(book?.processing_status)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(book?.processing_status)}
                    
                    {book?.processing_status === 'pending' && (
                      <button
                        onClick={() => onStartProcessing?.(book?.id)}
                        className="p-1 text-teal-400 hover:text-teal-300 transition-colors"
                        title="Démarrer le traitement"
                      >
                        <Play size={14} />
                      </button>
                    )}
                    
                    <button
                      onClick={() => onDeleteBook?.(book?.id, book?.file_path)}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {books?.length === 0 && (
          <div className="text-center py-8">
            <FileText className="mx-auto text-slate-500 mb-4" size={48} />
            <p className="text-slate-400">Aucun livre uploadé</p>
            <p className="text-slate-500 text-sm mt-2">Commencez par uploader des PDFs</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentPanel;