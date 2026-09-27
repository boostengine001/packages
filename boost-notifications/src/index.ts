// @boostengine/notifications — Updated Entry Point
export { BoostNotificationsManager } from './notif-manager';
export type {
  NotificationRecord, NotificationChannel, NotificationTemplate,
  NotificationRecipient, NotificationsConfig, NotificationStatus,
  WebhookRegistration, WebhookPayload, NotificationsEvents,
} from './notif-types';
export { DEFAULT_NOTIFICATIONS_CONFIG } from './notif-types';
export { notificationsAgentTools } from './notif-agent';
export type { NotificationsAgentToolName } from './notif-agent';
// Backward compat: re-export existing manager
export * from './manager';
// ponytail: manager.ts only imports the adapters, so `export *` never surfaced
// them. 1.1.0 dropped these from the public API and broke every consumer.
export { WhatsAppAdapter } from './adapters/whatsapp.adapter';
export { EmailAdapter } from './adapters/email.adapter';
export { SMSAdapter } from './adapters/sms.adapter';
