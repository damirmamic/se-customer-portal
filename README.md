# SE Customer Portal

A comprehensive Azure resource management and monitoring portal built with React, TypeScript, and Supabase.

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## Features

- 🔐 **Azure AD Authentication**: Secure sign-in with Microsoft Entra ID (Azure AD)
- 📊 **Azure Resource Monitoring**: Real-time monitoring of Azure resources
- 📈 **Metrics & Alerts**: View metrics, alerts, and health status
- 👥 **Role-Based Access Control**: Customer, Operations Engineer, and Admin roles
- 🔄 **Auto-Refresh**: Automatic data updates with retry logic
- 🎯 **Subscription Management**: Multi-subscription support
- 🧪 **Comprehensive Testing**: Unit, integration, and component tests

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.

## Azure Setup

This portal integrates with your Azure tenant for resource monitoring and management. Follow these steps:

1. **Set up Azure App Registration** - See [AZURE_SETUP.md](./AZURE_SETUP.md) for detailed instructions
2. **Configure Environment Variables** - Copy `.env.example` to `.env.local` and fill in your Azure credentials
3. **Deploy Supabase Edge Functions** - Configure Azure credentials in Supabase secrets

For complete setup instructions, see [AZURE_SETUP.md](./AZURE_SETUP.md)

## Testing

This project includes comprehensive testing with Vitest and React Testing Library.

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run specific test suites
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
```

For testing guidelines and best practices, see [TESTING.md](./TESTING.md)

## Documentation

- **[AZURE_SETUP.md](./AZURE_SETUP.md)** - Complete Azure tenant integration guide
- **[TESTING.md](./TESTING.md)** - Testing framework documentation and best practices
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Details of testing framework and Azure enhancements

## Project Structure

```
src/
├── components/        # React components
│   ├── auth/         # Authentication components
│   ├── dashboard/    # Dashboard components
│   ├── layout/       # Layout components
│   └── ui/           # Reusable UI components
├── hooks/            # Custom React hooks
│   ├── useAuth.tsx   # Authentication hook
│   └── useAzureMonitor.ts # Azure Monitor integration
├── lib/              # Utility libraries
│   ├── azureAuth.ts  # Azure authentication utilities
│   └── utils.ts      # General utilities
├── pages/            # Page components
├── test/             # Test utilities and integration tests
│   ├── setup.ts      # Test configuration
│   ├── testUtils.tsx # Custom render functions
│   └── integration/  # Integration tests
└── integrations/     # External service integrations
    ├── backend/      # Supabase client
    └── supabase/     # Supabase types
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm test            # Run tests in watch mode
npm run test:coverage # Generate test coverage report
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, Radix UI, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Edge Functions)
- **Azure**: Azure Monitor, Azure AD, Azure Resource Manager
- **Testing**: Vitest, React Testing Library, jsdom
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6

## Contributing

1. Create a feature branch
2. Write tests for new features
3. Ensure all tests pass: `npm run test:run`
4. Ensure linting passes: `npm run lint`
5. Submit a pull request

## CI/CD

The project includes a GitHub Actions workflow that:
- Runs linting checks
- Executes all tests
- Generates coverage reports
- Builds the application
- Performs security scanning
- Type checks with TypeScript

See `.github/workflows/ci.yml` for details.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
