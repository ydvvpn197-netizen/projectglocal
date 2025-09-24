# AI Integration Setup Guide

This guide will help you set up AI providers for the news summarization feature in TheGlocal project.

## Prerequisites

- Node.js 18+ installed
- Access to at least one AI provider API
- Environment variables configured

## Supported AI Providers

### 1. OpenAI (Recommended)
- **Models**: GPT-3.5-turbo, GPT-4, GPT-4-turbo
- **Cost**: Pay-per-use
- **Quality**: Excellent
- **Setup**: Get API key from [OpenAI Platform](https://platform.openai.com/)

### 2. Anthropic Claude
- **Models**: Claude-3-sonnet, Claude-3-haiku, Claude-3-opus
- **Cost**: Pay-per-use
- **Quality**: Excellent
- **Setup**: Get API key from [Anthropic Console](https://console.anthropic.com/)

### 3. Google Gemini
- **Models**: Gemini-pro, Gemini-pro-vision
- **Cost**: Free tier available
- **Quality**: Good
- **Setup**: Get API key from [Google AI Studio](https://makersuite.google.com/)

### 4. Hugging Face
- **Models**: Various open-source models
- **Cost**: Free tier available
- **Quality**: Variable
- **Setup**: Get API key from [Hugging Face](https://huggingface.co/)

## Environment Variables Setup

Create a `.env` file in your project root with the following variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# AI Provider Configuration
# OpenAI
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_OPENAI_MODEL=gpt-3.5-turbo

# Anthropic Claude
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
VITE_ANTHROPIC_MODEL=claude-3-sonnet-20240229

# Google Gemini
VITE_GOOGLE_API_KEY=your_google_api_key_here
VITE_GOOGLE_MODEL=gemini-pro

# Hugging Face
VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key_here
VITE_HUGGINGFACE_MODEL=facebook/bart-large-cnn

# News API (Optional)
VITE_NEWS_API_KEY=your_news_api_key_here

# Application Settings
VITE_AUTO_START_NEWS_SCHEDULER=true
VITE_DEFAULT_NEWS_FETCH_INTERVAL=15
VITE_MAX_NEWS_ARTICLES_PER_FETCH=50

# Development Settings
NODE_ENV=development
VITE_DEBUG_MODE=false
```

## Getting API Keys

### OpenAI
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

### Anthropic Claude
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

### Google Gemini
1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and add it to your `.env` file

### Hugging Face
1. Go to [Hugging Face](https://huggingface.co/)
2. Sign up or log in
3. Go to Settings > Access Tokens
4. Create a new token
5. Copy the token and add it to your `.env` file

## Testing Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the admin panel
3. Go to AI Configuration
4. Test each provider to ensure they're working correctly

## Cost Optimization

### OpenAI
- Use GPT-3.5-turbo for cost-effective summarization
- Set reasonable token limits
- Monitor usage in OpenAI dashboard

### Anthropic Claude
- Use Claude-3-haiku for faster, cheaper processing
- Claude-3-sonnet for better quality when needed

### Google Gemini
- Free tier includes 60 requests per minute
- Good for development and testing

### Hugging Face
- Free tier available
- Good for open-source alternatives

## Fallback Configuration

The system includes a fallback summarization method that uses rule-based text processing. This ensures that news summarization continues to work even if AI providers are unavailable.

To enable/disable fallback:
1. Go to AI Configuration in admin panel
2. Toggle "Enable Fallback Summarization"

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify the key is correct
   - Check if the key has proper permissions
   - Ensure the key is not expired

2. **Rate Limiting**
   - Check your API provider's rate limits
   - Implement proper error handling
   - Consider using multiple providers

3. **Model Not Available**
   - Verify the model name is correct
   - Check if you have access to the model
   - Try a different model

4. **Network Issues**
   - Check your internet connection
   - Verify firewall settings
   - Test with a simple API call

### Debug Mode

Enable debug mode to see detailed logs:
```bash
VITE_DEBUG_MODE=true
```

## Best Practices

1. **Use Multiple Providers**: Set up multiple AI providers for redundancy
2. **Monitor Costs**: Keep track of API usage and costs
3. **Cache Results**: The system caches summaries to reduce API calls
4. **Error Handling**: Implement proper error handling for API failures
5. **Rate Limiting**: Respect API rate limits to avoid service interruptions

## Security Considerations

1. **Never commit API keys**: Add `.env` to your `.gitignore`
2. **Use environment variables**: Don't hardcode API keys
3. **Rotate keys regularly**: Change API keys periodically
4. **Monitor usage**: Watch for unusual API usage patterns
5. **Use least privilege**: Only grant necessary permissions to API keys

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the API provider's documentation
3. Check the browser console for errors
4. Enable debug mode for detailed logging
