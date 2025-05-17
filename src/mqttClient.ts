import mqtt, { MqttClient, IClientOptions, ISubscriptionMap } from 'mqtt';
import { config } from './config/config';
import { redisClient } from './redisClient';

export class MQTTClient {
  private client: MqttClient;
  private connected: boolean = false;

  private options: IClientOptions;

  constructor() {
    console.log('Initializing MQTT client with broker URL:', config.mqtt.brokerUrl);
    console.log('Will subscribe to topics:', config.mqtt.topics.join(', '));
    
    this.options = {
      clientId: config.mqtt.clientId,
      clean: true,
      connectTimeout: 10000, // Increased from 4000 to 10000
      reconnectPeriod: 2000, // Increased from 1000 to 2000
      keepalive: 30, // Add keepalive
      protocolVersion: 4, // MQTT v3.1.1
      rejectUnauthorized: false, // Only set to false for testing with self-signed certs
    };

    this.client = mqtt.connect(config.mqtt.brokerUrl, this.options);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      console.log('Connected to MQTT broker');
      if (this.client.options) {
        console.log('Connection details:', {
          clientId: this.client.options.clientId,
          protocolVersion: this.client.options.protocolVersion,
          clean: this.client.options.clean,
        });
      }
      this.connected = true;
      this.subscribeToTopics();
    });

    this.client.on('message', this.handleMessage.bind(this));

    this.client.on('error', (error: Error) => {
      console.error('MQTT Error:', error);
      if ('stack' in error) {
        console.error('Error stack:', (error as Error).stack);
      }
      this.connected = false;
    });

    this.client.on('close', () => {
      console.log('MQTT connection closed');
      this.connected = false;
      // Attempt to reconnect after a delay
      console.log('Will attempt to reconnect in 5 seconds...');
      setTimeout(() => {
        console.log('Attempting to reconnect to MQTT broker...');
        // @ts-ignore - The reconnect method exists but isn't in the type definitions
        if (typeof this.client.reconnect === 'function') {
          // @ts-ignore
          this.client.reconnect();
        } else {
          // If reconnect method doesn't exist, we'll need to create a new client
          console.log('Recreating MQTT client...');
          this.client.end(true, () => {
            this.client = mqtt.connect(config.mqtt.brokerUrl, this.options);
            this.setupEventHandlers();
          });
        }
      }, 5000);
    });

    this.client.on('offline', () => {
      console.log('MQTT client is offline');
      this.connected = false;
    });

    this.client.on('reconnect', () => {
      console.log('Attempting to reconnect to MQTT broker...');
    });

    this.client.on('end', () => {
      console.log('MQTT client ended');
      this.connected = false;
    });
  }

  private subscribeToTopics(): void {
    if (!config.mqtt.topics.length) {
      console.warn('No topics to subscribe to');
      return;
    }

    // Create a subscription map with QoS 0 for all topics
    const subscriptionMap: ISubscriptionMap = {};
    config.mqtt.topics.forEach(topic => {
      subscriptionMap[topic] = { qos: 0 }; // QoS level 0
    });

    this.client.subscribe(subscriptionMap, (err, granted) => {
      if (err) {
        console.error('Subscription error:', err);
        return;
      }
      console.log('Successfully subscribed to topics:', granted.map(g => `${g.topic} (QoS: ${g.qos})`).join(', '));
    });
  }

  private async handleMessage(topic: string, message: Buffer): Promise<void> {
    try {
      const messageStr = message.toString();
      const timestamp = new Date().toISOString();
      
      // Log detailed message information
      console.log('\n--- New MQTT Message ---');
      console.log(`Topic: ${topic}`);
      console.log(`Message: ${messageStr}`);
      console.log(`Timestamp: ${timestamp}`);
      
      // Extract device ID from topic (assuming format /shellies/device-id/status)
      const topicParts = topic.split('/');
      if (topicParts.length >= 3) {
        const deviceId = topicParts[2];
        console.log(`Device ID: ${deviceId}`);
      }
      
      // Store the message in Redis hash
      await redisClient.setHash(topic, 'latest', messageStr);
      await redisClient.setHash(topic, 'timestamp', timestamp);
      
      console.log('Message processed and stored in Redis\n');
      
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      return new Promise((resolve) => {
        this.client.end(false, {}, () => {
          console.log('Disconnected from MQTT broker');
          this.connected = false;
          resolve();
        });
      });
    }
  }

  /**
   * Returns the list of topics being monitored
   */
  getMonitoredTopics(): string[] {
    return [...config.mqtt.topics];
  }
}

export const mqttClient = new MQTTClient();
