# VisionaryChurch.ai - AI-Powered Church Visitor Management

A comprehensive SaaS platform that helps churches engage, nurture, and convert visitors using AI-powered chat widgets, smart visit planning, and data-driven insights.

## 🚀 Features

- **AI Chat Widget**: 24/7 intelligent conversations with visitors
- **Smart Visit Planning**: Convert conversations into scheduled visits
- **Analytics Dashboard**: Track engagement, conversions, and growth
- **Multi-tenant Architecture**: Supports multiple churches
- **Real-time Notifications**: Instant alerts for new visitors and activities
- **Mobile-responsive**: Works perfectly on all devices

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **AI/ML**: OpenAI GPT-4
- **Styling**: Tailwind CSS, Framer Motion
- **Deployment**: Vercel

## 🏗 Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── admin/             # Admin panel
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── landing/          # Landing page components
│   ├── chat/             # Chat widget components
│   ├── dashboard/        # Dashboard components
│   └── admin/            # Admin components
├── lib/                  # Utilities and configurations
├── types/                # TypeScript type definitions
├── contexts/             # React contexts
└── hooks/                # Custom React hooks
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/visionarychurch-ai.git
   cd visionarychurch-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `NEXTAUTH_SECRET`: A random secret for NextAuth

4. **Set up the database**
   - Create a new Supabase project
   - Run the SQL migrations from `database-setup.sql`
   - Enable Row Level Security (RLS) policies

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄 Database Setup

The application uses Supabase (PostgreSQL) with the following main tables:

- `churches` - Church information and settings
- `users` - User accounts and profiles  
- `visitors` - Visitor information and contact details
- `visits` - Scheduled visits and appointments
- `chat_sessions` - AI chat conversations and history

Run the provided SQL schema in your Supabase SQL editor to set up the database.

## 🔧 Configuration

### Church Settings

Each church can customize:
- AI personality and responses
- Brand colors and logo
- Welcome messages
- Feature toggles (visit scheduling, prayer requests, etc.)
- Notification preferences

### AI Configuration

The AI chat system supports:
- Custom training data per church
- Intent recognition for visitor questions
- Automatic visit scheduling suggestions
- Multi-language support
- Contextual responses based on church information

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your GitHub repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on git push**

### Manual Deployment

```bash
npm run build
npm start
```

## 📱 API Documentation

### Chat API

```typescript
POST /api/chat
{
  "message": "I'd like to visit your church",
  "churchSlug": "grace-community", 
  "sessionId": "optional-session-id"
}
```

### Visits API

```typescript
GET /api/visits?churchId=xxx
POST /api/visits
PUT /api/visits/:id
```

### Analytics API

```typescript
GET /api/analytics/:churchId
GET /api/analytics/:churchId/visitors
GET /api/analytics/:churchId/conversions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Development Roadmap

- [ ] Advanced AI training capabilities
- [ ] SMS notifications integration
- [ ] Calendar integrations (Google, Outlook)
- [ ] Email campaign automation
- [ ] Mobile app for church staff
- [ ] WhatsApp integration
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] White-label solution

## 🐛 Bug Reports

If you discover a bug, please create an issue on GitHub with:
- Bug description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser/device information

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@visionarychurch.ai
- 💬 Discord: [Join our community](https://discord.gg/visionarychurch)
- 📚 Documentation: [docs.visionarychurch.ai](https://docs.visionarychurch.ai)

---

Built with ❤️ for churches worldwide by the VisionaryChurch.ai team