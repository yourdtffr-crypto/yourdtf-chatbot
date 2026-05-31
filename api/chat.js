export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages } = req.body

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request' })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: `Tu es l'assistant virtuel de YourDTF (yourdtf.fr), une imprimerie spécialisée dans l'impression DTF (Direct To Film) basée dans le Nord de la France.

Ton rôle est d'aider les clients avec :
- Les produits proposés : transferts DTF au mètre, DTF A4, DTF A3, UV DTF, etc.
- Les délais de fabrication et de livraison
- Les conseils de pressage et d'application
- Les formats, résolutions et fichiers acceptés (PNG fond transparent recommandé, 150 dpi minimum)
- Les tarifs (si le client demande un devis précis, invite-le à contacter directement via le site)
- Les questions techniques sur le DTF

Tu réponds toujours en français, de façon concise, chaleureuse et professionnelle.
Si tu ne connais pas une information précise, invite le client à contacter l'équipe via yourdtf.fr.
Ne promets jamais de délai ou de prix que tu n'es pas sûr de pouvoir tenir.`,
        messages: messages.slice(-10), // keep last 10 messages for context
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Anthropic API error:', error)
      return res.status(500).json({ error: 'API error' })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || "Désolé, je n'ai pas pu générer une réponse."

    return res.status(200).json({ message: text })
  } catch (err) {
    console.error('Server error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}
