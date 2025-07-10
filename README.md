# Cyber Hunter - Mobile Application

A sophisticated mobile application for cybersecurity professionals, developers, and technology enthusiasts. Built with React Native, Expo, and Redux Toolkit.

## 🔄 Recent Integration

The application now features integration with a backend API, enabling dynamic data for teams, projects, and user management.

### API Integration
- **Backend URL**: https://0023edba1c90.ngrok-free.app
- **Authentication**: JWT-based with refresh token support
- **Endpoints**: Teams, Projects, Users, Authentication
- **Real-time updates**: Coming soon

### Running the App

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Scan the QR code with Expo Go app on your device, or press:
   - `a` to run on Android emulator
   - `i` to run on iOS simulator (Mac only)
   - `w` to run in web browser

## 🚀 Features

### Core Functionality
- **Multi-Modal Authentication**: Email/Password, Google OAuth, MetaMask Wallet integration
- **Project Management**: Create, edit, and showcase cybersecurity projects
- **Team Collaboration**: Join teams, invite members, collaborative workspaces
- **Leaderboard System**: Competitive ranking with achievements and badges
- **Real-time Notifications**: Push notifications and in-app messaging
- **Profile Management**: Comprehensive user profiles with skills and achievements

### Design System
- **Dark Theme**: Cyberpunk aesthetic with electric blue (#00D8FF) accents
- **Glass Morphism**: Semi-transparent overlays with blur effects
- **Neon Effects**: Glowing animations and borders
- **Responsive Design**: Optimized for mobile touch interfaces

## 🛠️ Technology Stack

### Frontend Framework
- **React Native** with Expo SDK
- **TypeScript** for type safety
- **React Navigation** for navigation management

### State Management
- **Redux Toolkit** for application state
- **Redux Persist** for data persistence
- **AsyncStorage** for local storage

### UI Components
- **Expo Vector Icons** for iconography
- **Expo Linear Gradient** for gradient effects
- **Expo Blur** for glass morphism effects
- **React Native Reanimated** for smooth animations

### Additional Features
- **Expo Image** for optimized image handling
- **Expo Camera** for image capture
- **Expo Notifications** for push notifications
- **React Native QR Code** for QR functionality

## 📱 Navigation Structure

### Authentication Flow
- Onboarding screens with tutorial
- Login with multiple authentication methods
- Registration and email verification
- Password reset functionality

### Main Application
- **Dashboard**: Overview of projects, teams, and statistics
- **Projects**: Browse and manage cybersecurity projects
- **Teams**: Team collaboration and management
- **Leaderboard**: Competitive rankings and achievements
- **Profile**: User profile and settings management

## 🎨 Color Scheme

```typescript
// Primary Brand Colors
brandPrimary: '#00D8FF'    // Cyan/Electric Blue
greenBlack: '#000000'      // Pure Black
whiteText: '#ffffff'       // White
neutralGrey: '#7E8589'     // Neutral Grey

// Status Colors
success: '#06db62'         // Green
warning: '#f59e0b'         // Amber
error: '#ef4444'           // Red
info: '#3b82f6'            // Blue

// Accent Colors
purple: '#8b5cf6'
orange: '#f97316'
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cyber-hunter-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app for physical device

### Development Commands

```bash
# Start development server
npm start

# Start with cache cleared
npm start --clear

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run tests
npm test

# Build for production
npm run build
```

## 📁 Project Structure

```
cyber-hunter-mobile/
├── app/                    # Expo Router configuration
├── assets/                 # Static assets (images, fonts)
├── components/             # Reusable UI components
│   └── ui/                # Custom UI components
├── constants/             # App constants and colors
├── hooks/                 # Custom React hooks
├── navigation/            # Navigation configuration
├── screens/               # Screen components
│   ├── auth/             # Authentication screens
│   ├── main/             # Main app screens
│   └── projects/         # Project-related screens
├── store/                 # Redux store configuration
│   └── slices/           # Redux slices
└── types/                # TypeScript type definitions
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# API Configuration
API_BASE_URL=https://api.cyberhunter.com
API_VERSION=v1

# Authentication
GOOGLE_CLIENT_ID=your_google_client_id
GITHUB_CLIENT_ID=your_github_client_id

# Analytics
ANALYTICS_KEY=your_analytics_key
```

### App Configuration
Update `app.json` for your specific configuration:

```json
{
  "expo": {
    "name": "Cyber Hunter",
    "slug": "cyber-hunter",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "cyberhunter",
    "userInterfaceStyle": "dark"
  }
}
```

## 🎯 Key Features Implementation

### Authentication System
- Multi-provider authentication (Email, Google, Wallet)
- JWT token management with refresh tokens
- Biometric authentication support
- Secure storage for sensitive data

### Project Management
- Multi-step project creation workflow
- Image upload and gallery management
- Tech stack tagging and categorization
- GitHub integration for code repositories

### Team Collaboration
- Team creation and invitation system
- Role-based permissions (Owner, Admin, Member)
- Real-time collaboration features
- Team leaderboards and achievements

### Gamification
- Achievement badges and scoring system
- Skill tracking and progression
- Competitive leaderboards
- Progress visualization

## 🔒 Security Features

- Secure token storage using Expo SecureStore
- API request encryption
- Biometric authentication
- Wallet integration for Web3 authentication
- Data validation and sanitization

## 📊 Performance Optimizations

- Image optimization and lazy loading
- Code splitting and bundle optimization
- Efficient state management with Redux
- Smooth animations with Reanimated
- Offline support with data caching

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 📦 Deployment

### Building for Production

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android

# Build locally
expo build:ios --type archive
expo build:android --type app-bundle
```

### App Store Deployment
1. Build production version
2. Upload to App Store Connect
3. Submit for review
4. Manage release phases

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎨 Design Guidelines

### UI/UX Principles
- Dark theme with cyberpunk aesthetics
- Minimum 44px touch targets
- Consistent spacing using 8px grid system
- Smooth 60fps animations
- Accessibility compliance (WCAG 2.1)

### Component Guidelines
- Reusable and composable components
- TypeScript interfaces for all props
- Consistent naming conventions
- Comprehensive error handling
- Loading states for all async operations

## 🚀 Roadmap

### Phase 1 (Current)
- ✅ Authentication system
- ✅ Basic navigation
- ✅ Core UI components
- ✅ Redux store setup

### Phase 2 (Next)
- 🔄 Complete project management
- 🔄 Team collaboration features
- 🔄 Real-time notifications
- 🔄 Advanced profile management

### Phase 3 (Future)
- 📱 Enhanced animations
- 🔐 Web3 wallet integration
- 📊 Analytics dashboard
- 🌐 Offline support

## 📞 Support

For support, email support@cyberhunter.com or join our Discord community.

---

**Built with ❤️ by the Cyber Hunter Team**
