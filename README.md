# Airtask - AI-Powered Conversational Flow Platform

Airtask is a comprehensive AI-powered platform that enables businesses to create, manage, and deploy intelligent conversational agents for sales, support, and lead generation. The platform combines advanced AI capabilities with telephony integration, web widgets, and comprehensive management tools.


https://github.com/user-attachments/assets/df7b44e0-07d0-46b9-a51d-a4bc66f882eb

## 🏗️ Project Architecture

This is a **monorepo** built with **Nx** that contains multiple interconnected applications and packages:

### Applications (`/apps`)

#### 🔌 **API** (`apps/api`)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Architecture**: GraphQL APIs (Public, Private, Admin)
- **Key Features**:
  - AI-powered conversation flows with script adherence
  - Real-time telephony integration via Twilio
  - Advanced queue management with Bull/BullMQ and Redis
  - Multi-tenant architecture with role-based permissions
  - WebSocket support for real-time interactions
  - Comprehensive testing suite (unit, integration, e2e)

#### 🖥️ **App** (`apps/app`)
- **Framework**: Next.js 14 with TypeScript
- **UI**: Radix UI components with Tailwind CSS
- **Features**:
  - Multi-language support (i18n) with next-intl
  - Dark/Light theme support
  - Comprehensive dashboard for flow management
  - Real-time conversation monitoring
  - Advanced data visualization with Recharts
  - Drag-and-drop interfaces with @hello-pangea/dnd

#### 🎯 **Widget** (`apps/widget`)
- **Framework**: Next.js with TypeScript
- **Purpose**: Embeddable conversational widget for websites
- **Features**:
  - Customizable appearance and theming
  - Real-time AI conversations
  - Multi-language support
  - Responsive design for all devices

#### 📞 **Caller** (`apps/caller`)
- **Framework**: NestJS
- **Purpose**: Dedicated microservice for handling outbound calls
- **Integration**: Works with the main API for call orchestration

#### 📧 **Emails** (`apps/emails`)
- **Framework**: React Email
- **Purpose**: Email template management and rendering
- **Features**: Internationalization support for email templates

#### 🌐 **Redirecter** (`apps/redirecter`)
- **Platform**: Vercel Edge Functions
- **Purpose**: URL redirection service

#### 📊 **Directus** (`apps/directus`)
- **Platform**: Directus CMS
- **Purpose**: Content management and admin interface
- **Features**: Custom extensions and schema management

### Packages (`/packages`)

#### 🎨 **Core** (`packages/core`)
- Shared React components and utilities
- Typography and design system foundations

#### 🎭 **Animations** (`packages/animations`)
- Lottie-based animation components
- Color manipulation utilities with TinyColor2

#### 🎪 **Widget Design** (`packages/widget-design`)
- Complete widget UI component library
- Tailwind CSS styling with Radix UI components
- Form handling with React Hook Form and validation

#### 📜 **Widget Script** (`packages/widget-script`)
- Rollup-bundled widget embedding script
- Minimal footprint for website integration

#### 🔧 **Shared** (`packages/shared`)
- Common TypeScript utilities and types
- Shared across all applications

#### 🎯 **ESLint Config** (`packages/eslint-config`)
- Centralized ESLint configuration
- TypeScript, React, and Next.js rules

## 🚀 Key Technologies & Integrations

### Backend Technologies
- **NestJS**: Modern Node.js framework with decorators and dependency injection
- **Prisma**: Type-safe database ORM with PostgreSQL
- **GraphQL**: API layer with Apollo Server
- **Bull/BullMQ**: Advanced job queue management with Redis
- **WebSockets**: Real-time communication
- **Discord.js**: Discord bot integration for notifications

### AI & ML Stack
- **OpenAI**: GPT models for conversation generation
- **LangChain**: AI application framework with LangSmith tracing
- **Google Gemini**: Alternative AI model support
- **Pinecone**: Vector database for knowledge management
- **Microsoft Cognitive Services**: Speech recognition and synthesis

### Communication & Telephony
- **Twilio**: Voice calls, SMS, and phone number management
- **ElevenLabs**: Advanced voice synthesis
- **PlayHT**: Additional voice generation options

### Frontend Technologies
- **Next.js 14**: React framework with App Router
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Framer Motion**: Animation library
- **Recharts**: Data visualization components
- **Lexical**: Rich text editor framework

### Infrastructure & DevOps
- **Nx**: Monorepo build system and development tools
- **Docker**: Containerization (via Nx)
- **Vercel**: Frontend and edge function deployment
- **Stripe**: Payment processing and subscription management
- **Redis**: Caching and session management

### Analytics & Monitoring
- **Mixpanel**: User analytics and event tracking
- **Customer.io**: Customer engagement platform
- **Google Tag Manager**: Marketing and analytics tags
- **LangSmith**: AI application tracing and monitoring

## 🏢 Business Features

### 📞 AI Conversation Flows
- **Script-Based Conversations**: AI agents follow predefined scripts while maintaining natural conversation flow
- **Objection Handling**: Advanced logic for handling customer objections and keeping prospects engaged
- **Live Transfers**: Seamless handoff to human agents when needed
- **Calendar Integration**: Automatic appointment scheduling through Calendly and SavvyCal
- **Multi-Language Support**: Conversations in multiple languages with timezone awareness

### 📊 Campaign Management
- **Outbound Campaigns**: Automated calling campaigns with contact segmentation
- **Contact Management**: Comprehensive CRM with import/export capabilities
- **Segment Targeting**: Advanced audience segmentation for targeted campaigns
- **Daily Budget Controls**: Spend management and campaign optimization
- **Real-Time Monitoring**: Live campaign performance tracking

### 🎨 Widget Customization
- **Visual Customization**: Colors, fonts, themes, and branding options
- **Positioning Control**: Flexible widget placement on websites
- **Responsive Design**: Mobile-optimized conversation interfaces
- **Domain Restrictions**: Security controls for widget deployment

### 💰 Business Intelligence
- **Usage Analytics**: Detailed conversation and campaign metrics
- **Cost Tracking**: Per-minute call costs and budget management
- **Performance Reports**: Conversion rates and ROI analysis
- **A/B Testing**: Script and approach optimization

### 🔐 Enterprise Features
- **Multi-Tenancy**: Secure account isolation
- **Role-Based Access**: Granular permission management
- **API Access**: RESTful and GraphQL APIs for integrations
- **Webhook Support**: Real-time event notifications
- **Affiliate Program**: Partner revenue sharing system

## 🛠️ Development Setup

### Prerequisites
- Node.js 18.x
- Yarn 3.5.1+
- PostgreSQL
- Redis

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd airtask

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env
# Configure your environment variables

# Set up the database
cd apps/api
yarn prisma generate
yarn prisma db push

# Start all applications in development mode
yarn dev
```

### Available Scripts

```bash
# Development
yarn dev              # Start all apps in development mode
yarn dev:sec          # Start with HTTPS/SSL support

# Building
yarn build            # Build all applications
yarn lint             # Lint all projects
yarn format           # Format code with Prettier

# Testing
yarn test             # Run tests
yarn test:e2e         # Run end-to-end tests
```

### Development Ports
- **Main App**: http://localhost:3001
- **Widget**: http://localhost:3002
- **API**: http://localhost:3000

## 📦 Deployment

### Production Build
```bash
yarn build
```

### Environment Configuration
The project uses environment-specific configurations:
- Development: Local development with hot reloading
- Production: Optimized builds with proper caching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
