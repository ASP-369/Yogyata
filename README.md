# Yogyata Frontend

A modern React-based frontend for the Yogyata blockchain credential verification platform.

## 🌟 Features

- **Blockchain Credential Verification**: Instant verification of educational and professional credentials
- **AI-Powered Job Matching**: Smart recommendations based on verified skills
- **User-Friendly Interface**: Clean, responsive design with intuitive navigation
- **Real-time Verification**: Quick blockchain-based credential authentication
- **Admin Dashboard**: Comprehensive management tools for administrators
- **Mobile Responsive**: Optimized for all devices and screen sizes

## 🚀 Technology Stack

- **Frontend**: React 18, React Router
- **Styling**: CSS3 with CSS Variables, Flexbox, and Grid
- **Icons**: Font Awesome
- **Build Tool**: Vite
- **Package Manager**: npm

## 📁 Project Structure

```
yogyata-frontend/
├── public/
│   ├── index.html
│   └── assets/              # Static assets
├── src/
│   ├── components/
│   │   ├── common/          # Reusable components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   └── Modal.jsx
│   │   ├── layout/          # Layout components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Footer.jsx
│   │   └── features/        # Feature-specific components
│   │       ├── jobs/
│   │       ├── profile/
│   │       └── admin/
│   ├── pages/               # Main page views
│   │   ├── Home.jsx
│   │   ├── Profile.jsx
│   │   ├── JobSearch.jsx
│   │   ├── AIAssistant.jsx
│   │   ├── VerificationPortal.jsx
│   │   └── admin/
│   ├── styles/              # Global styles
│   │   ├── variables.css
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── README.md
```

## 🛠 Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd yogyata-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## 📱 Available Pages

### Public Pages

- **Home** (`/`) - Landing page with platform overview
- **Verification Portal** (`/verification`) - Public credential verification

### User Pages

- **Profile** (`/profile`) - User profile and credentials management
- **Job Search** (`/jobs`) - AI-powered job discovery
- **AI Assistant** (`/ai-assistant`) - Career guidance chatbot

### Admin Pages

- **Admin Dashboard** (`/admin`) - System overview and analytics
- **User Management** (`/admin/users`) - User administration
- **Credential Management** (`/admin/credentials`) - Credential oversight

## 🎨 Design System

### Color Palette

- **Primary**: `#3b82f6` (Blue)
- **Secondary**: `#6b7280` (Gray)
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Orange)
- **Danger**: `#ef4444` (Red)

### Typography

- **Font Family**: Inter, system fonts
- **Sizes**: 12px to 36px with consistent scale

### Components

- Reusable Button, Input, and Modal components
- Consistent spacing and border radius
- Responsive design patterns

## 🔧 Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## 📦 Build & Deployment

1. **Build the project**

   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting service

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions, please contact:

- Email: support@yogyata.com
- Documentation: [docs.yogyata.com](https://docs.yogyata.com)

## 🚧 Roadmap

### Phase 1 (Current)

- ✅ Core UI components
- ✅ User authentication flow
- ✅ Basic credential management
- ✅ Job search functionality

### Phase 2 (Upcoming)

- 🔄 Blockchain integration
- 🔄 Advanced AI features
- 🔄 Real-time notifications
- 🔄 Mobile app

### Phase 3 (Future)

- 📋 Multi-language support
- 📋 Advanced analytics
- 📋 Third-party integrations
- 📋 Enterprise features

---

Built with ❤️ by the Yogyata Team
