# E-commerce Store - MERN Stack with Supabase

A modern e-commerce application built with React (frontend), Express.js (backend), and Supabase (database).

## Project Structure

```
project-root/
├── client/                 # React Frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # React components
│   │   │   └── common/    # Shared components
│   │   ├── utils/         # Utility functions
│   │   ├── App.js         # Main App component
│   │   └── index.js       # Entry point
│   ├── .env               # Environment variables
│   └── package.json       # Dependencies and scripts
├── server/                # Express Backend
│   ├── controllers/       # Business logic
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── .env              # Environment variables
│   └── package.json      # Dependencies and scripts
└── README.md             # This file
```

## Phase 1: Infrastructure & Configuration ✅

### Completed Features

#### 1. **Server Configuration**
- ✅ Fixed CORS configuration to allow cross-origin requests
- ✅ Added security headers with Helmet.js
- ✅ Implemented request logging with Morgan
- ✅ Added comprehensive error handling middleware
- ✅ Enhanced Express.js server setup

#### 2. **Environment Configuration**
- ✅ Created environment variable templates (`.env.example`)
- ✅ Set up development environment files
- ✅ Configured API URL environment variables
- ✅ Added proper environment separation

#### 3. **Client Architecture**
- ✅ Created centralized API client with error handling
- ✅ Implemented loading states with custom spinner
- ✅ Added user-friendly error messages
- ✅ Enhanced UI with modern styling and animations
- ✅ Added responsive design

#### 4. **Development Tools**
- ✅ Added ESLint and Prettier for code quality
- ✅ Configured development scripts
- ✅ Set up nodemon for server auto-reload

### Key Improvements

#### **Before (Issues):**
- CORS errors preventing API connections
- No error handling or loading states
- Basic UI with poor user experience
- Hardcoded API URLs
- No security headers

#### **After (Fixed):**
- ✅ Proper CORS configuration allowing development
- ✅ Comprehensive error handling with user-friendly messages
- ✅ Loading states during API calls
- ✅ Modern, responsive UI with animations
- ✅ Environment-based configuration
- ✅ Security headers and middleware
- ✅ Centralized API client with consistent error handling

### Technical Details

#### **Server Enhancements**
```javascript
// Enhanced server configuration with:
// - Helmet.js for security headers
// - CORS configuration for cross-origin requests
// - Morgan for request logging
// - Comprehensive error handling
```

#### **Client Architecture**
```javascript
// New components and utilities:
// - apiClient.js: Centralized API communication
// - LoadingSpinner.js: Loading state indicator
// - ErrorMessage.js: User-friendly error display
// - Enhanced App.js with proper error handling
```

#### **Environment Variables**
```bash
# Server (.env)
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_api_key
PORT=5000
CLIENT_URL=http://localhost:3000

# Client (.env)
REACT_APP_API_URL=http://localhost:5000
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account (for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project-root
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**
   ```bash
   # Copy environment templates
   cp ../server/.env.example ../server/.env
   cp .env.example .env
   
   # Edit .env files with your configuration
   ```

5. **Start the development servers**
   ```bash
   # Terminal 1 - Start server
   cd ../server
   npm run dev
   
   # Terminal 2 - Start client
   cd ../client
   npm start
   ```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Development Scripts

### Server Scripts
```bash
npm run dev    # Start server with nodemon
npm start      # Start server normally
```

### Client Scripts
```bash
npm start      # Start React development server
npm build      # Build for production
npm test       # Run tests
npm lint       # Run ESLint
npm format     # Format code with Prettier
```

## API Endpoints

### Products API
- `GET /api/products` - Get all products
- (Future endpoints will be added in subsequent phases)

## Phase 2: Backend Architecture (Planned)

### Planned Features
- Complete CRUD operations for products
- User authentication system
- Order management endpoints
- Database models with proper validation
- Authentication middleware

## Phase 3: Frontend Architecture (Planned)

### Planned Features
- Component architecture restructure
- Service layer implementation
- Custom hooks for data management
- Advanced UI components
- State management solution

## Phase 4: E-commerce Features (Planned)

### Planned Features
- Shopping cart functionality
- User authentication
- Product details page
- Search and filtering
- Checkout process

## Phase 5: Supabase Integration (Planned)

### Planned Features
- Database schema implementation
- Real-time subscriptions
- Authentication service
- Storage service for images
- Edge functions

## Phase 6: Testing & Deployment (Planned)

### Planned Features
- Comprehensive testing suite
- Production build optimization
- CI/CD pipeline
- Monitoring and analytics

## Troubleshooting

### Common Issues

#### **CORS Errors**
- Ensure both servers are running
- Check that CORS configuration matches your client URL
- Verify environment variables are set correctly

#### **API Connection Issues**
- Check that the server is running on port 5000
- Verify the API URL in client environment variables
- Check browser console for network errors

#### **Environment Variables**
- Ensure `.env` files are properly configured
- Restart servers after changing environment variables
- Check that sensitive data is not committed to version control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the repository.

---

**Note**: This project is currently in Phase 1 of development. The full e-commerce functionality will be implemented in subsequent phases.