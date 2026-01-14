import { createApp } from './app.js';
import { container } from './Container.js';

const startServer = async () => {
    try {
        const app = await createApp();
        const config = container.get('config');
        const PORT = config.server.port;

        app.listen(PORT, () => {
            console.log(`🚀 English Coach Server running on port ${PORT}`);
            console.log(`📝 Environment: ${config.server.env}`);
            console.log(`🎯 LLM Model: ${config.llm.model}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
