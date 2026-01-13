# English Coach 🇬🇧

An advanced web application for mastering English as a C1/C2 level learner. Combines linguistic analysis, accent coaching (Modern RP vs. General American), and interactive imitation challenges powered by AI.

## Features

✨ **Intelligent Linguistic Analysis**
- Genre detection (Literary, Everyday, Workplace)
- Atmosphere & subtext analysis
- Lexical precision coaching with collocations
- L1 (Chinglish) logic gap identification

🎧 **Accent-Specific Training**
- Modern RP (British) analysis
- General American (GenAm) analysis
- IPA phonetic transcription
- Intonation contour visualization
- Linking, reduction, and flow techniques

✍️ **Interactive Imitation Challenges**
- Genre-based writing exercises
- Real-time feedback with scoring
- Targeted improvement suggestions

## Tech Stack

**Backend**
- Node.js + Express.js
- OpenAI GPT-4 Turbo (or compatible LLM)
- Agentic pattern architecture with multi-stage processing

**Frontend**
- React 18
- Vite
- Tailwind CSS
- British aesthetic design

## Project Structure

```
English-Coach/
├── src/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config.js          # Environment & LLM configuration
│   │   │   ├── llm.js             # Agentic AI orchestration
│   │   │   ├── routes.js          # API endpoints
│   │   │   └── index.js           # Express server
│   │   ├── .env.example           # Copy to .env and fill in your LLM credentials
│   │   └── package.json
│   └── frontend/
│       ├── src/
│       │   ├── components/        # React components
│       │   ├── App.jsx
│       │   ├── main.jsx
│       │   └── index.css
│       ├── index.html
│       ├── vite.config.js
│       ├── tailwind.config.js
│       └── package.json
├── scripts/
│   ├── start-mac.sh               # macOS startup script
│   └── start-windows.bat          # Windows startup script
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 16+ & npm
- An OpenAI API key (or compatible LLM provider)

### Quick Start (Recommended)

**macOS:**
```bash
cd English-Coach
./scripts/start-mac.sh
```

**Windows:**
```bash
cd English-Coach
scripts\start-windows.bat
```

These scripts will:
- Check for Node.js installation
- Create `.env` file from template if needed
- Install dependencies automatically
- Start both backend (port 3001) and frontend (port 3000)

### Manual Setup

**1. Setup Backend**
```bash
cd src/backend

# Install dependencies
npm install
```

Example `.env` (in project root):
```
LLM_API_KEY=sk-your-openai-api-key
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4-turbo
PORT=3001
NODE_ENV=development
```

**Start the backend**
```bash
npm run dev
```

You should see:
```
🚀 English Coach Server running on port 3001
```

**2. Setup Frontend (in a new terminal)**
```bash
cd src/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## Usage

1. **Input your text** - Paste a sentence, paragraph, or dialogue in the input form
2. **Choose your accent** - Toggle between 🇬🇧 RP (British) or 🇺🇸 GenAm (American) in the top-right
3. **Receive analysis** - Get comprehensive coaching on:
   - Genre classification
   - Mood & subtext
   - Key vocabulary choices
   - Chinglish logic gaps
   - Phonetic details & intonation
4. **Practice with challenges** - Write an imitation using the suggested genre and receive detailed feedback

## API Endpoints

### POST `/api/analyze`
Analyzes text for comprehensive linguistic coaching.

**Request:**
```json
{
  "text": "Your text here",
  "accentMode": "modern-rp" // or "general-american"
}
```

**Response:**
```json
{
  "success": true,
  "accentDetected": { "detectedContext": "british", "confidence": 0.95, "cues": [...] },
  "analysis": {
    "genre": { "type": "Workplace", "register": "Formal", "strategy": "..." },
    "atmosphere": { "mood": "...", "unspokenMessage": "..." },
    "lexicalPrecision": [...],
    "l1LogicGap": {...},
    "audioPerformance": {...},
    "imitationChallenge": {...}
  }
}
```

### POST `/api/feedback`
Provides feedback on user's imitation attempt.

**Request:**
```json
{
  "originalText": "Original phrase",
  "userImitation": "User's attempt",
  "genre": "Workplace",
  "accentMode": "modern-rp"
}
```

**Response:**
```json
{
  "success": true,
  "feedback": {
    "overallScore": 8,
    "strengths": ["Natural phrasing", "..."],
    "improvements": [...],
    "nextStep": "Try..."
  }
}
```

### POST `/api/detect-accent`
Detects regional/accent cues in text.

**Request:**
```json
{
  "text": "I reckon this is rather brilliant, innit?"
}
```

**Response:**
```json
{
  "success": true,
  "detection": {
    "detectedContext": "british",
    "confidence": 0.98,
    "cues": ["innit", "rather", "brilliant"]
  }
}
```

### GET `/api/health`
Health check endpoint.

## Architecture & Design Patterns

### Agentic AI Pattern
The system uses a **multi-stage agentic pattern** for intelligent analysis:

1. **Detection Stage**: Analyze text to detect accent context and genre
2. **Analysis Stage**: Multi-dimensional linguistic breakdown
3. **Feedback Stage**: Interactive evaluation of user attempts

Each stage builds on the previous one, creating intelligent, context-aware coaching.

### Frontend Components
- **InputForm**: Text submission interface
- **AccentToggle**: RP vs GenAm switcher
- **AnalysisDisplay**: Orchestrates all analysis sections
- **SectionCard**: Collapsible section component
- **LexicalPrecision**: Keyword analysis with comparisons
- **L1LogicGap**: Chinglish vs native logic comparison
- **AudioPerformance**: Phonetic & intonation details
- **ImitationChallenge**: Interactive practice with feedback

## Customization

### Change LLM Provider
Edit [src/backend/src/llm.js](src/backend/src/llm.js) to use Claude, DeepSeek, or other providers:

```javascript
// Example: Using Claude
const llmClient = axios.create({
  baseURL: 'https://api.anthropic.com/v1',
  headers: {
    'x-api-key': config.llm.apiKey,
  },
});
```

### Modify Design Colors
British aesthetic colors in [src/frontend/tailwind.config.js](src/frontend/tailwind.config.js):
```javascript
colors: {
  'british-navy': '#1a3a52',
  'british-cream': '#f5f1e8',
  'british-gold': '#d4af37',
  'british-maroon': '#8b3a3a',
}
```

## Performance Tips

- **Longer inputs = Better analysis** (aim for 100+ words)
- **Genre-specific examples**: Use actual literary excerpts, workplace emails, or casual conversations
- **Accent context**: The system auto-detects American vs British cues, but can be overridden

## Troubleshooting

**"Failed to analyze text" error**
- Check your LLM API key in `.env` at project root
- Verify the LLM base URL is correct
- Ensure your account has API credits

**CORS errors**
- Backend should handle this via the `/api` proxy in `src/frontend/vite.config.js`
- Verify both servers are running

**Slow responses**
- OpenAI API can be slow during peak hours
- Longer text = longer processing time

## Future Enhancements

- [ ] Audio upload & pronunciation analysis
- [ ] Speaking rate calculation
- [ ] Word stress pattern visualization
- [ ] Semantic chunking for longer documents
- [ ] User progress tracking & spaced repetition
- [ ] Collaborative pronunciation feedback (community mode)

## License

MIT - Feel free to use and modify for educational purposes

## Support

For issues or suggestions, please open an issue in the repository.

---

**Made with ❤️ for advanced English learners**
