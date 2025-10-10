const cors = require("cors");

// Allow production and preview domains
const allowedOrigins = [
  "https://trading-mvp.com",
  "https://api.trading-mvp.com",
  /\.builtwithrocket\.new$/  // Allow Rocket preview domains
];

module.exports = (app) => {
  app?.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      // Check if origin is allowed
      const isAllowed = allowedOrigins?.some(allowedOrigin => {
        if (allowedOrigin instanceof RegExp) {
          return allowedOrigin?.test(origin);
        }
        return allowedOrigin === origin;
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-internal-key']
  }));
};