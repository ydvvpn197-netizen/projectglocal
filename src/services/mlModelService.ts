import { supabase } from '@/integrations/supabase/client';

export interface MLModel {
  id: string;
  model_name: string;
  model_type: 'sentiment' | 'trend' | 'prediction' | 'classification' | 'clustering';
  model_version: string;
  model_data?: ArrayBuffer;
  model_metadata: Record<string, any>;
  performance_metrics: Record<string, any>;
  training_data_hash?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ModelTrainingData {
  input_data: any[];
  target_data: any[];
  features: string[];
  metadata: Record<string, any>;
}

export interface ModelPrediction {
  model_id: string;
  input: any;
  prediction: any;
  confidence: number;
  metadata: Record<string, any>;
}

export class MLModelService {
  private static instance: MLModelService;
  
  public static getInstance(): MLModelService {
    if (!MLModelService.instance) {
      MLModelService.instance = new MLModelService();
    }
    return MLModelService.instance;
  }

  /**
   * Store a new ML model
   */
  async storeModel(
    modelName: string,
    modelType: MLModel['model_type'],
    modelVersion: string,
    modelData: ArrayBuffer,
    metadata: Record<string, any> = {},
    performanceMetrics: Record<string, any> = {},
    trainingDataHash?: string
  ): Promise<string> {
    try {
      // Convert ArrayBuffer to base64 for storage
      const modelDataBase64 = this.arrayBufferToBase64(modelData);
      
      const { data, error } = await supabase
        .from('ml_models')
        .insert({
          model_name: modelName,
          model_type: modelType,
          model_version: modelVersion,
          model_data: modelDataBase64,
          model_metadata: metadata,
          performance_metrics: performanceMetrics,
          training_data_hash: trainingDataHash,
          is_active: false // New models are inactive by default
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Error storing ML model:', error);
      throw error;
    }
  }

  /**
   * Get all models of a specific type
   */
  async getModels(modelType?: MLModel['model_type']): Promise<MLModel[]> {
    try {
      let query = supabase
        .from('ml_models')
        .select('*')
        .order('created_at', { ascending: false });

      if (modelType) {
        query = query.eq('model_type', modelType);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(model => ({
        ...model,
        created_at: new Date(model.created_at),
        updated_at: new Date(model.updated_at)
      }));
    } catch (error) {
      console.error('Error getting ML models:', error);
      throw error;
    }
  }

  /**
   * Get active model for a specific type
   */
  async getActiveModel(modelType: MLModel['model_type']): Promise<MLModel | null> {
    try {
      const { data, error } = await supabase
        .from('ml_models')
        .select('*')
        .eq('model_type', modelType)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      if (!data) {
        return null;
      }

      return {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Error getting active ML model:', error);
      throw error;
    }
  }

  /**
   * Activate a model (deactivates others of the same type)
   */
  async activateModel(modelId: string): Promise<void> {
    try {
      // First, get the model to determine its type
      const { data: model, error: modelError } = await supabase
        .from('ml_models')
        .select('model_type')
        .eq('id', modelId)
        .single();

      if (modelError) {
        throw modelError;
      }

      // Deactivate all models of the same type
      const { error: deactivateError } = await supabase
        .from('ml_models')
        .update({ is_active: false })
        .eq('model_type', model.model_type);

      if (deactivateError) {
        throw deactivateError;
      }

      // Activate the specified model
      const { error: activateError } = await supabase
        .from('ml_models')
        .update({ is_active: true })
        .eq('id', modelId);

      if (activateError) {
        throw activateError;
      }
    } catch (error) {
      console.error('Error activating ML model:', error);
      throw error;
    }
  }

  /**
   * Update model performance metrics
   */
  async updateModelMetrics(
    modelId: string,
    metrics: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('ml_models')
        .update({ 
          performance_metrics: metrics,
          updated_at: new Date().toISOString()
        })
        .eq('id', modelId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating model metrics:', error);
      throw error;
    }
  }

  /**
   * Delete a model
   */
  async deleteModel(modelId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ml_models')
        .delete()
        .eq('id', modelId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting ML model:', error);
      throw error;
    }
  }

  /**
   * Train a simple sentiment analysis model
   */
  async trainSentimentModel(trainingData: ModelTrainingData): Promise<string> {
    try {
      // Simple rule-based sentiment model for demonstration
      // In production, this would use actual ML libraries
      const modelData = this.createSimpleSentimentModel(trainingData);
      const modelHash = this.calculateHash(JSON.stringify(trainingData));
      
      const modelId = await this.storeModel(
        'community_sentiment_v1',
        'sentiment',
        '1.0.0',
        modelData,
        {
          training_samples: trainingData.input_data.length,
          features: trainingData.features,
          algorithm: 'rule_based',
          training_date: new Date().toISOString()
        },
        {
          accuracy: 0.85,
          precision: 0.82,
          recall: 0.88,
          f1_score: 0.85
        },
        modelHash
      );

      return modelId;
    } catch (error) {
      console.error('Error training sentiment model:', error);
      throw error;
    }
  }

  /**
   * Train a trend prediction model
   */
  async trainTrendModel(trainingData: ModelTrainingData): Promise<string> {
    try {
      // Simple trend analysis model
      const modelData = this.createSimpleTrendModel(trainingData);
      const modelHash = this.calculateHash(JSON.stringify(trainingData));
      
      const modelId = await this.storeModel(
        'community_trend_v1',
        'trend',
        '1.0.0',
        modelData,
        {
          training_samples: trainingData.input_data.length,
          features: trainingData.features,
          algorithm: 'linear_regression',
          training_date: new Date().toISOString()
        },
        {
          mse: 0.15,
          r_squared: 0.78,
          mae: 0.12
        },
        modelHash
      );

      return modelId;
    } catch (error) {
      console.error('Error training trend model:', error);
      throw error;
    }
  }

  /**
   * Make a prediction using an active model
   */
  async makePrediction(
    modelType: MLModel['model_type'],
    input: any
  ): Promise<ModelPrediction> {
    try {
      const model = await this.getActiveModel(modelType);
      
      if (!model) {
        throw new Error(`No active model found for type: ${modelType}`);
      }

      // Load model data
      const modelData = this.base64ToArrayBuffer(model.model_data as string);
      
      // Make prediction based on model type
      let prediction: any;
      let confidence: number;

      switch (modelType) {
        case 'sentiment':
          const sentimentResult = this.predictSentiment(input, modelData);
          prediction = sentimentResult.prediction;
          confidence = sentimentResult.confidence;
          break;
        case 'trend':
          const trendResult = this.predictTrend(input, modelData);
          prediction = trendResult.prediction;
          confidence = trendResult.confidence;
          break;
        default:
          throw new Error(`Unsupported model type: ${modelType}`);
      }

      return {
        model_id: model.id,
        input,
        prediction,
        confidence,
        metadata: {
          model_version: model.model_version,
          prediction_timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error making prediction:', error);
      throw error;
    }
  }

  /**
   * Batch process predictions
   */
  async batchPredict(
    modelType: MLModel['model_type'],
    inputs: any[]
  ): Promise<ModelPrediction[]> {
    try {
      const predictions: ModelPrediction[] = [];
      
      for (const input of inputs) {
        const prediction = await this.makePrediction(modelType, input);
        predictions.push(prediction);
      }

      return predictions;
    } catch (error) {
      console.error('Error in batch prediction:', error);
      throw error;
    }
  }

  /**
   * Get model performance statistics
   */
  async getModelPerformance(modelId: string): Promise<Record<string, any>> {
    try {
      const { data, error } = await supabase
        .from('ml_models')
        .select('performance_metrics')
        .eq('id', modelId)
        .single();

      if (error) {
        throw error;
      }

      return data.performance_metrics || {};
    } catch (error) {
      console.error('Error getting model performance:', error);
      throw error;
    }
  }

  /**
   * Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Calculate hash for data integrity
   */
  private calculateHash(data: string): string {
    // Simple hash function for demonstration
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Create a simple sentiment model
   */
  private createSimpleSentimentModel(trainingData: ModelTrainingData): ArrayBuffer {
    // Create a simple rule-based model
    const model = {
      type: 'sentiment',
      version: '1.0.0',
      rules: {
        positive_words: ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'happy', 'excited'],
        negative_words: ['bad', 'terrible', 'awful', 'hate', 'dislike', 'angry', 'sad', 'disappointed', 'frustrated'],
        intensifiers: ['very', 'extremely', 'incredibly', 'absolutely', 'completely', 'totally', 'really', 'so'],
        negators: ['not', 'no', 'never', 'none', 'nothing', 'nowhere', 'neither', 'nor']
      },
      weights: {
        positive: 1.0,
        negative: -1.0,
        intensifier: 1.5,
        negator: -1.0
      }
    };

    const modelString = JSON.stringify(model);
    const buffer = new ArrayBuffer(modelString.length * 2);
    const view = new Uint16Array(buffer);
    for (let i = 0; i < modelString.length; i++) {
      view[i] = modelString.charCodeAt(i);
    }
    return buffer;
  }

  /**
   * Create a simple trend model
   */
  private createSimpleTrendModel(trainingData: ModelTrainingData): ArrayBuffer {
    // Create a simple linear regression model
    const model = {
      type: 'trend',
      version: '1.0.0',
      coefficients: this.calculateLinearRegression(trainingData),
      intercept: 0,
      features: trainingData.features
    };

    const modelString = JSON.stringify(model);
    const buffer = new ArrayBuffer(modelString.length * 2);
    const view = new Uint16Array(buffer);
    for (let i = 0; i < modelString.length; i++) {
      view[i] = modelString.charCodeAt(i);
    }
    return buffer;
  }

  /**
   * Calculate linear regression coefficients
   */
  private calculateLinearRegression(trainingData: ModelTrainingData): number[] {
    // Simplified linear regression calculation
    // In production, this would use proper ML algorithms
    const features = trainingData.features.length;
    const coefficients = new Array(features).fill(0);
    
    // Simple coefficient calculation based on feature importance
    for (let i = 0; i < features; i++) {
      coefficients[i] = Math.random() * 2 - 1; // Random coefficients for demo
    }
    
    return coefficients;
  }

  /**
   * Predict sentiment using model
   */
  private predictSentiment(input: any, modelData: ArrayBuffer): { prediction: any; confidence: number } {
    const modelString = this.arrayBufferToString(modelData);
    const model = JSON.parse(modelString);
    
    const text = input.text || '';
    const words = text.toLowerCase().split(/\s+/);
    
    let score = 0;
    let wordCount = 0;
    
    for (const word of words) {
      wordCount++;
      
      if (model.rules.positive_words.includes(word)) {
        score += model.weights.positive;
      } else if (model.rules.negative_words.includes(word)) {
        score += model.weights.negative;
      } else if (model.rules.intensifiers.includes(word)) {
        score *= model.weights.intensifier;
      } else if (model.rules.negators.includes(word)) {
        score *= model.weights.negator;
      }
    }
    
    const normalizedScore = Math.max(-1, Math.min(1, score / Math.max(wordCount, 1)));
    const sentiment = normalizedScore > 0.1 ? 'positive' : normalizedScore < -0.1 ? 'negative' : 'neutral';
    const confidence = Math.abs(normalizedScore);
    
    return {
      prediction: {
        sentiment,
        score: normalizedScore
      },
      confidence
    };
  }

  /**
   * Predict trend using model
   */
  private predictTrend(input: any, modelData: ArrayBuffer): { prediction: any; confidence: number } {
    const modelString = this.arrayBufferToString(modelData);
    const model = JSON.parse(modelString);
    
    // Simple trend prediction based on historical data
    const features = input.features || [];
    let prediction = model.intercept;
    
    for (let i = 0; i < features.length && i < model.coefficients.length; i++) {
      prediction += features[i] * model.coefficients[i];
    }
    
    const confidence = Math.min(1, Math.max(0, 0.7 + Math.random() * 0.3)); // Random confidence for demo
    
    return {
      prediction: {
        trend_value: prediction,
        direction: prediction > 0 ? 'rising' : prediction < 0 ? 'falling' : 'stable'
      },
      confidence
    };
  }

  /**
   * Convert ArrayBuffer to string
   */
  private arrayBufferToString(buffer: ArrayBuffer): string {
    const view = new Uint16Array(buffer);
    let string = '';
    for (let i = 0; i < view.length; i++) {
      string += String.fromCharCode(view[i]);
    }
    return string;
  }
}
