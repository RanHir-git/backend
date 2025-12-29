import fetch from 'node-fetch'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

const OPENROUTER_MODEL = 'openrouter/auto'

export async function handleAICommand(req, res) {
  try {
    // --- 1. Limit by cookie ---
    let aiCount = parseInt(req.cookies.aiCount) || 0
    if (aiCount >= 2) {
      return res.status(403).send({ error: 'AI chat limit reached' })
    }
    aiCount++
    res.cookie('aiCount', aiCount, {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: true,
    })

    const { prompt } = req.body
    if (!prompt) return res.status(400).send('No prompt provided')

    const instruction = `
You are a smart assistant that creates Trello-style boards.
Return **ONLY valid JSON**, ready to parse with JSON.parse().
Do NOT return any JavaScript code, explanations, or code fences.
Use **double quotes** for all keys and string values.

The JSON object must follow this structure:

{
  "title": "Board title",
  "groups": [
    {
      "title": "Group title",
      "tasks": [
        { "title": "Task title" }
      ]
    }
  ]
}

- Make 3 groups.
- Each group must have 3-5 tasks.
- Use short titles (1-6 words each) to keep the object small.
- Make sure the JSON is complete and syntactically correct.

User request: "${prompt}"`

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [{ role: 'user', content: instruction }],
        max_tokens: 1000,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      const errMsg = data?.error?.message || 'OpenRouter request failed'
      throw new Error(errMsg)
    }

    const result = data?.choices?.[0]?.message?.content || data?.text || ''

    if (!result) throw new Error('No AI text returned')

    res.json({ result })
  } catch (err) {
    console.error('AI ERROR:', err.message)
    res.status(500).send('AI failed')
  }
}
