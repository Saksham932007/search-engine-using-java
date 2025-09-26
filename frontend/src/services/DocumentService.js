import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

class DocumentService {
  async indexDocument(title, content, url) {
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('url', url);

      const response = await axios.post(`${API_BASE_URL}/documents`, formData);
      return response.data;
    } catch (error) {
      console.error('Index document error:', error);
      throw error;
    }
  }

  async uploadFile(file, title, url) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (title) formData.append('title', title);
      if (url) formData.append('url', url);

      const response = await axios.post(`${API_BASE_URL}/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Upload file error:', error);
      throw error;
    }
  }

  async indexFilePath(path, title, url) {
    try {
      const formData = new FormData();
      formData.append('path', path);
      if (title) formData.append('title', title);
      if (url) formData.append('url', url);

      const response = await axios.post(`${API_BASE_URL}/documents/index-path`, formData);
      return response.data;
    } catch (error) {
      console.error('Index file path error:', error);
      throw error;
    }
  }

  async indexDirectory(path, recursive = false) {
    try {
      const formData = new FormData();
      formData.append('path', path);
      formData.append('recursive', recursive);

      const response = await axios.post(`${API_BASE_URL}/documents/index-directory`, formData);
      return response.data;
    } catch (error) {
      console.error('Index directory error:', error);
      throw error;
    }
  }

  async getAllDocuments() {
    try {
      const response = await axios.get(`${API_BASE_URL}/documents`);
      return response.data;
    } catch (error) {
      console.error('Get all documents error:', error);
      throw error;
    }
  }

  async deleteDocument(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/documents/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete document error:', error);
      throw error;
    }
  }

  async reindexAllDocuments() {
    try {
      const response = await axios.post(`${API_BASE_URL}/documents/reindex`);
      return response.data;
    } catch (error) {
      console.error('Reindex all documents error:', error);
      throw error;
    }
  }

  async getDocumentStats() {
    try {
      const response = await axios.get(`${API_BASE_URL}/documents/stats`);
      return response.data;
    } catch (error) {
      console.error('Get document stats error:', error);
      throw error;
    }
  }
}

export default new DocumentService();