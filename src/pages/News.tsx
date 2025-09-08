// Enhanced News page component for TheGlocal project
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { EnhancedNewsFeed } from '@/components/EnhancedNewsFeed';
import { NewsArticleView } from '@/components/NewsArticleView';
import { NewsProvider } from '@/contexts/NewsContext';
import { useNews } from '@/hooks/useNews';
import { useNewsData, type NewsArticle } from '@/hooks/useNewsData';

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

  if (currentView === 'article' && currentArticle) {
    return (
      <NewsArticleView
        article={currentArticle}
        onBack={handleBack}
        onNext={canGoNext ? handleNext : undefined}
        onPrevious={canGoPrevious ? handlePrevious : undefined}
        hasNext={canGoNext}
        hasPrevious={canGoPrevious}
      />
    );
  }

  return (
    <EnhancedNewsFeed
      onArticleClick={handleArticleClick}
    />
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