import axios from 'axios';

const client = axios.create({
  baseURL: 'https://localhost:7178/api',
});

export default client;