

export const newsService = {
  // Get latest financial news for specific symbols
  async getNewsForSymbols(symbols = []) {
    try {
      // Mock news data - in production, this would integrate with RSS feeds
      const mockNews = this.generateMockNews(symbols);
      
      // In future, integrate with actual news APIs and store in database
      return {
        news: mockNews,
        total: mockNews?.length,
        lastUpdate: new Date()?.toISOString(),
        sources: ['Reuters', 'Bloomberg', 'MarketWatch', 'Yahoo Finance']
      };
    } catch (error) {
      throw error;
    }
  },

  // Get general market news
  async getMarketNews() {
    try {
      const generalNews = [
        {
          id: '1',
          title: 'Federal Reserve Maintains Interest Rates Amid Market Uncertainty',
          summary: 'The Federal Reserve decided to keep interest rates steady as market volatility continues...',
          content: 'In a widely anticipated move, the Federal Reserve announced today...',
          source: 'Reuters',
          author: 'Financial Desk',
          publishedAt: new Date(Date.now() - 1800000)?.toISOString(), // 30 minutes ago
          tags: ['fed', 'interest-rates', 'monetary-policy'],
          sentiment: 'neutral',
          impact: 'high',
          symbols: ['SPY', 'QQQ', 'IWM'],
          url: 'https://example.com/news/fed-rates'
        },
        {
          id: '2',
          title: 'Tech Stocks Rally on Strong Q3 Earnings Reports',
          summary: 'Major technology companies report better-than-expected quarterly results...',
          content: 'Technology stocks surged in after-hours trading following...',
          source: 'MarketWatch',
          author: 'Tech Reporter',
          publishedAt: new Date(Date.now() - 3600000)?.toISOString(), // 1 hour ago
          tags: ['earnings', 'technology', 'rally'],
          sentiment: 'positive',
          impact: 'medium',
          symbols: ['AAPL', 'GOOGL', 'MSFT', 'AMZN'],
          url: 'https://example.com/news/tech-rally'
        },
        {
          id: '3',
          title: 'Oil Prices Drop as Supply Concerns Ease',
          summary: 'Crude oil futures decline following reports of increased production...',
          content: 'Oil prices fell sharply today as markets digested news of...',
          source: 'Bloomberg',
          author: 'Energy Desk',
          publishedAt: new Date(Date.now() - 7200000)?.toISOString(), // 2 hours ago
          tags: ['oil', 'commodities', 'supply'],
          sentiment: 'negative',
          impact: 'medium',
          symbols: ['USO', 'XOM', 'CVX'],
          url: 'https://example.com/news/oil-drop'
        }
      ];

      return {
        news: generalNews,
        total: generalNews?.length,
        lastUpdate: new Date()?.toISOString(),
        sources: ['Reuters', 'Bloomberg', 'MarketWatch']
      };
    } catch (error) {
      throw error;
    }
  },

  // Get news sentiment analysis
  async getNewsSentiment(symbol) {
    try {
      // Mock sentiment data
      const sentiment = {
        symbol,
        overall: Math.random() > 0.5 ? 'positive' : 'negative',
        score: (Math.random() - 0.5) * 2, // -1 to 1
        confidence: Math.random() * 0.5 + 0.5, // 0.5 to 1
        articleCount: Math.floor(Math.random() * 20) + 5,
        sources: ['Reuters', 'Bloomberg', 'MarketWatch', 'Yahoo Finance'],
        breakdown: {
          positive: Math.floor(Math.random() * 10) + 5,
          neutral: Math.floor(Math.random() * 8) + 3,
          negative: Math.floor(Math.random() * 7) + 2
        },
        lastUpdate: new Date()?.toISOString()
      };

      return sentiment;
    } catch (error) {
      throw error;
    }
  },

  // Search news by keywords
  async searchNews(query, symbols = []) {
    try {
      if (!query || query?.length < 2) return { news: [], total: 0 };

      // Mock search results
      const searchResults = this.generateMockNews(symbols)?.filter(article =>
        article?.title?.toLowerCase()?.includes(query?.toLowerCase()) ||
        article?.summary?.toLowerCase()?.includes(query?.toLowerCase()) ||
        article?.tags?.some(tag => tag?.toLowerCase()?.includes(query?.toLowerCase()))
      );

      return {
        news: searchResults,
        total: searchResults?.length,
        query,
        lastUpdate: new Date()?.toISOString()
      };
    } catch (error) {
      throw error;
    }
  },

  // Get news by category
  async getNewsByCategory(category) {
    try {
      const categoryNews = this.generateMockNewsByCategory(category);
      
      return {
        news: categoryNews,
        category,
        total: categoryNews?.length,
        lastUpdate: new Date()?.toISOString()
      };
    } catch (error) {
      throw error;
    }
  },

  // Helper methods for mock data generation
  generateMockNews(symbols = []) {
    const baseNews = [
      {
        title: 'Market Volatility Expected to Continue',
        summary: 'Analysts predict continued market uncertainty as economic indicators show mixed signals...',
        tags: ['market', 'volatility', 'analysis'],
        sentiment: 'neutral',
        impact: 'medium'
      },
      {
        title: 'Strong Corporate Earnings Drive Market Optimism',
        summary: 'Better-than-expected quarterly results boost investor confidence...',
        tags: ['earnings', 'corporate', 'optimism'],
        sentiment: 'positive',
        impact: 'high'
      },
      {
        title: 'Regulatory Changes Impact Financial Sector',
        summary: 'New regulations announced for financial institutions...',
        tags: ['regulation', 'financial', 'policy'],
        sentiment: 'neutral',
        impact: 'medium'
      }
    ];

    return symbols?.length > 0 
      ? this.generateSymbolSpecificNews(symbols)
      : baseNews?.map((article, index) => ({
          id: String(index + 1),
          ...article,
          source: ['Reuters', 'Bloomberg', 'MarketWatch']?.[index % 3],
          author: 'Financial Desk',
          publishedAt: new Date(Date.now() - (index + 1) * 1800000)?.toISOString(),
          symbols: symbols?.slice(0, 3),
          url: `https://example.com/news/${index + 1}`
        }));
  },

  generateSymbolSpecificNews(symbols) {
    return symbols?.slice(0, 5)?.map((symbol, index) => ({
      id: `${symbol}-${index}`,
      title: `${symbol} Reports Strong Performance in Latest Quarter`,
      summary: `${symbol} exceeded analyst expectations with robust financial results...`,
      content: `Company ${symbol} announced today that its quarterly performance...`,
      source: ['Reuters', 'Bloomberg', 'MarketWatch', 'Yahoo Finance']?.[index % 4],
      author: `${symbol} Analyst`,
      publishedAt: new Date(Date.now() - (index + 1) * 3600000)?.toISOString(),
      tags: [symbol?.toLowerCase(), 'earnings', 'performance'],
      sentiment: Math.random() > 0.3 ? 'positive' : 'neutral',
      impact: ['high', 'medium', 'low']?.[index % 3],
      symbols: [symbol],
      url: `https://example.com/news/${symbol?.toLowerCase()}`
    }));
  },

  generateMockNewsByCategory(category) {
    const categoryMap = {
      'technology': [
        { title: 'AI Revolution Transforms Tech Industry', sentiment: 'positive' },
        { title: 'Cybersecurity Concerns Rise Among Tech Giants', sentiment: 'negative' }
      ],
      'finance': [
        { title: 'Banks Report Strong Q3 Results', sentiment: 'positive' },
        { title: 'Credit Default Rates Show Concerning Trend', sentiment: 'negative' }
      ],
      'healthcare': [
        { title: 'Breakthrough Drug Approval Boosts Biotech Sector', sentiment: 'positive' },
        { title: 'Healthcare Costs Continue to Rise', sentiment: 'negative' }
      ]
    };

    const templates = categoryMap?.[category] || [];
    
    return templates?.map((template, index) => ({
      id: `${category}-${index}`,
      title: template?.title,
      summary: `${template?.title?.slice(0, 50)}...`,
      source: ['Reuters', 'Bloomberg']?.[index % 2],
      author: `${category} Desk`,
      publishedAt: new Date(Date.now() - (index + 1) * 3600000)?.toISOString(),
      tags: [category, 'industry'],
      sentiment: template?.sentiment,
      impact: 'medium',
      symbols: [],
      url: `https://example.com/news/${category}-${index}`
    }));
  }
};