# 🌾 AgriFriend - AI-Powered Platform for Indian Farmers

AgriFriend is a comprehensive web application designed to empower Indian farmers with real-time market prices, AI-driven predictions, and multilingual support. Built with React, TypeScript, and modern web technologies.

## ✨ Features

- 🌐 **Multilingual Support**: Full support for English and Hindi with easy language switching
- 🌓 **Dark Mode**: Complete dark mode support for comfortable viewing
- 📊 **Real-Time Market Prices**: Live mandi rates from 2,400+ markets across 29 states
- 🤖 **AI Predictions**: Smart forecasts for demand, yield, and optimal selling times
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- 🔒 **Secure Authentication**: SMS-based passwordless authentication
- 📈 **Interactive Charts**: Visual price trends and historical data analysis
- 💾 **Offline Support**: Works with cached data when offline
- 🎨 **Modern UI**: Clean, intuitive interface built with TailwindCSS

## 🚀 Quick Start for Team Members

### Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Chaitrashrinaik/agrifriend.git
cd agrifriend
```

### Step 2: Install Dependencies

```bash
npm install
```

Or if you prefer yarn:

```bash
yarn install
```

This will install all required packages including:
- React 19
- TypeScript
- Vite
- TailwindCSS
- React Router
- Recharts (for charts)
- Lucide React (for icons)
- Vitest (for testing)
- Fast-check (for property-based testing)

### Step 3: Set Up Environment Variables (Optional)

If you plan to use real APIs, create a `.env` file:

```bash
cp .env.example .env
```

Then edit `.env` and add your API keys. For development with mock data, this step is optional.

### Step 4: Start the Development Server

```bash
npm run dev
```

Or with yarn:

```bash
yarn dev
```

The application will start at **http://localhost:3000/**

### Step 5: Open in Browser

Navigate to http://localhost:3000/ in your web browser. You should see the AgriFriend landing page!

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at http://localhost:3000 |
| `npm run build` | Build for production (output in `dist/` folder) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once (for CI/CD) |

## 🧪 Testing

The project uses Vitest for unit testing and Fast-check for property-based testing.

Run tests:
```bash
npm run test
```

Run tests once (without watch mode):
```bash
npm run test:run
```

## 🏗️ Project Structure

```
agrifriend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── LanguageSwitcher.tsx
│   │   ├── PriceTicker.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/            # React contexts
│   │   ├── AuthContext.tsx
│   │   └── LanguageContext.tsx
│   ├── pages/               # Page components
│   │   ├── LandingPage.tsx
│   │   ├── Dashboard.tsx
│   │   ├── MarketPrices.tsx
│   │   └── Settings.tsx
│   ├── services/            # API and data services
│   │   ├── api.ts
│   │   ├── mockData.ts
│   │   └── agmarknetAPI.ts
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── .env.example             # Environment variables template
├── package.json             # Dependencies and scripts
├── tailwind.config.js       # TailwindCSS configuration
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

## 🌐 Using the Application

### Login
1. Enter any 10-digit mobile number (e.g., 9876543210)
2. Select your primary crop
3. Click "Open My Dashboard Instantly"

### Switch Language
- Click the language switcher in the top-right corner (EN/हिं)
- Or go to Settings page

### Change Theme
- Go to Settings page
- Select Light or Dark mode

### View Market Prices
- Click "Check Prices" from the dashboard
- Use filters to search by commodity, state, or date range
- Click "View Price Trend" on any price card to see historical charts
- Enable "Compare" mode to compare multiple prices

## 🔧 Development Tips

### Hot Module Replacement (HMR)
Vite provides instant HMR - your changes will reflect immediately without full page reload.

### Code Style
- The project uses ESLint for code quality
- Run `npm run lint` before committing
- Follow the existing code style and patterns

### Adding New Features
1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Test thoroughly
4. Commit: `git commit -m "Add: your feature description"`
5. Push: `git push origin feature/your-feature-name`
6. Create a Pull Request on GitHub

## 📚 Additional Documentation

- **API Integration Guide**: See `API_INTEGRATION_GUIDE.md`
- **Backend Implementation**: See `BACKEND_IMPLEMENTATION_GUIDE.md`
- **Quick Start API**: See `QUICK_START_API.md`

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 is already in use, Vite will automatically try the next available port (3001, 3002, etc.)

### Dependencies Installation Failed
Try clearing npm cache:
```bash
npm cache clean --force
npm install
```

### Build Errors
Make sure you're using Node.js v18 or higher:
```bash
node --version
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👥 Team

- **Project Lead**: Chaitrashrinaik
- **Repository**: https://github.com/Chaitrashrinaik/agrifriend

## 📞 Support

For questions or issues, please:
1. Check existing documentation
2. Search for similar issues on GitHub
3. Create a new issue with detailed description

---

**Happy Coding! 🚀**
