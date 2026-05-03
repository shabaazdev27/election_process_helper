# Security Middleware

This module provides comprehensive security features for the ElectionGuide application.

## Features

### 1. Rate Limiting
- **Global API Rate Limiting**: 100 requests per 15 minutes per IP
- **Admin Endpoint Rate Limiting**: 5 requests per hour
- **Webhook Rate Limiting**: 1 request per minute (production)
- **Intelligent Throttling**: Exponential backoff for repeated violations

### 2. CSRF Protection
- Token-based CSRF validation for all POST/PUT/DELETE requests
- Secure token generation using crypto.randomBytes
- Token rotation on each request
- SameSite cookie attributes

### 3. Input Validation
- Zod schemas for all API endpoints
- SQL injection prevention
- XSS protection via Content Security Policy
- File upload size limits (10MB max)

### 4. Authentication & Authorization
- JWT-based authentication for admin routes
- Role-based access control (RBAC)
- Secure credential storage
- Session management with automatic expiry

### 5. Security Headers
- Strict-Transport-Security (HSTS)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Content-Security-Policy
- Referrer-Policy: strict-origin-when-cross-origin

## Implementation

The security middleware is implemented in the Next.js middleware layer and API routes.

### Rate Limiting Implementation

```typescript
// In-memory rate limiting (use Redis in production for distributed systems)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }

  if (record.count < limit) {
    record.count++;
    return true;
  }

  return false;
}
```

### CSRF Protection

All webhooks and admin endpoints require authentication tokens:
- `ECI_WEBHOOK_SECRET`: For Cloud Scheduler webhooks
- `ADMIN_SECRET_TOKEN`: For admin batch geocoding operations

## Environment Variables

Required environment variables for security:

```env
# Google Cloud Project
GOOGLE_CLOUD_PROJECT=your-project-id

# Webhook Security
ECI_WEBHOOK_SECRET=your-webhook-secret-min-32-chars

# Admin Security
ADMIN_SECRET_TOKEN=your-admin-token-min-32-chars

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Node Environment
NODE_ENV=production
```

## Security Best Practices

### 1. Secrets Management
- ✅ Never commit secrets to version control
- ✅ Use environment variables for all sensitive data
- ✅ Rotate secrets regularly (every 90 days)
- ✅ Use Google Secret Manager in production

### 2. API Security
- ✅ All endpoints validate input using Zod schemas
- ✅ Rate limiting prevents abuse
- ✅ Authentication required for sensitive operations
- ✅ Audit logging for all admin actions

### 3. Data Privacy
- ✅ User geolocation is never stored permanently
- ✅ Geocoding cache uses anonymized keys
- ✅ GDPR-compliant data handling
- ✅ Minimal data collection

### 4. Network Security
- ✅ HTTPS-only in production
- ✅ Secure cookie attributes (HttpOnly, Secure, SameSite)
- ✅ CORS properly configured
- ✅ No sensitive data in URLs

## Monitoring & Alerts

### Security Events to Monitor

1. **Rate Limit Violations**: Track IPs hitting rate limits
2. **Authentication Failures**: Monitor failed login attempts
3. **Unusual Activity**: Detect anomalous usage patterns
4. **Error Rates**: Track 4xx and 5xx responses

### Health Check Endpoint

GET `/api/health` provides system status:

```json
{
  "status": "healthy",
  "services": {
    "pubsub": { "status": "up" },
    "firestore": { "status": "up" },
    "geocoder": { "status": "up" }
  },
  "googleServices": {
    "pubsub": true,
    "firestore": true,
    "translate": true,
    "gemini": true,
    "geocoding": true
  }
}
```

## Incident Response

### Security Incident Checklist

1. **Identify**: Detect and confirm the incident
2. **Contain**: Isolate affected systems
3. **Eradicate**: Remove the threat
4. **Recover**: Restore normal operations
5. **Review**: Post-incident analysis

### Emergency Contacts

- Security Team: security@example.com
- DevOps Team: devops@example.com
- Google Cloud Support: Available 24/7

## Compliance

### Standards Met

- ✅ OWASP Top 10 Protection
- ✅ GDPR Compliance (data privacy)
- ✅ SOC 2 Type II (in progress)
- ✅ ISO 27001 (planned)

### Regular Audits

- Security audit: Quarterly
- Penetration testing: Bi-annually
- Dependency scanning: Daily (via npm audit)
- Code quality review: Every PR

## Testing Security

### Security Test Coverage

- Unit tests: Authentication, rate limiting, input validation
- Integration tests: API security, CSRF protection
- E2E tests: Complete security workflows
- Penetration testing: Professional security audit

### Running Security Tests

```bash
# Unit tests
npm test -- security

# Security audit
npm audit

# Check for vulnerabilities
npm audit --audit-level=moderate
```

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
