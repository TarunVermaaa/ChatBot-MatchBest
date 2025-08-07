# AkashDTH AI Assistant with Dashboard

A comprehensive AI chatbot for AkashDTH with an admin dashboard to manage user inquiries and demo requests.

## Features

### 🤖 AI Chatbot
- **AkashDTH Knowledge**: Complete information about plans, channels, and services
- **Smart Inquiry Detection**: Automatically detects when users want to book demo, trial, or other services
- **Voice Input**: Speech-to-text functionality for hands-free interaction
- **Multi-language Support**: Handles both English and Filipino queries

### 📊 Admin Dashboard
- **Inquiry Management**: View and manage all user inquiries
- **Status Tracking**: Track inquiry status (pending, contacted, completed, cancelled)
- **Real-time Updates**: Live updates when new inquiries are submitted
- **Filtering**: Filter inquiries by status and type
- **Notes System**: Add admin notes to inquiries

### 📝 Inquiry Forms
- **Demo Requests**: Collect details for demo bookings
- **Trial Requests**: Handle free trial applications
- **Consultation Booking**: Schedule expert consultations
- **Support Requests**: Technical support inquiries
- **Subscription Requests**: Plan subscription applications

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push
```

### 3. Environment Variables
Create a `.env.local` file:
```env
# Database
DATABASE_URL="file:./dev.db"

# OpenRouter API Key (optional)
OPENROUTER_API_KEY="your-api-key-here"
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Access the Application
- **Chat Assistant**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/dashboard

## How It Works

### Chatbot Flow
1. User asks questions about AkashDTH services
2. AI responds with relevant information
3. When user mentions keywords like "demo", "trial", "subscribe", etc.
4. System automatically shows inquiry form
5. User fills form with their details
6. Data is saved to database
7. Admin can view and manage inquiries in dashboard

### Dashboard Features
- **Overview Stats**: Total inquiries, pending, contacted, completed
- **Inquiry List**: All inquiries with filtering options
- **Status Management**: Update inquiry status and add notes
- **Real-time Updates**: New inquiries appear immediately

## API Endpoints

### `/api/chat`
- **POST**: Handle chat messages with AI

### `/api/inquiry`
- **POST**: Submit new inquiry
- **GET**: Fetch all inquiries

### `/api/inquiry/[id]`
- **PUT**: Update inquiry status and notes
- **DELETE**: Delete inquiry

## Database Schema

### UserInquiry
- `id`: Unique identifier
- `name`: User's full name
- `email`: User's email address
- `phone`: Phone number (optional)
- `company`: Company name (optional)
- `inquiryType`: Type of inquiry (demo, trial, consultation, etc.)
- `message`: Additional message (optional)
- `plan`: Preferred plan (optional)
- `status`: Current status (pending, contacted, completed, cancelled)
- `createdAt`: Timestamp
- `updatedAt`: Last update timestamp
- `notes`: Admin notes (optional)

## Technologies Used

- **Next.js 15**: React framework
- **Prisma**: Database ORM
- **SQLite**: Database (can be changed to PostgreSQL/MySQL)
- **OpenRouter**: AI provider
- **Tailwind CSS**: Styling
- **Radix UI**: Component library
- **TypeScript**: Type safety

## Customization

### Adding New Inquiry Types
1. Update the keyword detection in `components/chat-form.tsx`
2. Add new case in `components/inquiry-form.tsx`
3. Update database schema if needed

### Changing AI Provider
1. Update `app/api/chat/route.ts`
2. Modify system prompt as needed
3. Update environment variables

### Styling
- Modify `tailwind.config.ts` for theme changes
- Update component styles in respective files
- Customize dashboard layout in `app/dashboard/page.tsx`

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

### Other Platforms
1. Build the application: `npm run build`
2. Set up database (PostgreSQL recommended for production)
3. Configure environment variables
4. Deploy to your preferred platform

## Support

For issues and questions:
1. Check the documentation
2. Review the code comments
3. Open an issue on GitHub

## License

MIT License - feel free to use this project for your own needs. 