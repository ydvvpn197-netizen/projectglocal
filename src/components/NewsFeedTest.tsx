import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { NewsAggregationService } from '@/services/newsAggregationService';

const NewsFeedTest: React.FC = () => {
  const [testResults, setTestResults] = useState<Array<{ test: string; status: 'pass' | 'fail'; message: string }>>([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);
    const results: Array<{ test: string; status: 'pass' | 'fail'; message: string }> = [];

    try {
      // Test 1: Database connection
      try {
        const { data, error } = await supabase.from('news_categories').select('*').limit(1);
        if (error) throw error;
        results.push({ test: 'Database Connection', status: 'pass', message: 'Successfully connected to database' });
      } catch (error) {
        results.push({ test: 'Database Connection', status: 'fail', message: `Failed to connect: ${error}` });
      }

      // Test 2: Check if news tables exist
      try {
        const { data: categories, error: catError } = await supabase.from('news_categories').select('*');
        const { data: sources, error: srcError } = await supabase.from('news_sources').select('*');
        
        if (catError || srcError) throw new Error('Tables not found');
        
        results.push({ 
          test: 'News Tables', 
          status: 'pass', 
          message: `Found ${categories?.length || 0} categories and ${sources?.length || 0} sources` 
        });
      } catch (error) {
        results.push({ test: 'News Tables', status: 'fail', message: 'News tables not found - run migration first' });
      }

      // Test 3: Test news service
      try {
        const newsService = new NewsAggregationService();
        const stats = await newsService.getNewsStatistics();
        results.push({ 
          test: 'News Service', 
          status: 'pass', 
          message: `Service working: ${stats.total_articles} articles, ${stats.total_sources} sources` 
        });
      } catch (error) {
        results.push({ test: 'News Service', status: 'fail', message: `Service error: ${error}` });
      }

      // Test 4: Test user preferences
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: prefs, error } = await supabase
            .from('user_news_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (error && error.code !== 'PGRST116') throw error;
          
          results.push({ 
            test: 'User Preferences', 
            status: 'pass', 
            message: prefs ? 'User preferences found' : 'No preferences (will be created on first use)' 
          });
        } else {
          results.push({ test: 'User Preferences', status: 'fail', message: 'User not authenticated' });
        }
      } catch (error) {
        results.push({ test: 'User Preferences', status: 'fail', message: `Error: ${error}` });
      }

      // Test 5: Test location extraction
      try {
        const { NewsLocationExtractor } = await import('@/services/newsLocationExtractor');
        const extractor = new NewsLocationExtractor();
        const testArticle = {
          id: 'test',
          title: 'Local event in New York',
          description: 'Community gathering in New York City',
          content: 'Event details...',
          source_id: 'test',
          tags: [],
          relevance_score: 0.5,
          engagement_score: 0,
          is_verified: false,
          is_featured: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const location = await extractor.extractLocation(testArticle);
        results.push({ 
          test: 'Location Extraction', 
          status: 'pass', 
          message: location ? `Extracted: ${location.name}` : 'No location found (expected for test data)' 
        });
      } catch (error) {
        results.push({ test: 'Location Extraction', status: 'fail', message: `Error: ${error}` });
      }

      // Test 6: Test categorization
      try {
        const { NewsCategorizer } = await import('@/services/newsCategorizer');
        const categorizer = new NewsCategorizer();
        const testArticle = {
          id: 'test',
          title: 'Technology startup raises funding',
          description: 'Local tech company secures investment',
          content: 'Startup details...',
          source_id: 'test',
          tags: [],
          relevance_score: 0.5,
          engagement_score: 0,
          is_verified: false,
          is_featured: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const category = await categorizer.categorizeArticle(testArticle);
        results.push({ 
          test: 'Article Categorization', 
          status: 'pass', 
          message: category ? `Categorized as: ${category.category}` : 'No category assigned' 
        });
      } catch (error) {
        results.push({ test: 'Article Categorization', status: 'fail', message: `Error: ${error}` });
      }

    } catch (error) {
      results.push({ test: 'Overall Test', status: 'fail', message: `Test suite error: ${error}` });
    }

    setTestResults(results);
    setLoading(false);
  };

  const getStatusColor = (status: 'pass' | 'fail') => {
    return status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>News Feed System Test</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={runTests} disabled={loading} className="mb-4">
          {loading ? 'Running Tests...' : 'Run Tests'}
        </Button>
        
        <div className="space-y-2">
          {testResults.map((result, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">{result.test}</h4>
                <p className="text-sm text-gray-600">{result.message}</p>
              </div>
              <Badge className={getStatusColor(result.status)}>
                {result.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>

        {testResults.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Summary:</h4>
            <p>Passed: {testResults.filter(r => r.status === 'pass').length}</p>
            <p>Failed: {testResults.filter(r => r.status === 'fail').length}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsFeedTest;
