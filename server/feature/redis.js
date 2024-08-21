import redis from "ioredis";
let client = {};
const statusConnection = {
  CONNECT: "connect",
  END: "end",
  ERROR: "error",
  RECONNECT: "reconnect",
};
const REDIS_TIMEOUT = 10000,
  REDIS_CONNECT_MESSAGE = {
    code: "REDIS_CONNECT",
    message: "Redis connected",
  };
let connectionTimeout;

const handleTimeoutError = () => {
  connectionTimeout = setTimeout(() => {
    throw new Error(REDIS_CONNECT_MESSAGE);
  }, REDIS_TIMEOUT);
};

const handleEventConnection = (redisClient) => {
  redisClient.on(statusConnection.CONNECT, () => {
    console.log("Redis connected");
    clearTimeout(connectionTimeout);
  });

  redisClient.on(statusConnection.END, () => {
    console.log("Redis disconnected");
    handleTimeoutError();
  });

  redisClient.on(statusConnection.RECONNECT, () => {
    console.log("Redis reconnecting...");
    clearTimeout(connectionTimeout);
  });

  redisClient.on(statusConnection.ERROR, (error) => {
    console.log(`Redis error ${error}`);
    handleTimeoutError();
  });
};

const initRedis = async () => {
  const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.log(
            "Too many attempts to reconnect. Redis connection was terminated",
          );
          return new Error("Too many retries.");
        } else {
          return retries * 500;
        }
      },
    },
  });
  client.instanceConnect = redisClient;
  handleEventConnection(redisClient);
};

const getRedis = () => {
  return client.instanceConnect;
};
const closeRedis = () => {
  client.instanceConnect.quit();
};
const setRedisItem = async (key, value) => {
  return new Promise((resolve, reject) => {
    client.instanceConnect.set(key, JSON.stringify(value), (err) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
const getRedisItem = async (key) => {
  return new Promise((resolve, reject) => {
    client.instanceConnect.get(key, (err, result) => {
      if (result) {
        resolve({ found: true, data: JSON.parse(result) });
      } else if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve({ found: false, data: null });
      }
    });
  });
};

const deleteRedisItem = async (key) => {
  await client.instanceConnect.del(key, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Cache deleted successfully");
    }
  });
};

export {
  getRedis,
  closeRedis,
  initRedis,
  setRedisItem,
  getRedisItem,
  deleteRedisItem,
};
