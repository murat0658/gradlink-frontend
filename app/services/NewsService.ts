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

class NewsService {
  async createNews(newsData: CreateNewsRequest): Promise<NewsItem> {
    console.log("📰 NewsService.createNews() called with data:", newsData);
    const payload = {
      ...newsData,
      title: newsData.title?.trim() || "Update",
    };
    const res = await apiService.makeRequest<any>(API_ENDPOINTS.NEWS.CREATE, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const news = res?.news ?? res;
    return {
      ...news,
      title: news.title ?? payload.title,
      author: news.author ?? news.createdByName ?? "Unknown",
      createdAt: news.createdAt ?? new Date().toISOString(),
    };
  }

  async getNewsByGroup(groupId: string | number): Promise<NewsItem[]> {
    console.log("📰 NewsService.getNewsByGroup() called for group:", groupId);
    const endpoint = API_ENDPOINTS.NEWS.BY_GROUP.replace(
      ":id",
      groupId.toString()
    );
    return apiService.makeRequest<NewsItem[]>(endpoint);
  }
}

export const newsService = new NewsService();
