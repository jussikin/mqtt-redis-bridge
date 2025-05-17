import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export interface Config {
  mqtt: {
    brokerUrl: string;
    topics: string[];
    clientId: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    keyPrefix: string;
  };
  logging: {
    enabled: boolean;
  };
}

export const config: Config = {
  mqtt: {
    brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
    topics: process.env.MQTT_TOPICS?.split(',') || [],
    clientId: process.env.MQTT_CLIENT_ID || 'mqtt-redis-bridge',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'mqtt:',
  },
  logging: {
    enabled: process.env.LOGGING_ENABLED !== 'false', // enabled by default
  },
};

// Validate required configurations
if (!config.mqtt.topics.length) {
  throw new Error('MQTT_TOPICS environment variable is required');
}
