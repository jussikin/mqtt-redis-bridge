import { mqttClient } from './mqttClient';
import { redisClient } from './redisClient';
import { config } from './config/config';

// Handle graceful shutdown
const shutdown = async (exitCode: number = 0) => {
  if (config.logging.enabled) {
    console.log('Shutting down...');
  }
  
  try {
    await mqttClient.disconnect();
    if (config.logging.enabled) {
      console.log('Disconnected from MQTT broker');
    }
  } catch (error) {
    if (config.logging.enabled) {
      console.error('Error disconnecting from MQTT:', error);
    }
  }
  
  try {
    await redisClient.disconnect();
    if (config.logging.enabled) {
      console.log('Disconnected from Redis');
    }
  } catch (error) {
    if (config.logging.enabled) {
      console.error('Error disconnecting from Redis:', error);
    }
  }
  
  if (config.logging.enabled) {
    console.log('Cleanup completed');
  }
  process.exit(exitCode);
};

// Handle process termination
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  if (config.logging.enabled) {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  if (config.logging.enabled) {
    console.error('Uncaught Exception:', error);
  }
  shutdown(1);
});

// Initialize connections
const start = async () => {
  try {
    // Connect to Redis first
    if (config.logging.enabled) {
      console.log('Connecting to Redis...');
    }
    await redisClient.connect();
    
    // MQTT client connects automatically when instantiated
    if (config.logging.enabled) {
      console.log('MQTT to Redis bridge started successfully');
      // Log the topics being monitored
      console.log('Monitoring MQTT topics:', mqttClient.getMonitoredTopics().join(', '));
    }
    
  } catch (error) {
    if (config.logging.enabled) {
      console.error('Failed to start application:', error);
    }
    await shutdown(1);
  }
};

// Start the application
start().catch(async (error) => {
  if (config.logging.enabled) {
    console.error('Fatal error during startup:', error);
  }
  await shutdown(1);
});
