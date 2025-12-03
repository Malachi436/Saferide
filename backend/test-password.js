const bcrypt = require('bcrypt');

async function testPassword() {
  const password = 'Test@1234';
  const hash = await bcrypt.hash(password, 10);
  console.log('Generated hash:', hash);
  
  // Test if it matches
  const match = await bcrypt.compare(password, hash);
  console.log('Password matches:', match);
  
  // Test with the hash from seed
  const seedHash = '$2b$10$YoUrhM3QH7p7JTQX9J3kVOGKZN1zLqHzWQh6YqKfVGVNV0KF8TQmS';
  const matchesSeed = await bcrypt.compare(password, seedHash);
  console.log('Matches seed hash:', matchesSeed);
}

testPassword();
