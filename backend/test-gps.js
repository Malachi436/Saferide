const redis = require('ioredis');
const redisClient = new redis();

(async () => {
  const busId = 'c52545a3-2003-4cae-beee-f270357899f5';
  
  const locationData = {
    busId: busId,
    latitude: 5.603717,
    longitude: -0.186964,
    speed: 45,
    heading: 90,
    timestamp: new Date().toISOString()
  };
  
  await redisClient.setex(
    `bus:${busId}:location`,
    300,
    JSON.stringify(locationData)
  );
  
  console.log('✅ Test GPS location stored in Redis');
  console.log('Bus ID:', busId);
  console.log('Location:', locationData.latitude, locationData.longitude);
  console.log('\nRefresh dashboard to see bus on map!');
  
  redisClient.disconnect();
})();
