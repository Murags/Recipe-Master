import redisClient from "../utils/redis";

const cacheMiddleware = (duration) => async (req, res, next) => {
  console.log(`[Cache Middleware] Checking cache for: ${req.originalUrl || req.url}`);

  const key = `__express__${req.originalUrl || req.url}`;
  const cachedResponse = await redisClient.get(key);

  if (cachedResponse) {
    console.log(`[Cache Middleware] Cache hit for: ${key}`);
    return res.send(JSON.parse(cachedResponse));
  }

  console.log(`[Cache Middleware] Cache miss for: ${key}`);

  res.sendResponse = res.send;
  res.send = (body) => {
    console.log(`[Cache Middleware] Caching response for: ${key}`);
    redisClient.set(key, JSON.stringify(body), duration);
    res.sendResponse(body);
  };
  next();
};

export default cacheMiddleware;
