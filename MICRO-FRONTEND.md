# Micro Frontend Architecture - Resume Design

## Overview

This application implements a **Micro Frontend Architecture** with a professional **resume-inspired design**. Each module is independently developed, deployed, and can communicate through a shared event bus.

## Architecture Principles

### Micro Frontend Pattern
- **Independent Modules**: Each section (Producer, Consumer, Analytics) is a separate module
- **Isolated Functionality**: Modules don't directly depend on each other
- **Event-Driven Communication**: Pub/sub pattern via the shared API client
- **Single Responsibility**: Each module handles one core concern

### Resume Design Philosophy
- **Professional Layout**: Clean, structured like a CV/resume
- **Section-Based**: Information organized into logical sections
- **Timeline Elements**: Consumer messages displayed as experience timeline
- **Stat Cards**: Analytics shown as skills/achievements
- **Technology Badges**: Footer showcases tech stack like resume skills

## Module Structure

```
src/main/resources/static/
├── micro-frontend.html          # Main HTML shell
├── css/
│   └── resume-theme.css         # Professional resume styling
└── js/
    ├── core/
    │   └── api-client.js        # Shared API + Event Bus
    ├── modules/
    │   ├── producer.js          # Message Producer Module
    │   ├── consumer.js          # Message Consumer Module
    │   └── analytics.js         # Analytics Module
    └── shell.js                 # Container/Orchestrator
```

## Module Responsibilities

### 1. API Client (Core)
**File**: `js/core/api-client.js`

**Purpose**: Shared service layer for API calls and inter-module communication

**Features**:
- HTTP request wrapper with error handling
- Kafka producer API (`produceMessage`)
- Kafka consumer API (`getMessages`, `getMessagesWithMetadata`)
- Admin API (`clearMessages`)
- Health check endpoint
- **Pub/Sub Event Bus** for module communication

**Events Published**:
- `message-sent`: When a new message is produced
- `refresh-messages`: Trigger consumer to reload
- `messages-updated`: Consumer broadcasts message count
- `messages-cleared`: All messages deleted

### 2. Producer Module
**File**: `js/modules/producer.js`

**Purpose**: Send messages to Kafka topics

**Features**:
- Form management (message key + content)
- Message validation
- API integration with latency tracking
- Status notifications (success/error)
- Events: Publishes `message-sent` and `refresh-messages`

**UI Elements**:
- Message key input (optional)
- Message content textarea
- Send button with loading state
- Clear button
- Status display

### 3. Consumer Module
**File**: `js/modules/consumer.js`

**Purpose**: Display consumed messages in timeline format

**Features**:
- Auto-refresh every 3 seconds
- Timeline-based message display (resume-style)
- Message metadata (timestamp, key)
- Clear all messages
- Empty state handling
- Pause refresh when page hidden

**UI Elements**:
- Timeline with message items
- Refresh button
- Clear all button
- Empty state placeholder

**Events**:
- Subscribes: `refresh-messages`, `message-sent`
- Publishes: `messages-updated`, `messages-cleared`

### 4. Analytics Module
**File**: `js/modules/analytics.js`

**Purpose**: Real-time metrics and statistics

**Features**:
- Total messages counter
- Messages per minute calculation
- Average latency tracking
- Success rate monitoring
- Metrics export capability

**UI Elements**:
- 4 stat cards with animated updates:
  - Total Messages
  - Messages/Minute
  - Avg Latency
  - Success Rate

**Events**:
- Subscribes: `message-sent`, `messages-updated`, `messages-cleared`

### 5. Shell Application
**File**: `js/shell.js`

**Purpose**: Container that orchestrates all modules

**Features**:
- Module loading and registration
- Health monitoring (30-second intervals)
- Global error handling
- Deep linking support (URL parameters)
- Lifecycle management
- Application statistics

**Responsibilities**:
- Wait for all modules to load
- Start health checks
- Coordinate module lifecycle
- Handle page visibility events

## Communication Flow

### Message Sending Flow
```
User Input → Producer Module
                ↓
          API Client.produceMessage()
                ↓
          Backend /api/kafka/produce
                ↓
          Event: 'message-sent' published
                ↓
    ┌───────────┴───────────┐
    ↓                       ↓
Analytics Module      Event: 'refresh-messages'
(updates stats)              ↓
                      Consumer Module
                      (fetches new data)
```

### Data Refresh Flow
```
Consumer Auto-Refresh Timer (3s)
          ↓
API Client.getMessagesWithMetadata()
          ↓
Backend /api/kafka/messages
          ↓
Consumer renders timeline
          ↓
Event: 'messages-updated' published
          ↓
Analytics Module
(updates total count)
```

## Design System

### Color Palette (Resume Theme)
- **Primary**: `#2c3e50` - Professional dark blue
- **Secondary**: `#3498db` - Accent blue
- **Success**: `#27ae60` - Green for success states
- **Accent**: `#e74c3c` - Red for errors
- **Warning**: `#f39c12` - Orange for warnings
- **Background**: `#ecf0f1` - Light gray
- **Text**: `#2c3e50` - Dark text
- **Text Muted**: `#7f8c8d` - Secondary text

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Base Size**: 14px
- **Line Height**: 1.6

### Components

#### Stat Cards
```html
<div class="stat-card">
    <div class="stat-value" id="totalMessages">0</div>
    <div class="stat-label">Total Messages</div>
</div>
```

#### Timeline Item
```html
<div class="timeline-item">
    <div class="timeline-dot"></div>
    <div class="timeline-content">
        <div class="timeline-header">...</div>
        <div class="message-content">...</div>
    </div>
</div>
```

#### Status Message
```html
<div class="status-message success">Message sent!</div>
<div class="status-message error">Failed to send</div>
```

#### Technology Badges
```html
<span class="tech-badge">Spring Boot</span>
<span class="tech-badge">Apache Kafka</span>
```

## Event Bus API

### Subscribe to Events
```javascript
apiClient.subscribe('event-name', (data) => {
    console.log('Event received:', data);
});
```

### Publish Events
```javascript
apiClient.publish('event-name', {
    key: 'value',
    timestamp: new Date()
});
```

### Unsubscribe
```javascript
const callback = (data) => { ... };
apiClient.subscribe('event-name', callback);
// Later...
apiClient.unsubscribe('event-name', callback);
```

## Module Independence

Each module is designed to work independently:

1. **No Direct Dependencies**: Modules don't import each other
2. **Event-Driven**: All communication through event bus
3. **Graceful Degradation**: If one module fails, others continue
4. **Individual Testing**: Each can be tested in isolation
5. **Separate Deployment**: Could be split into separate files/bundles

## Getting Started

### 1. Access the Application
```
http://localhost:8080/micro-frontend.html
```

### 2. Module Loading Order
The shell ensures modules load in this sequence:
1. API Client (core dependency)
2. Producer Module
3. Consumer Module
4. Analytics Module
5. Shell Orchestrator

### 3. Developer Console
Open browser console to see module initialization:
```
📤 Producer Module: Initialized
📥 Consumer Module: Initialized
📊 Analytics Module: Initialized
🚀 Shell Application: Starting...
✅ Shell Application: Ready
```

### 4. Get Application Stats
In browser console:
```javascript
getAppStats()
```

## Deployment Options

### Current: Monolithic
All modules served from same Spring Boot application:
```
/static/micro-frontend.html
/static/js/core/api-client.js
/static/js/modules/*.js
/static/js/shell.js
```

### Future: Distributed
Modules could be deployed separately:

**Producer Micro Frontend**
```
https://producer.example.com/producer.js
```

**Consumer Micro Frontend**
```
https://consumer.example.com/consumer.js
```

**Shell Container**
```html
<script src="https://producer.example.com/producer.js"></script>
<script src="https://consumer.example.com/consumer.js"></script>
<script src="https://analytics.example.com/analytics.js"></script>
```

## Best Practices

### Module Development
1. **Start with events**: Define what events module publishes/subscribes to
2. **No global state**: Each module manages its own state
3. **Defensive coding**: Check if DOM elements exist before manipulating
4. **Error handling**: Catch and log errors, don't crash other modules
5. **Performance**: Use debouncing/throttling for frequent updates

### Styling
1. **Scoped styles**: Use specific class names (`producer-*`, `consumer-*`)
2. **CSS variables**: Use resume theme variables for consistency
3. **Responsive**: Mobile-first responsive design
4. **Animations**: Subtle transitions for professional feel
5. **Accessibility**: ARIA labels, keyboard navigation

### Testing
1. **Unit test**: Each module in isolation
2. **Integration test**: Event communication between modules
3. **E2E test**: Full user flows
4. **Performance**: Measure load times and memory usage
5. **Browser compatibility**: Test in Chrome, Firefox, Safari, Edge

## Troubleshooting

### Module Not Loading
Check console for errors. Ensure:
1. All script tags in correct order
2. API client loads before modules
3. Shell loads last
4. No JavaScript syntax errors

### Events Not Firing
1. Check subscriptions are registered before events publish
2. Verify event names match exactly (case-sensitive)
3. Use browser console to debug: `console.log(apiClient.subscribers)`

### Styling Issues
1. Ensure `resume-theme.css` is loaded
2. Check CSS path is correct: `/css/resume-theme.css`
3. Verify Google Fonts (Inter) loaded
4. Check browser DevTools for CSS conflicts

### Performance Issues
1. Check auto-refresh rate (default 3 seconds)
2. Limit message history (pagination)
3. Use browser Performance tab to profile
4. Optimize re-renders (React Virtual DOM alternative)

## Future Enhancements

- [ ] Module lazy loading (load on demand)
- [ ] WebSocket support for real-time updates
- [ ] Message filtering and search
- [ ] Export analytics reports (PDF/CSV)
- [ ] Dark mode theme toggle
- [ ] Progressive Web App (PWA) support
- [ ] Module version management
- [ ] A/B testing different module versions
- [ ] Micro frontend framework (Single-SPA, Module Federation)

## References

- [Micro Frontends Pattern](https://martinfowler.com/articles/micro-frontends.html)
- [12-Factor App Principles](../12-FACTOR-COMPLIANCE.md)
- [Angular Migration Guide](../ANGULAR_MIGRATION.md)
- [API Documentation](../README.md#api-endpoints)
