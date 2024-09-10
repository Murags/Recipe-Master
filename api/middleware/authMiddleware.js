import redisClient from "../utils/redis";

const authMiddleware = async (req, res, next) =>{
    const xToken = req.header('X-Token');

    console.log("This is the middleware")
    console.log(xToken);

    const userId = await redisClient.get(`auth_${xToken}`);

    console.log(userId)
    if (!userId) {
      res.statusCode = 401;
      return res.send({ error: 'Unauthorized' });
    }

    req.userId = userId;
    next();
}

export default authMiddleware;
