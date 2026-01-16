const io = require('socket.io-client');

const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log('✅ Test client connected:', socket.id);
  
  // Join bus room
  socket.emit('join_bus_room', { busId: 'c52545a3-2003-4cae-beee-f270357899f5' });
  console.log('📡 Joined bus room');
});

socket.on('bus_location', (data) => {
  console.log('🚌 BUS_LOCATION received:', data);
});

socket.on('new_location_update', (data) => {
  console.log('📍 NEW_LOCATION_UPDATE received:', data);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected');
});

socket.on('connect_error', (error) => {
  console.error('⚠️ Connection error:', error.message);
});

// Keep alive
console.log('🔄 Listening for GPS broadcasts...');
console.log('Press Ctrl+C to exit');
