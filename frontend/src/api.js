// Backend ka address. Backend ka PORT badla to yahan bhi badlo.
export const API_URL = 'http://127.0.0.1:4000/api';

async function request(path, options) {
  const res = await fetch(API_URL + path, options);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || res.statusText);
  return body;
}

export const getInfo = () => request('/info');

export const getCode = () => fetch(API_URL + '/code').then((res) => res.text());

// Button 1: seedha MongoDB
export const getReportNoCache = (city) => request(`/report/no-cache?city=${encodeURIComponent(city)}`);

// Button 2: Redis cache wala
export const getReportWithCache = (city) => request(`/report/cache?city=${encodeURIComponent(city)}`);

export const getCacheKeys = () => request('/cache/keys');

export const clearCache = () => request('/cache', { method: 'DELETE' });

export const addStudent = (city) =>
  request('/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ city }),
  });
