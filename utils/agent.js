import axios from 'axios';
import { changeLoginStatus } from '../actions/auth';
import { configureStore } from '../store/index';
import Router from 'next/router';

const store = configureStore();

// Add a response interceptor
axios.interceptors.response.use((response) => {
  return response.data;
}, (error) => {
  if(error.response.data.error === 'Forbidden') {
    window.location = '/login';
    localStorage.clear();
    store.dispatch(changeLoginStatus(false));
  }
  return Promise.reject(error);
});

// Add a request interceptor
axios.interceptors.request.use((config) => {
  return {
    ...config,
    headers: {
      ...config.headers,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`
    }
  };
}, (error) => {
  return Promise.reject(error);
});

export const get = (url) => axios({
  method: 'get',
  url,
});

export const post = (url, data) => axios({
  method: 'post',
  data,
  url,
});

export const put = (url, data) => axios({
  method: 'put',
  data,
  url,
});

export const del = (url) => axios({
  method: 'delete',
  url,
});
