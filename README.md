
# Yogyata - Blockchain-Verified Micro-Credential Platform

A decentralized platform for issuing, verifying, and managing blockchain-verified educational credentials.

## 🚀 Features

- **Blockchain Verification**: Credentials stored Ethereum Sepolia for immutable verification
- **Role-Based Access**: Separate dashboards for Students, Institutions, and Employers
- **AI-Powered Recommendations**: Skill matching and course recommendations (AI partner integration ready)
- **IPFS Storage**: Decentralized metadata storage for credentials
- **QR Code Verification**: Instant verification via QR code scanning
- **Chatbot Integration**: AI-powered assistance (placeholder endpoints ready)

## 📁 Project Structure

```
Yogyata/
├── backend/                  # Express.js API server
│   ├── src/
│   │   ├── config/          # Supabase configuration
│   │   ├── middleware/      # Auth middleware
│   │   ├── routes/          # API routes
│   │   └── index.js         # Server entry point
│   ├── ai_engine/           # Python AI/ML Engine
│   │   ├── data/           # CSV datasets
│   │   ├── kg/             # Knowledge Graph builder
│   │   ├── models/         # AI/GNN models
│   │   └── api.py          # AI service entry point
│   ├── .env.example         # Environment variables template
│   └── package.json
│
├── frontend/                 # React.js application
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context (Auth)
│   │   ├── layouts/         # Page layouts
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service
│   │   └── styles/          # Global CSS
│   ├── .env.example         # Environment variables template
│   └── package.json
```

## 🛠️ Tech Stack

### Frontend

- React 18.2
- React Router DOM 6.20
- React Icons
- React Toastify
- Axios
- QRCode.react (for QR code generation)
- Supabase Auth

### Backend

- Express.js 4.18
- Supabase (Auth & Database)
- CORS, Helmet (Security)
- Morgan (Logging)
- UUID
- Express Validator
- Neo4j

### External Integrations (Placeholder Ready)

- Blockchain: Ethereum Sepolia (testnet)
- Storage: IPFS
- AI: DistilBERT NLP for skill matching

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Backend Setup

1. Navigate to backend folder:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env` file from `.env.example`:

   ```env
   PORT=5000
   NODE_ENV=development
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   JWT_SECRET=your_jwt_secret
   BLOCKCHAIN_SERVICE_URL=http://localhost:3001
   AI_SERVICE_URL=http://localhost:3002
   IPFS_GATEWAY_URL=https://ipfs.io/ipfs
   ```

4. Start the server:
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`

### AI Engine Setup (Python)

1. Navigate to the AI engine folder:
   ```bash
   cd backend/ai_engine
   ```

2. Create and activate a virtual environment:
   ```bash
   # Windows:
   python -m venv venv
   .\venv\Scripts\activate

   # Linux/Mac:
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create `.env` file from `.env.example`:
   ```env
   NEO4J_URI=bolt://localhost:7687
   NEO4J_USER=neo4j
   NEO4J_PASSWORD=your_password
```
5.Run the formodel:
   ```bash
   python run_demo.py
   ```
6. Run the AI API:
   ```bash
   python api.py
   ```
   AI service runs on `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend folder:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env` file from `.env.example`:

   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm start
   ```
   App runs on `http://localhost:3000`

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Credentials

- `POST /api/credentials` - Issue new credential
- `GET /api/credentials` - List credentials
- `GET /api/credentials/:id` - Get credential details
- `PUT /api/credentials/:id/revoke` - Revoke credential

### Verification

- `GET /api/verification/:id` - Verify credential by ID

### AI Integration (Placeholder)

- `POST /api/ai/match/jobs` - Match credentials to job description
- `POST /api/ai/recommendations/skills` - Get skill recommendations
- `POST /api/ai/analyze/paperwork` - Analyze paperwork (future)

### Chatbot (Placeholder)

- `POST /api/chatbot/message` - Send message to chatbot
- `GET /api/chatbot/history` - Get chat history

## 🎨 Pages

1. **Landing Page** - Public homepage with features showcase
2. **Auth Pages** - Login, Signup, Forgot Password
3. **Student Dashboard** - View credentials, stats, recommendations
4. **Credential Detail** - Full credential view with QR code
5. **Institution Dashboard** - Issue and manage credentials
6. **Issue Credential** - Multi-step credential issuance form
7. **Verification Portal** - Public credential verification
8. **AI Skill Matcher** - Job description analyzer
9. **Employer Dashboard** - Search and verify candidates

## 🔐 User Roles

- **Student**: View credentials, get recommendations, share with employers
- **Institution**: Issue credentials, manage issuance, view analytics
- **Employer**: Verify credentials, search candidates, generate reports

## 🤝 AI Partner Integration

The platform has placeholder endpoints for AI integration:

- `/api/ai/*` - AI service endpoints
- `/api/chatbot/*` - Chatbot service endpoints

Configure `AI_SERVICE_URL` in environment variables to connect your AI service.

## 📄 Supabase Tables Required

```sql
-- Users table (handled by Supabase Auth)

-- Credentials table
CREATE TABLE credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issuer_id UUID REFERENCES auth.users(id),
  recipient_email TEXT NOT NULL,
  recipient_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  credential_type TEXT DEFAULT 'certificate',
  skills TEXT[],
  metadata JSONB DEFAULT '{}',
  issue_date DATE,
  expiry_date DATE,
  status TEXT DEFAULT 'pending_blockchain',
  blockchain_hash TEXT,
  ipfs_hash TEXT,
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification logs
CREATE TABLE verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id UUID REFERENCES credentials(id),
  verifier_id UUID,
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  result TEXT
);

-- Institutions
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  type TEXT,
  website TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student profiles
CREATE TABLE student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  bio TEXT,
  skills TEXT[],
  interests TEXT[],
  education JSONB DEFAULT '[]',
  career_goals TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🧪 Development

### Code Style

- React functional components with hooks
- CSS modules (no Tailwind, pure CSS)
- CSS variables for theming
- Mobile-first responsive design

### CSS Color Variables

```css
--primary-500: #6366F1
--secondary-500: #10B981
--gray-900: #111827
--error: #EF4444
```

## 📝 License

MIT License

## 👥 Contributors

- Khushi Choudki
- Anirudh Sai
- Shreya Prasad
