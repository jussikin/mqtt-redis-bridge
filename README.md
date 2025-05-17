# MQTT to Redis Bridge

A bridge that subscribes to MQTT topics and stores the latest messages in Redis hashes.

## Features

- Subscribes to multiple MQTT topics
- Stores MQTT messages in Redis hashes with configurable key prefixes
- Handles reconnection logic for both MQTT and Redis
- Graceful shutdown handling
- Environment variable configuration
- TypeScript support
- Containerized with Docker for easy deployment

## Prerequisites

- Docker and Docker Compose (recommended)
- Or Node.js (v14 or later) for development
- Redis server
- MQTT broker (e.g., Mosquitto, EMQX, etc.)

## Running with Docker Compose (Recommended)

The easiest way to run the bridge is using Docker Compose:

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd mqtt-redis-bridge
   ```

2. Copy the example environment file and update it with your configuration:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file with your MQTT broker details. For local development with the included Redis container, you can keep the default Redis settings.

4. Start the services:
   ```bash
   docker-compose up -d
   ```

This will start:
- The MQTT-Redis bridge
- A Redis server

## Manual Installation (without Docker)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd mqtt-redis-bridge
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the example environment file and update it with your configuration:
   ```bash
   cp .env.example .env
   ```

4. Edit the `.env` file with your MQTT broker and Redis server details.

## Configuration

Edit the `.env` file with your configuration:

```env
# MQTT Configuration
MQTT_BROKER_URL=mqtt://your-mqtt-broker:1883
MQTT_TOPICS=your/topic/1,your/topic/2
MQTT_CLIENT_ID=mqtt-redis-bridge

# Redis Configuration
REDIS_HOST=redis  # Use 'redis' when using Docker Compose, 'localhost' otherwise
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password  # Optional
REDIS_KEY_PREFIX=mqtt:  # Optional, default is 'mqtt:'
```

### Docker-Specific Configuration

When running with Docker Compose, the following defaults are used if not overridden:
- Redis is available at `redis:6379`
- The MQTT broker should be accessible from within the container (use `host.docker.internal` for localhost on macOS/Windows)

To use a local MQTT broker on the host machine, you can set:
```env
MQTT_BROKER_URL=mqtt://host.docker.internal:1883
```

## Building the Docker Image

To build the Docker image manually:

```bash
docker build -t mqtt-redis-bridge .
```

## Running the Container Directly

To run the built container without Docker Compose:

```bash
docker run -d \
  --name mqtt-redis-bridge \
  --network host \
  -e MQTT_BROKER_URL=mqtt://your-broker:1883 \
  -e MQTT_TOPICS=your/topic \
  -e REDIS_HOST=localhost \
  -e REDIS_PASSWORD=your-password \
  mqtt-redis-bridge
```

## Development

For development, you can run the application directly:

```bash
npm install
npm run dev
```

## Building for Production

```bash
npm run build
npm start
```

## License

MIT
REDIS_PASSWORD=
REDIS_KEY_PREFIX=mqtt:
```

## Running the Bridge

### Development Mode

```bash
npm run dev
```

### Production Mode

1. Build the TypeScript code:
   ```bash
   npm run build
   ```

2. Start the application:
   ```bash
   npm start
   ```

## Redis Data Structure

The bridge stores data in Redis hashes with the following structure:

- Key: `{REDIS_KEY_PREFIX}{topic}`
- Fields:
  - `latest`: The most recent message received on the topic
  - `timestamp`: ISO timestamp of when the message was received

## Example

1. Start the bridge:
   ```bash
   npm run dev
   ```

2. Publish a message to an MQTT topic:
   ```bash
   mosquitto_pub -h localhost -t "your/topic" -m "Hello, Redis!"
   ```

3. Check the data in Redis:
   ```bash
   redis-cli HGETALL mqtt:your/topic
   ```

## License

MIT
