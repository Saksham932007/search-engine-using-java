import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

class SearchService {
  async search(query, page = 0, size = 10) {
    try {
      const response = await axios.get(`${API_BASE_URL}/search`, {
        params: {
          q: query,
          page: page,
          size: size
        }
      });
      return response.data;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  async getSearchHistory() {
    try {
      const response = await axios.get(`${API_BASE_URL}/search/history`);
      return response.data;
    } catch (error) {
      console.error('Get search history error:', error);
      throw error;
    }
  }

  async getPopularQueries(days = 7) {
    try {
      const response = await axios.get(`${API_BASE_URL}/search/popular`, {
        params: { days }
      });
      return response.data;
    } catch (error) {
      console.error('Get popular queries error:', error);
      throw error;
    }
  }

  async getAverageSearchTime(days = 7) {
    try {
      const response = await axios.get(`${API_BASE_URL}/search/stats/average-time`, {
        params: { days }
      });
      return response.data;
    } catch (error) {
      console.error('Get average search time error:', error);
      throw error;
    }
  }
}

export default new SearchService();