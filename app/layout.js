import { storage } from '@/lib/storage';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Oakstone Capital Mortgage</title>
        <meta name="description" content="Get your personalized mortgage quote instantly" />
        
        {/* Facebook/WhatsApp/LinkedIn Meta Tags */}
        <meta property="og:title" content="Oakstone Capital Mortgage" />
        <meta property="og:description" content="Your personalized mortgage quote is ready!" />
        <meta property="og:image" content="https://oakstone-calculator.vercel.app/logo.png" />
        <meta property="og:url" content="https://oakstone-calculator.vercel.app" />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Oakstone Capital Mortgage" />
        <meta name="twitter:description" content="Your personalized mortgage quote is ready!" />
        <meta name="twitter:image" content="https://oakstone-calculator.vercel.app/logo.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}