// Advanced Alerting System
const axios = require('axios');

class AlertManager {
  constructor() {
    this.channels = {
      slack: process.env.SLACK_WEBHOOK_URL,
      email: {
        username: process.env.EMAIL_USERNAME,
        password: process.env.EMAIL_PASSWORD,
        to: process.env.NOTIFICATION_EMAIL
      },
      pagerduty: process.env.PAGERDUTY_INTEGRATION_KEY,
      webhook: process.env.CUSTOM_WEBHOOK_URL
    };
    
    this.severityLevels = {
      INFO: 1,
      WARNING: 2,
      CRITICAL: 3,
      EMERGENCY: 4
    };
  }

  async sendAlert(alert) {
    const { severity, message, metric, value, threshold } = alert;
    
    // Determine which channels to notify based on severity
    const channels = this.getChannelsForSeverity(severity);
    
    // Enrich alert with context
    const enrichedAlert = {
      ...alert,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      service: 'CI/CD Pipeline',
      runId: process.env.GITHUB_RUN_ID,
      runUrl: `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    };
    
    // Send to all appropriate channels
    const promises = channels.map(channel => this.sendToChannel(channel, enrichedAlert));
    
    try {
      await Promise.all(promises);
      console.log(`✅ Alert sent successfully: ${message}`);
    } catch (error) {
      console.error(`❌ Failed to send alert: ${error.message}`);
    }
  }

  getChannelsForSeverity(severity) {
    switch (severity) {
      case 'EMERGENCY':
        return ['slack', 'email', 'pagerduty', 'webhook'];
      case 'CRITICAL':
        return ['slack', 'email', 'pagerduty'];
      case 'WARNING':
        return ['slack', 'email'];
      case 'INFO':
        return ['slack'];
      default:
        return ['slack'];
    }
  }

  async sendToChannel(channel, alert) {
    switch (channel) {
      case 'slack':
        return this.sendSlackAlert(alert);
      case 'email':
        return this.sendEmailAlert(alert);
      case 'pagerduty':
        return this.sendPagerDutyAlert(alert);
      case 'webhook':
        return this.sendWebhookAlert(alert);
    }
  }

  async sendSlackAlert(alert) {
    if (!this.channels.slack) return;

    const color = {
      INFO: '#36a64f',
      WARNING: '#ff9900',
      CRITICAL: '#ff0000',
      EMERGENCY: '#8B0000'
    }[alert.severity] || '#36a64f';

    const payload = {
      attachments: [{
        color,
        title: `🚨 ${alert.severity}: ${alert.message}`,
        fields: [
          {
            title: 'Environment',
            value: alert.environment,
            short: true
          },
          {
            title: 'Service',
            value: alert.service,
            short: true
          },
          {
            title: 'Metric',
            value: alert.metric || 'N/A',
            short: true
          },
          {
            title: 'Value',
            value: alert.value || 'N/A',
            short: true
          },
          {
            title: 'Threshold',
            value: alert.threshold || 'N/A',
            short: true
          },
          {
            title: 'Timestamp',
            value: alert.timestamp,
            short: true
          }
        ],
        actions: [{
          type: 'button',
          text: 'View Workflow Run',
          url: alert.runUrl
        }]
      }]
    };

    return axios.post(this.channels.slack, payload);
  }

  async sendEmailAlert(alert) {
    // Email implementation would go here
    // Using nodemailer or similar service
    console.log(`📧 Email alert would be sent: ${alert.message}`);
  }

  async sendPagerDutyAlert(alert) {
    if (!this.channels.pagerduty || alert.severity === 'INFO') return;

    const payload = {
      routing_key: this.channels.pagerduty,
      event_action: 'trigger',
      payload: {
        summary: alert.message,
        severity: alert.severity.toLowerCase(),
        source: alert.service,
        timestamp: alert.timestamp,
        custom_details: {
          metric: alert.metric,
          value: alert.value,
          threshold: alert.threshold,
          environment: alert.environment,
          run_url: alert.runUrl
        }
      }
    };

    return axios.post('https://events.pagerduty.com/v2/enqueue', payload);
  }

  async sendWebhookAlert(alert) {
    if (!this.channels.webhook) return;
    return axios.post(this.channels.webhook, alert);
  }

  // Predefined alert templates
  deploymentFailed(error) {
    return this.sendAlert({
      severity: 'CRITICAL',
      message: 'Deployment Failed',
      metric: 'deployment_status',
      value: 'failed',
      threshold: 'success',
      details: error
    });
  }

  performanceThresholdExceeded(metric, value, threshold) {
    return this.sendAlert({
      severity: 'WARNING',
      message: `Performance threshold exceeded: ${metric}`,
      metric,
      value: `${value}ms`,
      threshold: `${threshold}ms`
    });
  }

  securityVulnerabilityFound(vulnerability) {
    return this.sendAlert({
      severity: 'CRITICAL',
      message: `Security vulnerability detected: ${vulnerability.title}`,
      metric: 'security_scan',
      value: vulnerability.severity,
      threshold: 'none',
      details: vulnerability
    });
  }

  testSuiteFailed(testSuite, failureCount) {
    return this.sendAlert({
      severity: 'CRITICAL',
      message: `Test suite failed: ${testSuite}`,
      metric: 'test_failures',
      value: failureCount,
      threshold: '0'
    });
  }
}

module.exports = AlertManager;