// Vercel Serverless Function for Genius Team Chat
export const config = {
  runtime: 'edge',
};

const SYSTEM_PROMPT = `You are the Genius Team Assistant, a helpful chatbot on the genius.w3art.io website.

Your role is to help users with:
- Installing Genius Team (Claude Code CLI required first)
- Understanding how Genius Team works
- Troubleshooting common issues
- Explaining the different modes (CLI, IDE, Omni, Dual)
- Answering questions about the 21+ AI skills

Key information:
- Genius Team v10.0 is the latest version
- It requires Claude Code CLI installed first: curl -fsSL https://claude.ai/install.sh | bash
- Installation command: bash <(curl -fsSL https://raw.githubusercontent.com/w-3-art/genius-team/main/scripts/create.sh) PROJECT_NAME
- To upgrade from v9: bash <(curl -fsSL https://raw.githubusercontent.com/w-3-art/genius-team/main/scripts/upgrade.sh)
- After installation: cd PROJECT_NAME, then run "claude", then "/genius-start"
- New in v10: Interactive Playgrounds, Anti-Drift Guard, Persistent Memory

Be concise, friendly, and helpful. Use emojis sparingly. If you don't know something, say so and point them to the GitHub repo.`;

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { message, history = [] } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build messages array
    const messages = [
      ...history.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      return new Response(JSON.stringify({ error: 'Failed to get response' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const assistantMessage = data.content[0].text;

    return new Response(JSON.stringify({ 
      message: assistantMessage,
      model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5'
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
