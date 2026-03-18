import client from './client';

export const getServerStatus = () => client.get('/serverstatus');