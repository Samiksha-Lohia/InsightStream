import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const flush = async () => {
  const connection = new IORedis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  });

  try {
    await connection.flushall();
    console.log('Successfully flushed all Redis cache keys!');
  } catch (err) {
    console.error('Failed to flush Redis:', err.message);
  } finally {
    connection.disconnect();
    process.exit(0);
  }
};

flush();
