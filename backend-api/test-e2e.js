require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

async function runTests() {
  const phone = "+915555555555";
  
  try {
    console.log('Sending OTP...');
    await axios.post('http://localhost:3000/api/v1/auth/send-otp', { phone });
    
    const Redis = require('ioredis');
    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    
    const otp = await redis.get(`otp:${phone}`);
    console.log('Got OTP from Redis:', otp);
    
    console.log('Registering...');
    const regRes = await axios.post('http://localhost:3000/api/v1/auth/register', { phone, otp, fullName: 'Test User' });
    const token = regRes.data.accessToken;
    console.log('Got Token:', token.substring(0, 20) + '...');
    
    console.log('Testing /me...');
    const meRes = await axios.get('http://localhost:3000/api/v1/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('/me user ID:', meRes.data.id);

    console.log('Testing photo upload...');
    const dummyImgPath = path.join(__dirname, 'dummy.jpg');
    fs.writeFileSync(dummyImgPath, Buffer.from('dummy image data'));

    const form = new FormData();
    form.append('latitude', '18.5204');
    form.append('longitude', '73.8567');
    form.append('photo', fs.createReadStream(dummyImgPath));
    
    const uploadRes = await axios.post('http://localhost:3000/api/v1/citizen/complaints', form, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders()
      }
    });
    console.log('Upload response status:', uploadRes.status);
    
    console.log('Testing rate limits (sending 11 requests)...');
    let lastStatus = 0;
    for (let i = 0; i < 11; i++) {
      try {
        const f = new FormData();
        f.append('latitude', '18.5204');
        f.append('longitude', '73.8567');
        f.append('photo', fs.createReadStream(dummyImgPath));
        const r = await axios.post('http://localhost:3000/api/v1/citizen/complaints', f, {
          headers: { 'Authorization': `Bearer ${token}`, ...f.getHeaders() }
        });
        lastStatus = r.status;
      } catch (err) {
        lastStatus = err.response ? err.response.status : 500;
      }
    }
    console.log('Status of 11th request (should be 429):', lastStatus);
  } catch (error) {
    console.error('Test failed:', error.response ? error.response.data : error.message);
  }
  
  process.exit(0);
}

runTests();
