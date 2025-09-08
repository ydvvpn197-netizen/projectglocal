// Enhanced News page component for TheGlocal project
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { RealTimeNewsFeed } from '@/components/RealTimeNewsFeed';
import { NewsComments } from '@/components/NewsComments';
import { NewsPreferences } from '@/components/NewsPreferences';
import { NewsProvider } from '@/contexts/NewsContext';
import { useNews } from '@/hooks/useNews';
import { useNewsData, type NewsArticle } from '@/hooks/useNewsData';
import { Button } from '@/components/ui/button';
import { Settings, MessageCircle } from 'lucide-react';

const NewsContent: React.FC = () => {
  const { articleId } = useParams<{ articleId?: string }>();
  const navigate = useNavigate();
  const { getArticleById } = useNewsData();
  const { 
    currentView, 
    currentArticle, 
    showArticle, 
    showFeed, 
    goToNextArticle, 
    goToPreviousArticle, 
    canGoNext, 
    canGoPrevious 
  } = useNews();

  const [showComments, setShowComments] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  // Handle URL-based article loading
  useEffect(() => {
    if (articleId) {
      const article = getArticleById(articleId);
      if (article) {
        showArticle(article);
      } else {
        // Article not found, redirect to news feed
        navigate('/news');
      }
    } else {
      showFeed();
    }
  }, [articleId, showArticle, showFeed, navigate, getArticleById]);

  // Handle navigation with URL updates
  const handleBack = () => {
    navigate('/news');
    showFeed();
  };

  const handleNext = () => {
    if (canGoNext) {
      goToNextArticle();
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious) {
      goToPreviousArticle();
    }
  };

  const handleArticleClick = (article: NewsArticle) => {
    showArticle(article);
    navigate(`/news/${article.id}`);
  };

  const handleCommentsClick = (article: NewsArticle) => {
    setSelectedArticle(article);
    setShowComments(true);
  };

  const handlePreferencesClick = () => {
    setShowPreferences(true);
  };

  if (currentView === 'article' && currentArticle) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleBack}>
            ← Back to News Feed
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleCommentsClick(currentArticle)}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Comments
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePreferencesClick}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
        
        {/* Article content would go here - simplified for now */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">{currentArticle.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{currentArticle.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>By {currentArticle.author || currentArticle.source}</span>
            <span>•</span>
            <span>{new Date(currentArticle.publishedAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>{currentArticle.location.city}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handlePreferencesClick}
        >
          <Settings className="h-4 w-4 mr-2" />
          News Settings
        </Button>
      </div>
      
      <RealTimeNewsFeed
        onArticleClick={handleArticleClick}
      />

      {/* Comments Modal */}
      {selectedArticle && (
        <NewsComments
          articleId={selectedArticle.id}
          isOpen={showComments}
          onClose={() => {
            setShowComments(false);
            setSelectedArticle(null);
          }}
        />
      )}

      {/* Preferences Modal */}
      <NewsPreferences
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />
    </div>
  );
};

const News: React.FC = () => {
  return (
    <NewsProvider>
      <ResponsiveLayout showNewsFeed={false}>
        <NewsContent />
      </ResponsiveLayout>
    </NewsProvider>
  );
};

export default News;