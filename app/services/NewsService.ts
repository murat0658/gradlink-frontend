import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

export interface NewsItem {
  id: string;
  title?: string;
  content: string;
  author: string;
  groupCode: string;
  groupName: string;
  createdAt: string;
  updatedAt: string;
  likes?: number;
  isLiked?: boolean;
}

export interface CreateNewsRequest {
  title?: string;
  content: string;
  groupCode: string;
}

export interface UpdateNewsRequest {
  title?: string;
  content: string;
}

class NewsService {
  private baseUrl = API_BASE_URL;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      console.log(`📰 News API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ News API Error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ News API Success: ${options.method || 'GET'} ${url}`, data);
      
      return data;
    } catch (error) {
      console.error(`❌ News API Request Failed: ${options.method || 'GET'} ${url}`, error);
      throw error;
    }
  }

  async createNews(newsData: CreateNewsRequest): Promise<NewsItem> {
    return this.request<NewsItem>(API_ENDPOINTS.NEWS.CREATE, {
      method: 'POST',
      body: JSON.stringify(newsData),
    });
  }

  async getNewsByGroup(groupCode: string): Promise<NewsItem[]> {
    const endpoint = API_ENDPOINTS.NEWS.BY_GROUP.replace(':code', groupCode);
    return this.request<NewsItem[]>(endpoint);
  }

  async updateNews(newsId: string, newsData: UpdateNewsRequest): Promise<NewsItem> {
    const endpoint = API_ENDPOINTS.NEWS.UPDATE.replace(':id', newsId);
    return this.request<NewsItem>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(newsData),
    });
  }

  async deleteNews(newsId: string): Promise<void> {
    const endpoint = API_ENDPOINTS.NEWS.DELETE.replace(':id', newsId);
    return this.request<void>(endpoint, {
      method: 'DELETE',
    });
  }

  async likeNews(newsId: string): Promise<NewsItem> {
    const endpoint = `${API_ENDPOINTS.NEWS.BASE}/${newsId}/like`;
    return this.request<NewsItem>(endpoint, {
      method: 'POST',
    });
  }

  async unlikeNews(newsId: string): Promise<NewsItem> {
    const endpoint = `${API_ENDPOINTS.NEWS.BASE}/${newsId}/unlike`;
    return this.request<NewsItem>(endpoint, {
      method: 'POST',
    });
  }
}

export const newsService = new NewsService();
