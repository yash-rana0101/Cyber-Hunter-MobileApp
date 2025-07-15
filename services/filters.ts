import api from './api';

export interface FilterOption {
  id: string;
  content: string;
}

export interface TechStackOption extends FilterOption {
  logo?: string;
}

export interface LanguageOption extends FilterOption {
  logo?: string;
}

export type TagOption = FilterOption;

export const filterService = {
  // Tech Stack services
  async getTechStacks(search?: string): Promise<TechStackOption[]> {
    const params = search ? { q: search } : {};
    const response = await api.get('/api/v1/techstack', { params });
    return response.data.map((item: any) => ({
      id: item.tagId || item._id,
      content: item.content,
      logo: item.logo
    }));
  },

  async createTechStack(content: string): Promise<TechStackOption> {
    const response = await api.post('/api/v1/techstack', { content });
    return {
      id: response.data.tagId,
      content: response.data.content,
      logo: response.data.logo
    };
  },

  // Language services
  async getLanguages(search?: string): Promise<LanguageOption[]> {
    const params = search ? { q: search } : {};
    const response = await api.get('/api/v1/language', { params });
    return response.data.map((item: any) => ({
      id: item.tagId || item._id,
      content: item.content,
      logo: item.logo
    }));
  },

  async createLanguage(content: string): Promise<LanguageOption> {
    const response = await api.post('/api/v1/language', { content });
    return {
      id: response.data.tagId,
      content: response.data.content,
      logo: response.data.logo
    };
  },

  // Tag services
  async getTags(search?: string): Promise<TagOption[]> {
    const params = search ? { q: search } : {};
    const response = await api.get('/api/v1/tag', { params });
    return response.data.map((item: any) => ({
      id: item.tagId || item._id,
      content: item.content
    }));
  },

  async createTag(content: string): Promise<TagOption> {
    const response = await api.post('/api/v1/tag', { content });
    return {
      id: response.data.tagId,
      content: response.data.content
    };
  },
};
