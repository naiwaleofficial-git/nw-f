import api from '../api/axios.js';
export const mediaUrl = (url) => url?.startsWith('/api/uploads/') ? `${api.defaults.baseURL.replace(/\/api\/?$/, '')}${url}` : url;
