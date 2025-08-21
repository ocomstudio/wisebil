// src/lib/genkit.ts
import {genkit, Plugin, durableStore, noopTraceStore} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const openrouter: Plugin<void> = (options) => ({
  name: 'openrouter',
  model: {
    'mistralai/mistral-7b-instruct:free': {
      supports: {
        generate: true,
        tools: true,
        systemRole: true,
        media: false,
      },
      name: 'mistralai/mistral-7b-instruct:free',
    },
    'google/gemma-7b-it:free': {
      supports: {
        generate: true,
        tools: true,
        systemRole: true,
        media: false,
      },
      name: 'google/gemma-7b-it:free',
    },
    'openai/gpt-3.5-turbo': {
        supports: {
            generate: true,
            tools: true,
            systemRole: true,
            media: false,
        },
        name: 'openai/gpt-3.5-turbo',
    },
  },
  async generate(options, auth) {
    const model = options.model;
    const body = {
      model: model,
      messages: options.messages.map((m) => {
        if (m.role === 'output') {
          return {role: 'assistant', content: m.content[0].text};
        }
        return {
          role: m.role,
          content: m.content.map((c) => c.text).join(''),
        };
      }),
      stream: false,
      ...(options.tools && {
        tools: options.tools.map((t) => ({type: 'function', function: t})),
      }),
      ...(options.config?.responseFormat === 'json' && {
        response_format: {type: 'json_object'},
      }),
      ...(options.config?.temperature && {
        temperature: options.config.temperature,
      }),
    };

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://wisebil.com',
        'X-Title': 'Wisebil',
      },
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const data = await res.json();
    const choice = data.choices[0];
    if (choice.message.tool_calls) {
      return {
        candidates: [
          {
            index: 0,
            finishReason: 'toolRequest',
            message: {
              role: 'toolRequest',
              content: choice.message.tool_calls.map((c: any) => ({
                toolRequest: {
                  name: c.function.name,
                  input: JSON.parse(c.function.arguments),
                },
              })),
            },
          },
        ],
        usage: {
          inputTokens: data.usage.prompt_tokens,
          outputTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
      };
    }
    return {
      candidates: [
        {
          index: 0,
          finishReason: 'stop',
          message: {
            role: 'output',
            content: [{text: choice.message.content}],
          },
        },
      ],
      usage: {
        inputTokens: data.usage.prompt_tokens,
        outputTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
    };
  },
});

export const ai = genkit({
  plugins: [
    googleAI(),
    openrouter(),
  ],
  durableStore: durableStore(),
  traceStore: noopTraceStore(),
  enableTracing: false,
});
