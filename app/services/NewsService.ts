import { API_ENDPOINTS } from "../config/api";
import { apiService } from "./ApiService";

export interface NewsItem {
  id: string;
  title?: string;
  content?: string;
  description?: string;
  author: string;
  groupId?: string | number;
  groupCode?: string; // For backward compatibility
  groupName: string;
  createdAt: string;
  updatedAt: string;
  likes?: number;
  isLiked?: boolean;
}

export interface CreateNewsRequest {
  title?: string;
  description: string;
  groupId?: string | number;
  groupCode?: string; // For backward compatibility
  location?: string;
  startTime?: string;
  endTime?: string;
  capacity?: number;
}

export interface UpdateNewsRequest {
  title?: string;
  content: string;
}

class NewsService {
  async createNews(newsData: CreateNewsRequest): Promise<NewsItem> {
    console.log("📰 NewsService.createNews() called with data:", newsData);
    return apiService.makeRequest<NewsItem>(API_ENDPOINTS.NEWS.CREATE, {
      method: "POST",
      body: JSON.stringify(newsData),
    });
  }

  async getNewsByGroup(groupId: string | number): Promise<NewsItem[]> {
    console.log("📰 NewsService.getNewsByGroup() called for group:", groupId);
    const endpoint = API_ENDPOINTS.NEWS.BY_GROUP.replace(
      ":id",
      groupId.toString()
    );
    return apiService.makeRequest<NewsItem[]>(endpoint);
  }

  async updateNews(
    newsId: string,
    newsData: UpdateNewsRequest
  ): Promise<NewsItem> {
    console.log("📰 NewsService.updateNews() called for news:", newsId);
    const endpoint = API_ENDPOINTS.NEWS.UPDATE.replace(":id", newsId);
    return apiService.makeRequest<NewsItem>(endpoint, {
      method: "PUT",
      body: JSON.stringify(newsData),
    });
  }

  async deleteNews(newsId: string): Promise<void> {
    console.log("📰 NewsService.deleteNews() called for news:", newsId);
    const endpoint = API_ENDPOINTS.NEWS.DELETE.replace(":id", newsId);
    return apiService.makeRequest<void>(endpoint, {
      method: "DELETE",
    });
  }

  async likeNews(newsId: string): Promise<NewsItem> {
    console.log("📰 NewsService.likeNews() called for news:", newsId);
    const endpoint = `${API_ENDPOINTS.NEWS.BASE}/${newsId}/like`;
    return apiService.makeRequest<NewsItem>(endpoint, {
      method: "POST",
    });
  }

  async unlikeNews(newsId: string): Promise<NewsItem> {
    console.log("📰 NewsService.unlikeNews() called for news:", newsId);
    const endpoint = `${API_ENDPOINTS.NEWS.BASE}/${newsId}/unlike`;
    return apiService.makeRequest<NewsItem>(endpoint, {
      method: "POST",
    });
  }
}

export const newsService = new NewsService();
