import React, { useState, useEffect } from 'react';
import { BookOpen, Upload, Trash2, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import ragKnowledgeBaseService from '../../../services/ragKnowledgeBaseService';

export default function BookLibraryPanel({ onStatsUpdate }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const booksData = await ragKnowledgeBaseService?.getBooks();
      setBooks(booksData || []);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleDeleteBook = async (bookId) => {
    if (!confirm('Are you sure you want to delete this book and all its chunks?')) {
      return;
    }

    try {
      await ragKnowledgeBaseService?.deleteBook(bookId);
      await loadBooks();
      onStatsUpdate?.();
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const handleViewDetails = async (book) => {
    try {
      const chunks = await ragKnowledgeBaseService?.getBookChunks(book?.id);
      setSelectedBook({ ...book, chunks });
      setShowDetails(true);
    } catch (error) {
      console.error('Error loading book details:', error);
    }
  };

  const getStatusIcon = (book) => {
    // Mock status based on presence of chunks
    if (book?.chunks && book?.chunks > 0) {
      return <CheckCircle className="h-4 w-4 text-green-400" />;
    } else if (book?.created_at && new Date(book.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      return <Clock className="h-4 w-4 text-yellow-400" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-red-400" />;
    }
  };

  const getProgressPercentage = (book) => {
    // Mock progress based on chunks
    if (book?.chunks && book?.chunks > 0) {
      return 100;
    } else if (book?.created_at && new Date(book.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      return Math.floor(Math.random() * 80) + 20;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3]?.map((i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold">Book Library Management</h3>
          </div>
          <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            <Upload className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          {books?.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No books uploaded yet</p>
              <p className="text-sm">Upload your first technical book to get started</p>
            </div>
          ) : (
            books?.map((book) => {
              const progress = getProgressPercentage(book);
              
              return (
                <div key={book?.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-white truncate">{book?.title}</h4>
                      <p className="text-sm text-gray-400">by {book?.author || 'Unknown Author'}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-gray-500">{book?.year || 'Unknown Year'}</span>
                        {book?.tags && book?.tags?.length > 0 && (
                          <div className="flex space-x-1">
                            {book?.tags?.slice(0, 2)?.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-600 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                            {book?.tags?.length > 2 && (
                              <span className="text-xs text-gray-400">+{book?.tags?.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(book)}
                      <div className="relative">
                        <button 
                          onClick={() => handleViewDetails(book)}
                          className="p-1 hover:bg-gray-600 rounded"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                      <button 
                        onClick={() => handleDeleteBook(book?.id)}
                        className="p-1 hover:bg-gray-600 rounded text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Processing Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Chunks: {book?.chunks || 0}</span>
                    <span>Added: {new Date(book.created_at)?.toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      {/* Book Details Modal */}
      {showDetails && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{selectedBook?.title}</h3>
              <button 
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-400">Author: {selectedBook?.author}</p>
                <p className="text-gray-400">Year: {selectedBook?.year}</p>
                <p className="text-gray-400">SHA256: {selectedBook?.sha256?.substring(0, 16)}...</p>
              </div>
              
              {selectedBook?.tags && selectedBook?.tags?.length > 0 && (
                <div>
                  <p className="text-gray-400 mb-2">Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedBook?.tags?.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-600 text-sm rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedBook?.chunks && selectedBook?.chunks?.length > 0 && (
                <div>
                  <p className="text-gray-400 mb-2">Content Chunks ({selectedBook?.chunks?.length}):</p>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {selectedBook?.chunks?.slice(0, 5)?.map((chunk, index) => (
                      <div key={chunk?.id} className="bg-gray-700 p-3 rounded text-sm">
                        <p className="text-gray-300">{chunk?.content?.substring(0, 200)}...</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Chunk {chunk?.chunk_no} • {chunk?.tokens} tokens
                        </p>
                      </div>
                    ))}
                    {selectedBook?.chunks?.length > 5 && (
                      <p className="text-gray-400 text-sm">
                        ...and {selectedBook?.chunks?.length - 5} more chunks
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}