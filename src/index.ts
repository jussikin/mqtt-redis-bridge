import { mqttClient } from './mqttClient';
import { redisClient } from './redisClient';

// Handle graceful shutdown
const shutdown = async (exitCode: number = 0) => {
  console.log('Shutting down...');
  
  try {
    await mqttClient.disconnect();
    console.log('Disconnected from MQTT broker');
  } catch (error) {
    console.error('Error disconnecting from MQTT:', error);
  }
  
  try {
    await redisClient.disconnect();
    console.log('Disconnected from Redis');
  } catch (error) {
    console.error('Error disconnecting from Redis:', error);
  }
  
  console.log('Cleanup completed');
  process.exit(exitCode);
};

// Handle process termination
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  shutdown(1);
});

// Initialize connections
const start = async () => {
  try {
    // Connect to Redis first
    console.log('Connecting to Redis...');
    await redisClient.connect();
    
    // MQTT client connects automatically when instantiated
    console.log('MQTT to Redis bridge started successfully');
    
    // Log the topics being monitored
    console.log('Monitoring MQTT topics:', mqttClient.getMonitoredTopics().join(', '));
    
  } catch (error) {
    console.error('Failed to start application:', error);
    await shutdown(1);
  }
};

// Start the application
start().catch(async (error) => {
  console.error('Fatal error during startup:', error);
  await shutdown(1);
});
