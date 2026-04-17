import { io } from 'socket.io-client';
import { API_BASE } from './api';

const socket = io(API_BASE, {
  transports: ['websocket'],
  autoConnect: true,
  withCredentials: true
});

socket.on('connect_error', (err) => {
  console.error('Socket connection error:', err.message);
});

socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.warn('Socket disconnected:', reason);
});

export default socket;
