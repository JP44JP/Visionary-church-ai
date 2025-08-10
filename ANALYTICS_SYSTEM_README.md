# VisionaryChurch-ai Analytics System

## Overview

The VisionaryChurch-ai Analytics System is a comprehensive analytics and reporting platform designed specifically for church management and growth insights. It provides real-time tracking, detailed reporting, and actionable insights to help churches understand their community engagement and optimize their outreach efforts.

## Features

### 1. High-Level KPIs Dashboard
- **Total Visitors**: Track unique visitors across all touchpoints
- **Conversion Metrics**: Chat-to-visit and visit-to-member conversion rates
- **Growth Trends**: Period-over-period growth analysis
- **Member Engagement**: Comprehensive engagement scoring

### 2. Visitor Journey Analytics
- **Conversion Funnel**: Track visitors through awareness → conversion stages
- **Drop-off Analysis**: Identify where visitors leave the funnel
- **Lead Attribution**: Track visitor sources and campaign effectiveness
- **Journey Mapping**: Visual representation of visitor paths

### 3. Communication Analytics
- **Email Performance**: Delivery rates, open rates, click-through rates
- **SMS Metrics**: Message delivery and engagement tracking
- **Campaign Analysis**: Compare performance across communication channels
- **Unsubscribe Tracking**: Monitor communication preferences

### 4. Event Performance
- **Registration Tracking**: Event sign-ups and conversion rates
- **Attendance Analysis**: Show-up rates and no-show patterns
- **Popular Events**: Identify most engaging event types
- **ROI Calculation**: Cost per attendee and event profitability

### 5. Chat Widget Analytics
- **Session Metrics**: Total sessions, duration, message counts
- **Satisfaction Tracking**: User ratings and feedback analysis
- **Intent Detection**: Common questions and conversation topics
- **Conversion Analysis**: Chat sessions leading to visits/actions

### 6. Prayer Request Management Analytics
- **Request Volume**: Track prayer request trends
- **Response Times**: Team performance metrics
- **Category Analysis**: Most common prayer request types
- **Satisfaction Metrics**: Follow-up effectiveness

### 7. Real-Time Monitoring
- **Active Visitors**: Current site visitors
- **Live Chats**: Active chat sessions
- **Recent Activity**: Real-time event stream
- **System Health**: Performance monitoring

## Architecture

### Database Schema

The analytics system uses a comprehensive PostgreSQL schema with the following core tables:

- `analytics_events` - Core event tracking
- `analytics_sessions` - User session data
- `visitor_journey_stages` - Conversion funnel tracking
- `communication_analytics` - Email/SMS performance
- `chat_analytics` - Chat widget metrics
- `event_analytics` - Event performance data
- `growth_analytics` - Daily growth metrics
- `analytics_dashboard_cache` - Performance optimization

### API Endpoints

```
GET  /api/analytics/dashboard     - Main dashboard metrics
POST /api/analytics/events        - Track events (single/batch)
GET  /api/analytics/realtime      - Real-time metrics
GET  /api/analytics/reports       - Generate reports
POST /api/analytics/goals         - Create/track goals
```

### Components Structure

```
src/components/analytics/
├── AnalyticsDashboard.tsx      # Main dashboard component
├── KPICards.tsx                # High-level metrics cards
├── RealTimeWidget.tsx          # Live activity widget
├── FilterPanel.tsx             # Data filtering interface
├── ExportModal.tsx             # Data export functionality
├── CommunicationMetrics.tsx    # Email/SMS analytics
├── EventPerformance.tsx        # Event analytics
├── ChatAnalytics.tsx           # Chat widget metrics
├── GrowthTrends.tsx           # Growth visualization
└── charts/
    └── VisitorFunnelChart.tsx  # Conversion funnel
```

## Installation & Setup

### 1. Database Migration

Run the analytics database migration:

```sql
-- Execute the migration file
\i database/migrations/create_analytics_system.sql
```

### 2. Environment Variables

Add the following to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_ANALYTICS_ENABLED=true
```

### 3. Install Dependencies

The required packages are already included in `package.json`:

```bash
npm install
# or
yarn install
```

### 4. Analytics Provider Setup

Wrap your application with the AnalyticsProvider:

```tsx
import { AnalyticsProvider } from './src/providers/AnalyticsProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AnalyticsProvider 
          churchId={churchId}
          userId={userId}
          enabled={process.env.NODE_ENV === 'production'}
        >
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
```

## Usage

### Basic Event Tracking

```tsx
import { useAnalytics } from '../providers/AnalyticsProvider';

function MyComponent() {
  const analytics = useAnalytics();

  const handleVisitScheduled = () => {
    analytics.trackVisitScheduled('first_time', 'website');
  };

  const handlePrayerRequest = () => {
    analytics.trackPrayerRequest('healing', 'routine');
  };

  return (
    <div>
      <button onClick={handleVisitScheduled}>Schedule Visit</button>
      <button onClick={handlePrayerRequest}>Submit Prayer</button>
    </div>
  );
}
```

### Custom Event Tracking

```tsx
const handleCustomEvent = () => {
  analytics.trackEvent({
    event_name: 'custom_action',
    event_category: 'engagement',
    event_action: 'button_click',
    event_label: 'hero_cta',
    event_value: 1,
    custom_dimension_1: 'homepage',
    custom_dimension_2: 'above_fold'
  });
};
```

### Dashboard Integration

```tsx
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';

function AnalyticsPage() {
  return (
    <AnalyticsDashboard 
      churchId="church-uuid"
      userRole="church_admin"
    />
  );
}
```

## Key Metrics & KPIs

### Acquisition Metrics
- **Traffic Sources**: Direct, Google, Social, Email, Referral
- **Campaign Performance**: UTM tracking and attribution
- **Cost Per Acquisition**: Marketing spend efficiency
- **Channel Conversion**: Source-specific conversion rates

### Engagement Metrics
- **Page Views**: Unique and total page views
- **Session Duration**: Average time spent on site
- **Bounce Rate**: Single-page session percentage
- **Scroll Depth**: Content engagement measurement

### Conversion Metrics
- **Visitor to Chat**: Website engagement rate
- **Chat to Visit**: AI effectiveness measurement
- **Visit to Member**: Conversion success rate
- **Event Registration**: Event marketing effectiveness

### Retention Metrics
- **Return Visitor Rate**: Community building success
- **Member Activity**: Ongoing engagement measurement
- **Email Engagement**: Communication effectiveness
- **Event Attendance**: Repeat participation

## Reporting & Export

### Report Types
1. **Summary Report**: High-level KPIs and trends
2. **Detailed Report**: Comprehensive analytics breakdown
3. **Custom Report**: Filtered data based on specific criteria

### Export Formats
- **PDF**: Formatted reports with charts and visualizations
- **Excel**: Multi-sheet workbooks with raw data and calculations
- **CSV**: Raw data for external analysis
- **JSON**: Technical data format for integrations

### Automated Reports
- **Daily**: Key metrics email summary
- **Weekly**: Comprehensive performance review
- **Monthly**: Growth analysis and insights

## Performance Optimization

### Caching Strategy
- **Dashboard Cache**: 5-30 minute cache based on data freshness
- **Report Cache**: Pre-generated reports for common requests
- **Real-time Data**: No caching for live metrics

### Data Retention
- **Event Data**: 2 years (configurable)
- **Session Data**: 1 year
- **Aggregated Data**: Permanent (for historical analysis)
- **Cache Data**: Auto-cleanup of expired entries

### Database Optimization
- **Indexes**: Optimized for common query patterns
- **Partitioning**: Date-based partitioning for large tables
- **Materialized Views**: Pre-calculated common aggregations
- **Query Optimization**: Efficient analytics queries

## Security & Privacy

### Data Protection
- **Row Level Security**: Church-specific data isolation
- **Role-Based Access**: Permission-based data access
- **Data Anonymization**: PII protection in analytics
- **GDPR Compliance**: User consent and data deletion

### Access Controls
- **Church Admin**: Full analytics access
- **Staff**: Limited reporting access
- **Members**: No analytics access (by default)
- **Visitors**: Anonymized tracking only

## Monitoring & Alerts

### System Health
- **Data Quality**: Monitoring for anomalies
- **Performance**: Query execution times
- **Error Tracking**: Failed events and API calls
- **Uptime**: Service availability monitoring

### Business Alerts
- **Traffic Drops**: Significant visitor decreases
- **Conversion Issues**: Funnel performance problems
- **System Errors**: Technical issues requiring attention

## Future Enhancements

### Advanced Analytics
- **Predictive Analytics**: ML-based forecasting
- **Cohort Analysis**: User behavior over time
- **A/B Testing**: Experiment management
- **Attribution Modeling**: Multi-touch attribution

### Integrations
- **Google Analytics**: Data synchronization
- **Facebook Pixel**: Social media tracking
- **Email Platforms**: Enhanced communication analytics
- **CRM Systems**: Lead and member data integration

### Visualization
- **Interactive Charts**: Advanced data exploration
- **Custom Dashboards**: User-configurable layouts
- **Mobile App**: Native mobile analytics
- **TV Dashboard**: Big screen displays for offices

## Support & Documentation

### API Documentation
- **Swagger/OpenAPI**: Interactive API documentation
- **Code Examples**: Implementation guides
- **SDKs**: Language-specific libraries

### Troubleshooting
- **Common Issues**: FAQ and solutions
- **Debug Mode**: Enhanced logging for development
- **Support Channels**: Community and professional support

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Run database migrations
4. Set up environment variables
5. Start development server: `npm run dev`

### Code Standards
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Testing**: Unit and integration tests

### Pull Request Process
1. Create feature branch
2. Implement changes with tests
3. Update documentation
4. Submit pull request
5. Code review and approval

For questions or support, please refer to our community forums or contact the development team.