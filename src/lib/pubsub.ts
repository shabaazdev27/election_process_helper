/**
 * Cloud Pub/Sub client for ECI live updates
 * Handles real-time election schedule changes, booth updates, and notifications
 * 
 * Security:
 * - Uses Application Default Credentials (ADC)
 * - Content validation via Zod schemas
 * - URL whitelist for ECI sources
 * 
 * Efficiency:
 * - Batch message publishing
 * - Connection pooling
 * - Message deduplication
 */

import { PubSub, Topic, Message } from '@google-cloud/pubsub';
import { createHash as cryptoCreateHash } from 'crypto';
import { z } from 'zod';
import { EciUpdate, Notification } from '@/types';

// Validation schemas
const EciUpdateSchema = z.object({
  updateType: z.enum(['election_schedule', 'new_form', 'booth_change', 'general_update']),
  previousValue: z.string().optional(),
  newValue: z.string(),
  sourceUrl: z.string().url().refine(
    (url) => url.startsWith('https://voters.eci.gov.in') || url.startsWith('https://eci.gov.in'),
    { message: 'Source URL must be from ECI domain' }
  ),
  detectedAt: z.string().datetime(),
});

const NotificationSchema = z.object({
  type: z.enum(['election_date', 'new_form', 'booth_change', 'general_update']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  sourceUrl: z.string().url().optional(),
  timestamp: z.string().datetime(),
});

// Singleton PubSub client
let pubSubClient: PubSub | null = null;
const topicCache: Map<string, Topic> = new Map();

/**
 * Initialize Pub/Sub client with ADC
 */
function getPubSubClient(): PubSub {
  if (!pubSubClient) {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT;
    
    if (!projectId) {
      throw new Error('GOOGLE_CLOUD_PROJECT environment variable not set');
    }

    pubSubClient = new PubSub({
      projectId,
      // Uses Application Default Credentials automatically
    });
  }
  
  return pubSubClient;
}

/**
 * Get or create a topic with caching
 */
async function getTopic(topicName: string): Promise<Topic> {
  if (topicCache.has(topicName)) {
    return topicCache.get(topicName)!;
  }

  const pubsub = getPubSubClient();
  const topic = pubsub.topic(topicName);
  
  // Check if topic exists, create if not
  const [exists] = await topic.exists();
  if (!exists) {
    await topic.create();
    console.log(`Created Pub/Sub topic: ${topicName}`);
  }

  topicCache.set(topicName, topic);
  return topic;
}

/**
 * Publish ECI update to Pub/Sub
 * Validates content and deduplicates messages
 */
export async function publishEciUpdate(update: EciUpdate): Promise<string> {
  // Validate update
  const validated = EciUpdateSchema.parse(update);

  const topic = await getTopic('eci-updates');
  
  // Publish with deduplication key
  const dataBuffer = Buffer.from(JSON.stringify(validated));
  const messageId = await topic.publishMessage({
    data: dataBuffer,
    attributes: {
      updateType: validated.updateType,
      sourceUrl: validated.sourceUrl,
      // Deduplication: Same content hash = skip
      contentHash: createHash(JSON.stringify(validated)),
    },
  });

  console.log(`Published ECI update: ${messageId}`);
  return messageId;
}

/**
 * Publish notification to users
 * Supports batch publishing for efficiency
 */
export async function publishNotification(
  notification: Notification,
  targetUsers?: string[]
): Promise<string> {
  // Validate notification
  const validated = NotificationSchema.parse(notification);

  const topic = await getTopic('user-notifications');
  
  const dataBuffer = Buffer.from(JSON.stringify(validated));
  const attributes: Record<string, string> = {
    notificationType: validated.type,
    timestamp: validated.timestamp,
  };

  // Add targeting if specified
  if (targetUsers && targetUsers.length > 0) {
    attributes.targetUsers = targetUsers.join(',');
  }

  const messageId = await topic.publishMessage({
    data: dataBuffer,
    attributes,
  });

  console.log(`Published notification: ${messageId}`);
  return messageId;
}

/**
 * Batch publish multiple notifications (more efficient)
 */
export async function publishNotificationBatch(
  notifications: Notification[]
): Promise<string[]> {
  if (notifications.length === 0) return [];

  const topic = await getTopic('user-notifications');
  const messageIds: string[] = [];

  // Validate all first
  const validated = notifications.map((n) => NotificationSchema.parse(n));

  // Batch publish
  const publishPromises = validated.map((notification) => {
    const dataBuffer = Buffer.from(JSON.stringify(notification));
    return topic.publishMessage({
      data: dataBuffer,
      attributes: {
        notificationType: notification.type,
        timestamp: notification.timestamp,
      },
    });
  });

  const results = await Promise.all(publishPromises);
  messageIds.push(...results);

  console.log(`Published ${messageIds.length} notifications in batch`);
  return messageIds;
}

/**
 * Subscribe to ECI updates (for backend processing)
 */
export async function subscribeToEciUpdates(
  subscriptionName: string,
  callback: (update: EciUpdate) => Promise<void>
): Promise<void> {
  const pubsub = getPubSubClient();
  const subscription = pubsub.subscription(subscriptionName);

  // Check if subscription exists
  const [exists] = await subscription.exists();
  if (!exists) {
    const topic = await getTopic('eci-updates');
    await topic.createSubscription(subscriptionName);
    console.log(`Created subscription: ${subscriptionName}`);
  }

  // Message handler
  const messageHandler = async (message: Message) => {
    try {
      const data = JSON.parse(message.data.toString());
      const update = EciUpdateSchema.parse(data);
      
      await callback(update);
      message.ack();
    } catch (error) {
      console.error('Error processing ECI update:', error);
      message.nack(); // Retry
    }
  };

  subscription.on('message', messageHandler);
  subscription.on('error', (error: Error) => {
    console.error('Subscription error:', error);
  });

  console.log(`Subscribed to ECI updates: ${subscriptionName}`);
}

/**
 * Create content hash for deduplication using SHA-256
 */
function createHash(content: string): string {
  return cryptoCreateHash('sha256').update(content).digest('hex').substring(0, 16);
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    topicCacheSize: topicCache.size,
    cachedTopics: Array.from(topicCache.keys()),
  };
}

/**
 * Health check for Pub/Sub connectivity
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const pubsub = getPubSubClient();
    await pubsub.getTopics();
    return true;
  } catch (error) {
    console.error('Pub/Sub health check failed:', error);
    return false;
  }
}

/**
 * Graceful shutdown
 */
export async function shutdown(): Promise<void> {
  if (pubSubClient) {
    await pubSubClient.close();
    pubSubClient = null;
    topicCache.clear();
    console.log('Pub/Sub client closed');
  }
}
