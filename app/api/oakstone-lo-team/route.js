import { Redis } from '@upstash/redis';

// Initialize Redis with the correct environment variables
const redis = new Redis({
  url: process.env.OAKSTONE_KV_REST_API_URL,
  token: process.env.OAKSTONE_KV_REST_API_TOKEN,
});

export async function GET() {
  try {
    console.log('🔍 Fetching team from Redis...');
    console.log('URL:', process.env.OAKSTONE_KV_REST_API_URL ? '✅ Found' : '❌ Missing');
    console.log('Token:', process.env.OAKSTONE_KV_REST_API_TOKEN ? '✅ Found' : '❌ Missing');
    
    const team = await redis.get('oakstone-lo-team');
    console.log('✅ Team fetched:', team);
    
    return new Response(JSON.stringify(team || []), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ GET error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  try {
    const team = await request.json();
    console.log('💾 Saving team to Redis:', team);
    
    await redis.set('oakstone-lo-team', team);
    console.log('✅ Team saved successfully');
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ POST error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}