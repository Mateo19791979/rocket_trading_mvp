# Trading MVP Diagnostic Guide

## Quick Diagnostic Script

### Usage

```bash
# Make executable
chmod +x rtmvp_diagnose.sh

# Run diagnostic
./rtmvp_diagnose.sh \
  https://trading-mvp.com \
  "/unified-dashboard" \
  "/docs/whitepaper.pdf" \
  "/api/health"
```

### What it checks

1. **SPA Routing** - Deep route returns 200/304 for single-page application
2. **API Health** - Backend health endpoint responds correctly
3. **PDF Headers** - PDF files have correct Content-Type and Accept-Ranges
4. **Service Worker** - SW file is accessible for offline functionality
5. **CSP Configuration** - Content Security Policy allows PDF display

## Fix Implementation

### 1. Service Worker (Enhanced)
- Network-first strategy for HTML navigation
- No-cache policy for PDF files
- Improved error recovery

### 2. Network Recovery Service  
- Automatic retry logic with exponential backoff
- Manual connection testing
- Enhanced user feedback

### 3. Nginx Configuration
- SPA fallback routing with `try_files`
- Proper PDF MIME types and byte ranges
- CSP headers for secure PDF display
- API proxying with enhanced timeouts

### 4. React Routes Enhancement
- Better offline screen with troubleshooting tips
- Connection retry functionality
- Service Worker registration

## Troubleshooting "You're Offline" Issues

### Common Causes
1. **Stale Service Worker** - Old SW caching outdated content
2. **Network Detection** - False offline detection
3. **CSP Blocking** - Content Security Policy blocking resources
4. **API Timeouts** - Backend health checks failing

### Solutions Applied
1. **SW Cache Versioning** - `CACHE_VER` increments force updates
2. **Network-First HTML** - Prevents false "offline" from cached content  
3. **Enhanced CSP** - Allows necessary resources (frames, workers, etc.)
4. **Connection Testing** - Real connectivity validation vs. navigator.onLine
5. **User Controls** - Manual retry and refresh options

## Deployment Checklist

- [ ] Run diagnostic script on staging
- [ ] Verify Service Worker updates (`CACHE_VER` incremented)
- [ ] Test deep route navigation
- [ ] Confirm API health endpoint
- [ ] Validate PDF viewing (if applicable)
- [ ] Test offline/online transitions
- [ ] Verify CSP doesn't block functionality

## Monitoring

The enhanced implementation provides:
- Console logging for network state changes
- Retry attempt tracking
- Error reporting with specific failure reasons
- User-friendly recovery interface

Use browser DevTools → Application → Service Workers to monitor SW updates.