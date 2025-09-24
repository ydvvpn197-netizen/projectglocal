/**
 * Database Optimization Service
 * Provides database query optimization, indexing, and performance monitoring
 */

export interface QueryOptimization {
  originalQuery: string;
  optimizedQuery: string;
  estimatedImprovement: number;
  suggestions: string[];
  indexes: IndexSuggestion[];
}

export interface IndexSuggestion {
  table: string;
  columns: string[];
  type: 'btree' | 'hash' | 'gin' | 'gist';
  unique: boolean;
  partial?: string;
  estimatedBenefit: 'low' | 'medium' | 'high';
}

export interface QueryStats {
  query: string;
  executionTime: number;
  rowsReturned: number;
  rowsExamined: number;
  indexUsed: boolean;
  timestamp: number;
}

export interface DatabaseMetrics {
  totalQueries: number;
  averageExecutionTime: number;
  slowQueries: number;
  indexHitRate: number;
  cacheHitRate: number;
  connectionPool: {
    active: number;
    idle: number;
    total: number;
  };
}

export interface OptimizationConfig {
  enableQueryCaching: boolean;
  enableIndexOptimization: boolean;
  enableQueryAnalysis: boolean;
  slowQueryThreshold: number;
  maxCacheSize: number;
  enableConnectionPooling: boolean;
  maxConnections: number;
}

export class DatabaseOptimizationService {
  private static instance: DatabaseOptimizationService;
  private config: OptimizationConfig;
  private queryStats: QueryStats[] = [];
  private queryCache = new Map<string, { data: unknown[]; timestamp: number }>();
  private slowQueries = new Set<string>();

  static getInstance(): DatabaseOptimizationService {
    if (!DatabaseOptimizationService.instance) {
      DatabaseOptimizationService.instance = new DatabaseOptimizationService();
    }
    return DatabaseOptimizationService.instance;
  }

  constructor() {
    this.config = this.getDefaultConfig();
    this.startMonitoring();
  }

  private getDefaultConfig(): OptimizationConfig {
    return {
      enableQueryCaching: true,
      enableIndexOptimization: true,
      enableQueryAnalysis: true,
      slowQueryThreshold: 1000, // 1 second
      maxCacheSize: 1000,
      enableConnectionPooling: true,
      maxConnections: 20,
    };
  }

  /**
   * Optimize a database query
   */
  async optimizeQuery(query: string, params?: unknown[]): Promise<QueryOptimization> {
    try {
      const analysis = await this.analyzeQuery(query, params);
      const optimization = await this.generateOptimization(query, analysis);
      
      return optimization;
    } catch (error) {
      console.error('Failed to optimize query:', error);
      throw new Error('Query optimization failed');
    }
  }

  /**
   * Execute optimized query with caching
   */
  async executeOptimizedQuery<T>(
    query: string,
    params?: unknown[],
    options: { cache?: boolean; ttl?: number } = {}
  ): Promise<T[]> {
    const startTime = Date.now();
    
    try {
      // Check cache first
      if (options.cache !== false && this.config.enableQueryCaching) {
        const cacheKey = this.generateCacheKey(query, params);
        const cached = this.queryCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < (options.ttl || 300000)) {
          this.recordQueryStats(query, Date.now() - startTime, cached.data.length, 0, true);
          return cached.data;
        }
      }

      // Execute query (mock implementation)
      const result = await this.executeQuery(query, params);
      const executionTime = Date.now() - startTime;

      // Record query statistics
      this.recordQueryStats(query, executionTime, result.length, result.length, false);

      // Cache result if enabled
      if (options.cache !== false && this.config.enableQueryCaching) {
        const cacheKey = this.generateCacheKey(query, params);
        this.queryCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });
      }

      // Check if query is slow
      if (executionTime > this.config.slowQueryThreshold) {
        this.slowQueries.add(query);
        console.warn(`Slow query detected: ${executionTime}ms - ${query}`);
      }

      return result;
    } catch (error) {
      console.error('Query execution failed:', error);
      throw error;
    }
  }

  /**
   * Get database performance metrics
   */
  getDatabaseMetrics(): DatabaseMetrics {
    const totalQueries = this.queryStats.length;
    const averageExecutionTime = totalQueries > 0 
      ? this.queryStats.reduce((sum, stat) => sum + stat.executionTime, 0) / totalQueries
      : 0;
    
    const slowQueries = this.queryStats.filter(stat => 
      stat.executionTime > this.config.slowQueryThreshold
    ).length;

    const indexHitRate = totalQueries > 0
      ? this.queryStats.filter(stat => stat.indexUsed).length / totalQueries
      : 0;

    const cacheHitRate = totalQueries > 0
      ? this.queryStats.filter(stat => stat.indexUsed).length / totalQueries
      : 0;

    return {
      totalQueries,
      averageExecutionTime,
      slowQueries,
      indexHitRate,
      cacheHitRate,
      connectionPool: {
        active: 5, // Mock data
        idle: 10,
        total: 15,
      },
    };
  }

  /**
   * Get slow queries
   */
  getSlowQueries(): QueryStats[] {
    return this.queryStats.filter(stat => 
      stat.executionTime > this.config.slowQueryThreshold
    ).sort((a, b) => b.executionTime - a.executionTime);
  }

  /**
   * Get index suggestions
   */
  async getIndexSuggestions(): Promise<IndexSuggestion[]> {
    const suggestions: IndexSuggestion[] = [];

    // Analyze slow queries for index opportunities
    const slowQueries = this.getSlowQueries();
    
    for (const queryStat of slowQueries) {
      const analysis = await this.analyzeQuery(queryStat.query);
      const indexSuggestions = this.generateIndexSuggestions(analysis);
      suggestions.push(...indexSuggestions);
    }

    // Remove duplicates and sort by benefit
    const uniqueSuggestions = this.deduplicateIndexSuggestions(suggestions);
    return uniqueSuggestions.sort((a, b) => 
      this.getBenefitScore(b.estimatedBenefit) - this.getBenefitScore(a.estimatedBenefit)
    );
  }

  /**
   * Create recommended indexes
   */
  async createRecommendedIndexes(): Promise<{ created: number; failed: number }> {
    const suggestions = await this.getIndexSuggestions();
    let created = 0;
    let failed = 0;

    for (const suggestion of suggestions) {
      try {
        await this.createIndex(suggestion);
        created++;
      } catch (error) {
        console.error('Failed to create index:', error);
        failed++;
      }
    }

    return { created, failed };
  }

  /**
   * Clear query cache
   */
  clearQueryCache(): void {
    this.queryCache.clear();
  }

  /**
   * Update optimization configuration
   */
  updateConfig(config: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): OptimizationConfig {
    return { ...this.config };
  }

  // Private helper methods

  private async analyzeQuery(query: string, params?: unknown[]): Promise<{
    tables: string[];
    columns: string[];
    joins: Array<{ table?: string; column?: string }>;
    whereClause: { columns: string[] } | null;
    orderBy: { columns: string[] } | null;
    groupBy: { columns: string[] } | null;
    hasLimit: boolean;
    estimatedRows: number;
  }> {
    // Mock query analysis - in real implementation, this would use database EXPLAIN
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      tables: this.extractTables(query),
      columns: this.extractColumns(query),
      joins: this.extractJoins(query),
      whereClause: this.extractWhereClause(query),
      orderBy: this.extractOrderBy(query),
      groupBy: this.extractGroupBy(query),
      hasLimit: query.toLowerCase().includes('limit'),
      estimatedRows: 1000, // Mock estimation
    };
  }

  private async generateOptimization(query: string, analysis: {
    tables: string[];
    columns: string[];
    joins: Array<{ table?: string; column?: string }>;
    whereClause: { columns: string[] } | null;
    orderBy: { columns: string[] } | null;
    groupBy: { columns: string[] } | null;
    hasLimit: boolean;
    estimatedRows: number;
  }): Promise<QueryOptimization> {
    const suggestions: string[] = [];
    const indexes: IndexSuggestion[] = [];

    // Add WHERE clause optimization
    if (analysis.whereClause) {
      suggestions.push('Ensure WHERE clause columns are indexed');
      indexes.push({
        table: analysis.tables[0],
        columns: analysis.whereClause.columns,
        type: 'btree',
        unique: false,
        estimatedBenefit: 'high',
      });
    }

    // Add JOIN optimization
    if (analysis.joins.length > 0) {
      suggestions.push('Ensure JOIN columns are indexed');
      analysis.joins.forEach((join: { table?: string; column?: string }) => {
        indexes.push({
          table: join.table,
          columns: [join.column],
          type: 'btree',
          unique: false,
          estimatedBenefit: 'high',
        });
      });
    }

    // Add ORDER BY optimization
    if (analysis.orderBy) {
      suggestions.push('Consider adding composite index for ORDER BY columns');
      indexes.push({
        table: analysis.tables[0],
        columns: analysis.orderBy.columns,
        type: 'btree',
        unique: false,
        estimatedBenefit: 'medium',
      });
    }

    // Add LIMIT optimization
    if (!analysis.hasLimit && analysis.estimatedRows > 100) {
      suggestions.push('Consider adding LIMIT clause to reduce result set');
    }

    return {
      originalQuery: query,
      optimizedQuery: this.optimizeQueryString(query, analysis),
      estimatedImprovement: this.calculateImprovement(analysis),
      suggestions,
      indexes,
    };
  }

  private optimizeQueryString(query: string, analysis: {
    tables: string[];
    columns: string[];
    joins: Array<{ table?: string; column?: string }>;
    whereClause: { columns: string[] } | null;
    orderBy: { columns: string[] } | null;
    groupBy: { columns: string[] } | null;
    hasLimit: boolean;
    estimatedRows: number;
  }): string {
    let optimized = query;

    // Add LIMIT if missing and query could return many rows
    if (!analysis.hasLimit && analysis.estimatedRows > 100) {
      optimized += ' LIMIT 100';
    }

    // Optimize SELECT clause
    if (query.toLowerCase().includes('select *')) {
      optimized = optimized.replace(/select \*/gi, 'SELECT specific_columns');
    }

    return optimized;
  }

  private calculateImprovement(analysis: {
    tables: string[];
    columns: string[];
    joins: Array<{ table?: string; column?: string }>;
    whereClause: { columns: string[] } | null;
    orderBy: { columns: string[] } | null;
    groupBy: { columns: string[] } | null;
    hasLimit: boolean;
    estimatedRows: number;
  }): number {
    let improvement = 0;

    if (analysis.whereClause) improvement += 30;
    if (analysis.joins.length > 0) improvement += 20;
    if (analysis.orderBy) improvement += 15;
    if (analysis.hasLimit) improvement += 10;

    return Math.min(improvement, 80); // Cap at 80% improvement
  }

  private generateIndexSuggestions(analysis: {
    tables: string[];
    columns: string[];
    joins: Array<{ table?: string; column?: string }>;
    whereClause: { columns: string[] } | null;
    orderBy: { columns: string[] } | null;
    groupBy: { columns: string[] } | null;
    hasLimit: boolean;
    estimatedRows: number;
  }): IndexSuggestion[] {
    const suggestions: IndexSuggestion[] = [];

    // WHERE clause indexes
    if (analysis.whereClause) {
      suggestions.push({
        table: analysis.tables[0],
        columns: analysis.whereClause.columns,
        type: 'btree',
        unique: false,
        estimatedBenefit: 'high',
      });
    }

    // JOIN indexes
    analysis.joins.forEach((join: { table?: string; column?: string }) => {
      suggestions.push({
        table: join.table,
        columns: [join.column],
        type: 'btree',
        unique: false,
        estimatedBenefit: 'high',
      });
    });

    return suggestions;
  }

  private deduplicateIndexSuggestions(suggestions: IndexSuggestion[]): IndexSuggestion[] {
    const seen = new Set<string>();
    return suggestions.filter(suggestion => {
      const key = `${suggestion.table}:${suggestion.columns.join(',')}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private getBenefitScore(benefit: 'low' | 'medium' | 'high'): number {
    const scores = { low: 1, medium: 2, high: 3 };
    return scores[benefit];
  }

  private recordQueryStats(
    query: string,
    executionTime: number,
    rowsReturned: number,
    rowsExamined: number,
    fromCache: boolean
  ): void {
    const stats: QueryStats = {
      query: query.substring(0, 200), // Truncate long queries
      executionTime,
      rowsReturned,
      rowsExamined,
      indexUsed: !fromCache, // Mock index usage
      timestamp: Date.now(),
    };

    this.queryStats.push(stats);

    // Keep only last 1000 queries
    if (this.queryStats.length > 1000) {
      this.queryStats = this.queryStats.slice(-1000);
    }
  }

  private generateCacheKey(query: string, params?: unknown[]): string {
    const paramStr = params ? JSON.stringify(params) : '';
    return `${query}:${paramStr}`;
  }

  private async executeQuery(query: string, params?: unknown[]): Promise<unknown[]> {
    // Mock query execution - in real implementation, this would execute against database
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500));
    return [];
  }

  private async createIndex(suggestion: IndexSuggestion): Promise<void> {
    // Mock index creation - in real implementation, this would create actual database indexes
    console.log(`Creating index: ${suggestion.table}.${suggestion.columns.join(',')}`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private startMonitoring(): void {
    // Monitor database performance every 5 minutes
    setInterval(() => {
      this.analyzePerformance();
    }, 5 * 60 * 1000);
  }

  private analyzePerformance(): void {
    const metrics = this.getDatabaseMetrics();
    
    if (metrics.averageExecutionTime > this.config.slowQueryThreshold) {
      console.warn('Database performance degradation detected');
    }

    if (metrics.indexHitRate < 0.8) {
      console.warn('Low index hit rate detected');
    }
  }

  // Query parsing helpers (simplified implementations)

  private extractTables(query: string): string[] {
    const match = query.match(/from\s+(\w+)/gi);
    return match ? match.map(m => m.replace(/from\s+/gi, '')) : [];
  }

  private extractColumns(query: string): string[] {
    const match = query.match(/select\s+(.+?)\s+from/gi);
    if (!match) return [];
    
    const columns = match[0].replace(/select\s+/gi, '').replace(/\s+from/gi, '');
    return columns.split(',').map(col => col.trim());
  }

  private extractJoins(query: string): Array<{ table?: string; column?: string }> {
    const matches = query.match(/join\s+(\w+)\s+on\s+(\w+\.\w+)\s*=\s*(\w+\.\w+)/gi);
    if (!matches) return [];
    
    return matches.map(match => {
      const parts = match.match(/join\s+(\w+)\s+on\s+(\w+)\.(\w+)\s*=\s*(\w+)\.(\w+)/i);
      return {
        table: parts?.[1],
        column: parts?.[3],
      };
    });
  }

  private extractWhereClause(query: string): { columns: string[] } | null {
    const match = query.match(/where\s+(.+?)(?:\s+group\s+by|\s+order\s+by|\s+limit|$)/gi);
    if (!match) return null;
    
    return {
      columns: this.extractColumnNames(match[0]),
    };
  }

  private extractOrderBy(query: string): { columns: string[] } | null {
    const match = query.match(/order\s+by\s+(.+?)(?:\s+limit|$)/gi);
    if (!match) return null;
    
    return {
      columns: this.extractColumnNames(match[0]),
    };
  }

  private extractGroupBy(query: string): { columns: string[] } | null {
    const match = query.match(/group\s+by\s+(.+?)(?:\s+order\s+by|\s+limit|$)/gi);
    if (!match) return null;
    
    return {
      columns: this.extractColumnNames(match[0]),
    };
  }

  private extractColumnNames(clause: string): string[] {
    const columns = clause.replace(/where\s+|order\s+by\s+|group\s+by\s+/gi, '');
    return columns.split(',').map(col => {
      const match = col.match(/(\w+)\.(\w+)/);
      return match ? match[2] : col.trim();
    });
  }
}

export const databaseOptimizationService = DatabaseOptimizationService.getInstance();
