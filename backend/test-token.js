// Quick test script to verify Agora token generation
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
require('dotenv').config();

const appID = process.env.AGORA_APP_ID;
const appCertificate = process.env.AGORA_APP_CERTIFICATE;

console.log('\n🔍 Testing Agora Configuration...\n');

console.log('App ID:', appID ? '✅ Found' : '❌ Missing');
console.log('Certificate:', appCertificate ? '✅ Found' : '❌ Missing');

if (appID && appCertificate) {
  try {
    const channelName = 'test-channel';
    const uid = 0;
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appID,
      appCertificate,
      channelName,
      uid,
      role,
      privilegeExpiredTs
    );

    console.log('\n✅ Token generated successfully!');
    console.log('Token length:', token.length);
    console.log('First 50 chars:', token.substring(0, 50) + '...');
    console.log('\n🎉 Agora configuration is working correctly!\n');
  } catch (error) {
    console.error('\n❌ Token generation failed:', error.message);
    console.error('\nPlease check your Agora credentials.\n');
  }
} else {
  console.error('\n❌ Missing Agora credentials in .env file!\n');
  console.error('Please add:');
  console.error('AGORA_APP_ID=your_app_id');
  console.error('AGORA_APP_CERTIFICATE=your_certificate\n');
}
