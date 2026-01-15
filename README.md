# English Coach

Advanced English training for C1/C2 learners, featuring:

- **Linguistic Analysis**: Genre, subtext, lexical precision, and stylistic analysis (LLM-powered)
- **Voice Assessment**: Real-time pronunciation, fluency, and prosody feedback (Azure Speech)
- **Accent Coaching**: Modern RP (British) and General American
- **Imitation Challenges**: Interactive writing and speaking exercises

## Quick Start

1. **Install Dependencies**
   ```bash
   cd src/backend && npm install
   cd ../frontend && npm install
   ```

2. **Configure Environment**
   Create `.env` in the root folder with:
   ```env
   LLM_API_KEY=your_key
   LLM_BASE_URL=https://api.openai.com/v1
   AZURE_SPEECH_KEY=your_azure_key
   AZURE_SPEECH_REGION=eastus
   ```
   *(Note: LLM_BASE_URL defaults to OpenAI, but supports compatible endpoints)*

3. **Run Application**
   - **Windows**:
     Run `scripts\start-backend.ps1` and `scripts\start-frontend.ps1` in separate terminals.
   - **Mac/Linux**:
     Run `./scripts/start-mac.sh`.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **AI**: OpenAI GPT-4 (Analysis), Azure Speech Services (Pronunciation)

## License

MIT
