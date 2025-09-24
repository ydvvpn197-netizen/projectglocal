import { NewsApiArticle } from '@/types/news';

export interface RSSFeedItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  guid?: string;
  category?: string;
  author?: string;
  enclosure?: {
    url: string;
    type: string;
    length?: string;
  };
  'media:content'?: {
    url: string;
    type: string;
    width?: string;
    height?: string;
  };
  'media:thumbnail'?: {
    url: string;
    width?: string;
    height?: string;
  };
}

export interface RSSFeed {
  title: string;
  description: string;
  link: string;
  language?: string;
  lastBuildDate?: string;
  items: RSSFeedItem[];
}

export class RSSFeedParser {
  private static instance: RSSFeedParser;

  private constructor() {}

  public static getInstance(): RSSFeedParser {
    if (!RSSFeedParser.instance) {
      RSSFeedParser.instance = new RSSFeedParser();
    }
    return RSSFeedParser.instance;
  }

  /**
   * Parse RSS feed from URL
   */
  async parseRSSFeed(feedUrl: string): Promise<RSSFeed> {
    try {
      // Use CORS proxy for RSS feeds that don't support CORS
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`;
      
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
      }

      const data = await response.json();
      const xmlContent = data.contents;

      return this.parseXMLContent(xmlContent);
    } catch (error) {
      console.error('Error parsing RSS feed:', error);
      throw error;
    }
  }

  /**
   * Parse XML content to RSS feed object
   */
  private parseXMLContent(xmlContent: string): RSSFeed {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Invalid XML content');
    }

    const channel = xmlDoc.querySelector('channel');
    if (!channel) {
      throw new Error('No channel found in RSS feed');
    }

    const title = this.getTextContent(channel, 'title') || '';
    const description = this.getTextContent(channel, 'description') || '';
    const link = this.getTextContent(channel, 'link') || '';
    const language = this.getTextContent(channel, 'language') || undefined;
    const lastBuildDate = this.getTextContent(channel, 'lastBuildDate') || undefined;

    const items = Array.from(channel.querySelectorAll('item')).map(item => this.parseRSSItem(item));

    return {
      title,
      description,
      link,
      language,
      lastBuildDate,
      items
    };
  }

  /**
   * Parse individual RSS item
   */
  private parseRSSItem(item: Element): RSSFeedItem {
    const title = this.getTextContent(item, 'title') || '';
    const description = this.getTextContent(item, 'description') || '';
    const link = this.getTextContent(item, 'link') || '';
    const pubDate = this.getTextContent(item, 'pubDate') || '';
    const guid = this.getTextContent(item, 'guid') || undefined;
    const category = this.getTextContent(item, 'category') || undefined;
    const author = this.getTextContent(item, 'author') || undefined;

    // Parse enclosure
    const enclosure = item.querySelector('enclosure');
    const enclosureData = enclosure ? {
      url: enclosure.getAttribute('url') || '',
      type: enclosure.getAttribute('type') || '',
      length: enclosure.getAttribute('length') || undefined
    } : undefined;

    // Parse media content
    const mediaContent = item.querySelector('media\\:content, content');
    const mediaContentData = mediaContent ? {
      url: mediaContent.getAttribute('url') || '',
      type: mediaContent.getAttribute('type') || '',
      width: mediaContent.getAttribute('width') || undefined,
      height: mediaContent.getAttribute('height') || undefined
    } : undefined;

    // Parse media thumbnail
    const mediaThumbnail = item.querySelector('media\\:thumbnail, thumbnail');
    const mediaThumbnailData = mediaThumbnail ? {
      url: mediaThumbnail.getAttribute('url') || '',
      width: mediaThumbnail.getAttribute('width') || undefined,
      height: mediaThumbnail.getAttribute('height') || undefined
    } : undefined;

    return {
      title,
      description,
      link,
      pubDate,
      guid,
      category,
      author,
      enclosure: enclosureData,
      'media:content': mediaContentData,
      'media:thumbnail': mediaThumbnailData
    };
  }

  /**
   * Get text content from element
   */
  private getTextContent(element: Element, tagName: string): string | null {
    const tag = element.querySelector(tagName);
    return tag ? tag.textContent?.trim() || null : null;
  }

  /**
   * Convert RSS feed items to NewsApiArticle format
   */
  convertToNewsArticles(feed: RSSFeed, sourceName: string): NewsApiArticle[] {
    return feed.items.map(item => {
      // Extract image URL from various sources
      let imageUrl = null;
      if (item.enclosure?.type?.startsWith('image/')) {
        imageUrl = item.enclosure.url;
      } else if (item['media:content']?.type?.startsWith('image/')) {
        imageUrl = item['media:content'].url;
      } else if (item['media:thumbnail']) {
        imageUrl = item['media:thumbnail'].url;
      }

      // Clean description (remove HTML tags)
      const cleanDescription = this.stripHtmlTags(item.description);

      return {
        title: item.title,
        description: cleanDescription,
        url: item.link,
        urlToImage: imageUrl,
        publishedAt: this.parseDate(item.pubDate),
        source: {
          id: sourceName.toLowerCase().replace(/\s+/g, '-'),
          name: sourceName
        },
        author: item.author || undefined,
        category: item.category || undefined
      };
    });
  }

  /**
   * Strip HTML tags from text
   */
  private stripHtmlTags(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }

  /**
   * Parse date string to ISO format
   */
  private parseDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toISOString();
    } catch (error) {
      console.warn('Failed to parse date:', dateString);
      return new Date().toISOString();
    }
  }
}
