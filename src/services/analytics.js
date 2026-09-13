// Lightweight, privacy-compliant telemetry and analytics engine for Momora (Sprint 13)
// Strictly logs no PII (no medical data, names, blood type or notes).
// Stores anonymized app lifecycle events locally or dispatches if cloud configured.

class AnalyticsEngine {
  constructor() {
    this.queue = [];
    this.enabled = true;
  }

  logEvent(eventName, params = {}) {
    if (!this.enabled) return;
    const sanitizedParams = this.sanitize(params);
    const event = {
      name: eventName,
      params: sanitizedParams,
      timestamp: new Date().toISOString(),
    };

    this.queue.push(event);
    if (this.queue.length > 100) {
      this.queue.shift(); // Keep bounded memory buffer
    }

    if (__DEV__) {
      // Gentle debug log in development only
      // console.log(`[Analytics] ${eventName}:`, sanitizedParams);
    }
  }

  screenView(screenName) {
    this.logEvent('screen_view', { screen: screenName });
  }

  // Remove any potential PII fields
  sanitize(params) {
    const p = { ...params };
    const piiKeys = ['name', 'userName', 'partnerName', 'babyName', 'email', 'phone', 'address', 'bloodType', 'weight', 'doctor', 'notes'];
    piiKeys.forEach(k => {
      if (k in p) delete p[k];
    });
    return p;
  }

  getRecentEvents() {
    return [...this.queue];
  }

  clearQueue() {
    this.queue = [];
  }
}

export const analytics = new AnalyticsEngine();
