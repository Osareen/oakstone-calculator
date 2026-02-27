export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Get parameters with defaults
  const name = searchParams.get('name') || 'a client';
  const savings = searchParams.get('savings') || '280';
  
  // Build the redirect URL with ALL parameters (including view=client)
  const redirectUrl = `/?${searchParams.toString()}`;
  
  // Create the full URL for meta tags
  const fullUrl = `https://oakstone-calculator.vercel.app${redirectUrl}`;
  const imageUrl = `https://oakstone-calculator.vercel.app/og-image.png`;
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Oakstone Capital Mortgage - Quote for ${name}</title>
  
  <!-- Basic Meta Tags -->
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${name}, your personalized mortgage quote shows $${savings}/month savings!">
  
  <!-- Facebook/WhatsApp/LinkedIn Meta Tags (Open Graph) -->
  <meta property="og:title" content="Your Mortgage Quote from Oakstone Capital">
  <meta property="og:description" content="${name}, your personalized quote shows $${savings}/month savings! Click to view your full breakdown.">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:url" content="${fullUrl}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Oakstone Capital Mortgage">
  
  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Your Mortgage Quote from Oakstone Capital">
  <meta name="twitter:description" content="${name}, your personalized quote shows $${savings}/month savings!">
  <meta name="twitter:image" content="${imageUrl}">
  
  <!-- Redirect after 1 second (barely noticeable) -->
  <meta http-equiv="refresh" content="1;url=${redirectUrl}">
  
  <!-- Optional: Add some simple styling for the redirect page -->
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      text-align: center;
    }
    .container {
      max-width: 600px;
      padding: 2rem;
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: #4ade80;
    }
    p {
      font-size: 1.2rem;
      line-height: 1.6;
      color: #d1d5db;
    }
    .savings {
      font-size: 2.5rem;
      font-weight: bold;
      color: #4ade80;
      margin: 1.5rem 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>💰 Your Quote is Ready!</h1>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your personalized mortgage quote shows:</p>
    <div class="savings">$${savings}/month savings</div>
    <p>Redirecting you to your full breakdown...</p>
  </div>
</body>
</html>`;
  
  return new Response(html, {
    headers: { 
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    },
  });
}