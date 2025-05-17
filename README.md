# MQTT to Redis Bridge

A bridge that subscribes to MQTT topics and stores the latest messages in Redis hashes.

## Features

- Subscribes to multiple MQTT topics
- Stores messages in Redis hashes with timestamps
- Graceful shutdown handling
- Environment variable configuration
- TypeScript support

## Prerequisites

- Node.js (v14 or later)
- Redis server
- MQTT broker (e.g., Mosquitto, EMQX, etc.)

## Installation

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
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_TOPICS=topic1,topic2,topic3
MQTT_CLIENT_ID=mqtt-redis-bridge

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
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
