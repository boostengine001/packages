import { IWhatsAppAdapter, normalizePhoneNumber, safeFetchJson } from '../base';
import { UniversalResult, WhatsAppConfig, WhatsAppSendOptions, InboundWebhookEvent, DeliveryStatus } from '../../types';
import {
  InteraktTrackUserOptions,
  InteraktTrackEventOptions,
  InteraktCampaignOptions,
  InteraktTemplateCreateOptions,
  InteraktChatAssignmentOptions,
  InteraktSendMediaOptions,
  InteraktSendTemplateOptions
} from '../../types/interakt';

export class InteraktWhatsAppAdapter implements IWhatsAppAdapter {
  public providerName = 'interakt';
  private apiKey: string;
  private baseUrl = 'https://api.interakt.ai/v1/public';

  constructor(config: WhatsAppConfig) {
    this.apiKey = config.apiKey;
  }

  private async makeRequest(endpoint: string, method: string, payload?: any, queryParams?: Record<string, any>): Promise<any> {
    let url = `${this.baseUrl}${endpoint}`;
    if (queryParams) {
      const q = new URLSearchParams();
      Object.entries(queryParams).forEach(([k, v]) => {
        if (v !== undefined) q.append(k, String(v));
      });
      url += `?${q.toString()}`;
    }

    const options: any = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.apiKey.startsWith('Basic ') ? this.apiKey : `Basic ${this.apiKey}`,
      }
    };

    if (payload) {
      options.body = JSON.stringify(payload);
    }

    return safeFetchJson(url, options);
  }

  public async send(options: WhatsAppSendOptions): Promise<UniversalResult> {
    const { countryCode, national } = normalizePhoneNumber(options.to);

    const body: any = {
      countryCode,
      phoneNumber: national,
      callbackData: 'boost_comms_alert',
      type: options.templateName ? 'Template' : 'Text',
    };

    if (options.templateName) {
      const traitValues = options.variables ? Object.values(options.variables).map(String) : [];
      
      const templateObj: any = {
        name: options.templateName,
        languageCode: options.language || 'en',
        bodyValues: traitValues,
      };

      if (options.mediaUrl) {
        templateObj.headerValues = [options.mediaUrl];
      }

      if (options.buttons && options.buttons.length > 0) {
        const buttonValuesObj: Record<string, string[]> = {};
        options.buttons.forEach((btn, idx) => {
          if (btn.value) {
            buttonValuesObj[String(idx)] = [btn.value];
          }
        });
        templateObj.buttonValues = buttonValuesObj;
      }

      body.template = templateObj;
    } else {
      body.message = options.message || '';
    }

    const res = await this.makeRequest('/message/', 'POST', body);
    const isSuccess = res.ok && (res.data?.result === true || !!res.data?.id);

    return {
      success: isSuccess,
      channel: 'whatsapp',
      provider: this.providerName,
      messageId: res.data?.id || res.data?.data?.id,
      error: isSuccess ? undefined : res.data?.message || res.rawText || 'Interakt delivery failure',
      raw: res.data,
    };
  }

  // --- Track APIs ---
  /**
   * Interakt User Track API
   * POST https://api.interakt.ai/v1/public/track/users/
   * Creates or updates user details, traits (attributes), and tags in Interakt.
   */
  public async trackUser(options: InteraktTrackUserOptions): Promise<any> {
    const payload: any = {};

    const phoneInput = options.phone || options.fullPhoneNumber || options.phoneNumber;
    if (phoneInput) {
      const defaultCode = options.countryCode ? options.countryCode.replace('+', '') : '91';
      const norm = normalizePhoneNumber(phoneInput, defaultCode);
      payload.countryCode = options.countryCode || norm.countryCode;
      payload.phoneNumber = norm.national;
    } else {
      if (options.countryCode) payload.countryCode = options.countryCode;
      if (options.phoneNumber) payload.phoneNumber = options.phoneNumber;
    }

    if (options.userId) payload.userId = options.userId;
    if (options.traits) payload.traits = options.traits;
    if (options.tags && options.tags.length > 0) payload.tags = options.tags;
    if (options.createdAt) payload.createdAt = options.createdAt;
    if (options.add_to_sales_cycle !== undefined) payload.add_to_sales_cycle = options.add_to_sales_cycle;

    const res = await this.makeRequest('/track/users/', 'POST', payload);
    const isSuccess = res.ok && (res.data?.result === true || res.data?.id || res.status === 200 || res.status === 201);

    if (!isSuccess) {
      return {
        result: false,
        message: res.data?.message || res.rawText || 'Interakt User Track API failed',
        status: res.status,
        raw: res.data,
      };
    }

    return res.data;
  }

  /**
   * Interakt Event Track API
   * POST https://api.interakt.ai/v1/public/track/events/
   * Logs specific user actions/events with traits to trigger automated WhatsApp campaigns.
   */
  public async trackEvent(options: InteraktTrackEventOptions): Promise<any> {
    const payload: any = {
      event: options.event,
    };

    const phoneInput = options.phone || options.fullPhoneNumber || options.phoneNumber;
    if (phoneInput) {
      const defaultCode = options.countryCode ? options.countryCode.replace('+', '') : '91';
      const norm = normalizePhoneNumber(phoneInput, defaultCode);
      payload.countryCode = options.countryCode || norm.countryCode;
      payload.phoneNumber = norm.national;
    } else {
      if (options.countryCode) payload.countryCode = options.countryCode;
      if (options.phoneNumber) payload.phoneNumber = options.phoneNumber;
    }

    if (options.userId) payload.userId = options.userId;
    if (options.traits) payload.traits = options.traits;
    if (options.createdAt) payload.createdAt = options.createdAt;

    const res = await this.makeRequest('/track/events/', 'POST', payload);
    const isSuccess = res.ok && (res.data?.result === true || res.data?.id || res.status === 200 || res.status === 201);

    if (!isSuccess) {
      return {
        result: false,
        message: res.data?.message || res.rawText || 'Interakt Event Track API failed',
        status: res.status,
        raw: res.data,
      };
    }

    return res.data;
  }

  // --- Campaign APIs ---
  public async createCampaign(options: InteraktCampaignOptions): Promise<any> {
    const res = await this.makeRequest('/create-campaign/', 'POST', options);
    return res.data;
  }

  // --- Customer APIs ---
  public async getUsersBulk(offset: number = 0, limit: number = 100, filters?: any): Promise<any> {
    const res = await this.makeRequest('/apis/users/', 'POST', { filters }, { offset, limit });
    return res.data;
  }

  public async getUserByPhone(phoneNumber: string): Promise<any> {
    const res = await this.makeRequest(`/apis/users/phone_number/${phoneNumber}`, 'GET');
    return res.data;
  }

  public async getUserById(userId: string): Promise<any> {
    const res = await this.makeRequest(`/apis/users/id/${userId}`, 'GET');
    return res.data;
  }

  // --- Advanced Send Message APIs ---
  public async sendMediaMessage(options: InteraktSendMediaOptions): Promise<any> {
    const res = await this.makeRequest('/message/', 'POST', options);
    return res.data;
  }

  public async sendTemplateMessage(options: InteraktSendTemplateOptions): Promise<any> {
    const res = await this.makeRequest('/message/', 'POST', options);
    return res.data;
  }

  // --- Create Template APIs ---
  public async createTemplate(options: InteraktTemplateCreateOptions): Promise<any> {
    const res = await this.makeRequest('/track/templates/', 'POST', options);
    return res.data;
  }

  public async getAllTemplates(queryParams?: Record<string, string | number>): Promise<any> {
    const res = await this.makeRequest('/track/organization/templates', 'GET', undefined, queryParams);
    return res.data;
  }

  // --- Chat Assignment APIs ---
  public async assignChat(options: InteraktChatAssignmentOptions): Promise<any> {
    const res = await this.makeRequest('/assignment/', 'POST', options);
    return res.data;
  }

  public parseWebhook(payload: any, headers?: Record<string, string>): InboundWebhookEvent | null {
    if (!payload || !payload.type) return null;

    const eventType = payload.type;
    const msgId = payload.data?.message?.id;
    const phone = payload.data?.customer?.phone_number;

    if (eventType.startsWith('message_')) {
      let status: DeliveryStatus | undefined;
      
      switch (eventType) {
        case 'message_sent': status = 'sent'; break;
        case 'message_delivered': status = 'delivered'; break;
        case 'message_read': status = 'read'; break;
        case 'message_failed': status = 'failed'; break;
      }

      if (status) {
        return {
          channel: 'whatsapp',
          provider: this.providerName,
          type: 'delivery_receipt',
          messageId: msgId,
          status,
          to: phone ? `+${phone}` : undefined,
          timestamp: new Date().toISOString(),
          raw: payload,
        };
      } else if (eventType === 'message_received') {
        return {
          channel: 'whatsapp',
          provider: this.providerName,
          type: 'incoming_message',
          messageId: msgId,
          from: phone ? `+${phone}` : undefined,
          content: payload.data?.message?.text || payload.data?.message?.message?.text,
          timestamp: new Date().toISOString(),
          raw: payload,
        };
      }
    }
    
    return null;
  }
}
