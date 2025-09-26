import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import { newsService } from '../../services/newsService';

const NewsPanel = ({ symbols = [], maxItems = 5, className = '' }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadNews = async () => {
    try {
      setLoading(true);
      
      let newsData;
      if (selectedCategory === 'all') {
        newsData = symbols?.length > 0 
          ? await newsService?.getNewsForSymbols(symbols)
          : await newsService?.getMarketNews();
      } else {
        newsData = await newsService?.getNewsByCategory(selectedCategory);
      }
      
      setNews(newsData?.news?.slice(0, maxItems) || []);
    } catch (error) {
      console.error('Failed to load news:', error?.message);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
    const interval = setInterval(loadNews, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [symbols, selectedCategory]);

  const handleSearch = async () => {
    if (!searchQuery?.trim()) {
      loadNews();
      return;
    }
    
    try {
      setLoading(true);
      const searchResults = await newsService?.searchNews(searchQuery, symbols);
      setNews(searchResults?.news?.slice(0, maxItems) || []);
    } catch (error) {
      console.error('Search failed:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'text-success';
      case 'negative':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'TrendingUp';
      case 'negative':
        return 'TrendingDown';
      default:
        return 'Minus';
    }
  };

  const getImpactBadge = (impact) => {
    const styles = {
      high: 'bg-error/20 text-error border-error/30',
      medium: 'bg-warning/20 text-warning border-warning/30',
      low: 'bg-muted/20 text-muted-foreground border-border'
    };
    
    return styles?.[impact] || styles?.low;
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMinutes = Math.floor((now - time) / 60000);
    
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
    return `${Math.floor(diffMinutes / 1440)}d`;
  };

  return (
    <div className={`bg-card border border-border rounded-2xl p-6 shadow-trading ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground font-heading">
          Actualités Financières
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            iconName="RefreshCw"
            onClick={loadNews}
            disabled={loading}
          />
          <Button
            variant="ghost"
            size="sm"
            iconName="Settings"
          />
        </div>
      </div>
      {/* Search and Filters */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Icon 
              name="Search" 
              size={16} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
            <input
              type="text"
              placeholder="Rechercher des actualités..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              onKeyPress={(e) => e?.key === 'Enter' && handleSearch()}
              className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            iconName="Search"
            onClick={handleSearch}
            disabled={loading}
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground font-body">Catégorie:</span>
          <div className="flex space-x-1">
            {['all', 'technology', 'finance', 'healthcare']?.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                {category === 'all' ? 'Toutes' : category?.charAt(0)?.toUpperCase() + category?.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* News List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-sm text-muted-foreground">Chargement des actualités...</span>
          </div>
        ) : news?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Newspaper" size={48} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Aucune actualité disponible</p>
          </div>
        ) : (
          news?.map((article) => (
            <div
              key={article?.id}
              className="p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => window.open(article?.url, '_blank')}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm font-heading line-clamp-2">
                    {article?.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 font-body">
                    {article?.summary}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-3">
                  <Icon
                    name={getSentimentIcon(article?.sentiment)}
                    size={16}
                    className={getSentimentColor(article?.sentiment)}
                  />
                  {article?.impact && (
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getImpactBadge(article?.impact)}`}>
                      {article?.impact?.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-muted-foreground font-data">
                    {article?.source}
                  </span>
                  <span className="text-xs text-muted-foreground font-data">
                    {formatTimeAgo(article?.publishedAt)}
                  </span>
                </div>
                
                {article?.symbols?.length > 0 && (
                  <div className="flex items-center space-x-1">
                    {article?.symbols?.slice(0, 3)?.map(symbol => (
                      <span
                        key={symbol}
                        className="px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded border border-primary/30"
                      >
                        {symbol}
                      </span>
                    ))}
                    {article?.symbols?.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{article?.symbols?.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {article?.tags?.length > 0 && (
                <div className="flex items-center space-x-1 mt-2">
                  {article?.tags?.slice(0, 4)?.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      {/* Show More Button */}
      {!loading && news?.length > 0 && (
        <div className="text-center mt-4">
          <Button
            variant="ghost"
            size="sm"
            iconName="ExternalLink"
            iconPosition="right"
            onClick={() => window.open('/news', '_blank')}
          >
            Voir toutes les actualités
          </Button>
        </div>
      )}
    </div>
  );
};

export default NewsPanel;