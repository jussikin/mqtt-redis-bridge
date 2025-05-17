import { createClient } from 'redis';
import { config } from './config/config';

type RedisClient = ReturnType<typeof createClient>;

export class RedisClientWrapper {
  private client: RedisClient;
  private connected: boolean = false;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 5000; // 5 seconds

  constructor() {
    const redisUrl = `redis://${config.redis.password ? `:${config.redis.password}@` : ''}${config.redis.host}:${config.redis.port}`;
    if (config.logging.enabled) {
      console.log('Connecting to Redis at:', redisUrl.replace(/:([^@]+)@/, ':***@')); // Hide password in logs
    }
    
    this.client = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > this.maxReconnectAttempts) {
            if (config.logging.enabled) {
              console.error('Max reconnection attempts reached. Giving up.');
            }
            return new Error('Max reconnection attempts reached');
          }
          const delay = Math.min(retries * 1000, this.reconnectDelay);
          if (config.logging.enabled) {
            console.log(`Attempting to reconnect to Redis in ${delay}ms (attempt ${retries + 1}/${this.maxReconnectAttempts})`);
          }
          return delay;
        },
      },
    });

    this.client.on('error', (err: Error) => {
      if (config.logging.enabled) {
        console.error('Redis Client Error:', err);
      }
      this.connected = false;
    });

    this.client.on('connect', () => {
      if (config.logging.enabled) {
        console.log('Connected to Redis');
      }
      this.connected = true;
    });

    this.client.on('reconnecting', () => {
      if (config.logging.enabled) {
        console.log('Reconnecting to Redis...');
      }
    });

    this.client.on('end', () => {
      if (config.logging.enabled) {
        console.log('Redis connection closed');
      }
      this.connected = false;
    });
  }

  async connect(): Promise<void> {
    if (!this.connected) {
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.client.quit();
      this.connected = false;
    }
  }

  async setHash(key: string, field: string, value: string): Promise<void> {
    if (!this.connected) {
      throw new Error('Redis client is not connected');
    }
    const fullKey = `${config.redis.keyPrefix}${key}`;
    await (this.client as any).hSet(fullKey, field, value);
    if (config.logging.enabled) {
      console.log(`Updated Redis hash ${fullKey} field ${field}`);
    }
  }

  async getHash(key: string, field: string): Promise<string | null> {
    if (!this.connected) {
      throw new Error('Redis client is not connected');
    }
    const fullKey = `${config.redis.keyPrefix}${key}`;
    return (this.client as any).hGet(fullKey, field);
  }

  async getAllHashFields(key: string): Promise<Record<string, string>> {
    if (!this.connected) {
      throw new Error('Redis client is not connected');
    }
    const fullKey = `${config.redis.keyPrefix}${key}`;
    return (this.client as any).hGetAll(fullKey);
  }
}

export const redisClient = new RedisClientWrapper();
