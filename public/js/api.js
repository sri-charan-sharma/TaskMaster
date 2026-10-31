/**
 * TaskMaster API Client
 * Clean REST fetch wrapper with robust error handling
 */

const API = {
  baseUrl: '/api',

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.error || `HTTP error ${response.status}`);
        error.data = data;
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`API request failed [${options.method || 'GET'} ${url}]:`, error);
      throw error;
    }
  },

  // Projects
  async getProjects() {
    return this.request('/projects');
  },

  async createProject(projectData) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData)
    });
  },

  async deleteProject(id) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE'
    });
  },

  // Tasks
  async getTasks(params = {}) {
    const query = new URLSearchParams();
    if (params.project_id && params.project_id !== 'all') query.append('project_id', params.project_id);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.category_id && params.category_id !== 'all') query.append('category_id', params.category_id);
    if (params.priority && params.priority !== 'all') query.append('priority', params.priority);
    if (params.search) query.append('search', params.search);
    if (params.sort) query.append('sort', params.sort);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/tasks${qs}`);
  },

  async getTask(id) {
    return this.request(`/tasks/${id}`);
  },

  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  },

  async updateTaskStatus(id, status) {
    return this.request(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  async updateTask(id, updates) {
    return this.request(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  async deleteTask(id) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE'
    });
  },

  // Categories
  async getCategories() {
    return this.request('/categories');
  },

  async createCategory(catData) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(catData)
    });
  },

  async deleteCategory(id) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE'
    });
  },

  // Analytics Stats
  async getStats() {
    return this.request('/stats');
  }
};
