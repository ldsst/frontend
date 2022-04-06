import io from 'socket.io-client';
import { socketHost } from '../config';

const socket = io(socketHost);

export default socket;