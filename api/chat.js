export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages } = req.body

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request' })
  }

  const tools = [
    {
      name: "send_product_link",
      description: "Envoie un lien vers un produit YourDTF au client",
      input_schema: {
        type: "object",
        properties: {
          product: {
            type: "string",
            enum: ["dtf_metre", "dtf_a3", "uv_dtf_a3", "createur_planche"],
            description: "Le produit à afficher"
          }
        },
        required: ["product"]
      }
    },
    {
      name: "calculate_price",
      description: "Calcule le prix total HT selon le produit et la quantité demandée par le client",
      input_schema: {
        type: "object",
        properties: {
          product: {
            type: "string",
            enum: ["dtf_a3", "dtf_metre"],
            description: "Le produit pour lequel calculer le prix"
          },
          quantity: {
            type: "number",
            description: "La quantité souhaitée par le client"
          }
        },
        required: ["product", "quantity"]
      }
    },
    {
      name: "escalate_to_human",
      description: "Envoie un email à l'équipe YourDTF quand le client a du mal à comprendre ou a besoin d'aide humaine",
      input_schema: {
        type: "object",
        properties: {
          summary: {
            type: "string",
            description: "Résumé de la conversation et du problème du client"
          },
          client_email: {
            type: "string",
            description: "Email du client s'il l'a fourni, sinon 'non fourni'"
          }
        },
        required: ["summary"]
      }
    }
  ]

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
        system: `Tu es l'assistant virtuel professionnel de YourDTF (yourdtf.fr), spécialiste en impression DTF (Direct To Film) basé dans le Nord de la France.

Tu réponds toujours en français, de façon professionnelle, claire et concise.

## Produits disponibles :
- **DTF au Mètre** (55x100 cm) : planche personnalisée format mètre
- **DTF Format A3** : transferts DTF format A3
- **UV DTF Format A3** : impressions UV DTF format A3
- **Créateur de planche** : outil de création en ligne

## Grille de prix DTF A3 (HT) :
- 1 unité : 8,20€
- 2 unités : 7,85€
- 3-4 unités : 7,75€
- 5-9 unités : 7,15€
- 10-14 unités : 6,80€
- 15-19 unités : 6,20€
- 20 et + : 5,80€

## Grille de prix DTF au Mètre (HT) :
- 1-4 mètres : 17,00€/m
- 5-9 mètres : 16,50€/m
- 10-24 mètres : 15,80€/m
- 25-49 mètres : 15,20€/m
- 50-74 mètres : 14,50€/m
- 75-99 mètres : 14,20€/m
- 100+ mètres : 13,20€/m

## Règles importantes :
1. Si le client demande un produit ou un lien, utilise TOUJOURS l'outil send_product_link
2. Si le client demande un prix ou une quantité, utilise TOUJOURS l'outil calculate_price
3. Si le client pose la même question plus de 2 fois, semble confus ou frustré, utilise l'outil escalate_to_human
4. Pour les fichiers : accepte PNG fond transparent, résolution minimum 150 dpi
5. Si tu ne connais pas une info précise, invite le client à contacter l'équipe via yourdtf.fr`,
        messages: messages.slice(-10),
        tools: tools,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Anthropic API error:', error)
      return res.status(500).json({ error: 'API error' })
    }

    const data = await response.json()

    // Process tool calls
    const toolResults = []
    let textResponse = ''

    for (const block of data.content) {
      if (block.type === 'text') {
        textResponse += block.text
      } else if (block.type === 'tool_use') {
        if (block.name === 'send_product_link') {
          const products = {
            dtf_metre: {
              name: 'DTF au Mètre (55x100 cm)',
              url: 'https://yourdtf.fr/collections/formats-dtf/products/planche-dtf-personnalisee-format-550x1000-mm',
              emoji: '📏'
            },
            dtf_a3: {
              name: 'DTF Format A3',
              url: 'https://yourdtf.fr/collections/formats-dtf/products/transfert-dtf-format-a3',
              emoji: '🖨️'
            },
            uv_dtf_a3: {
              name: 'UV DTF Format A3',
              url: 'https://yourdtf.fr/collections/dtf-uv/products/impression-uv-dtf-a3',
              emoji: '✨'
            },
            createur_planche: {
              name: 'Créateur de Planche',
              url: 'https://yourdtf.fr/collections/planche-dtf-personnalisee/products/planche-dtf-personnalisee',
              emoji: '🎨'
            }
          }
          const p = products[block.input.product]
          toolResults.push({ type: 'link', ...p })
        } else if (block.name === 'calculate_price') {
          const { product, quantity } = block.input
          let unitPrice = 0
          let productName = ''

          if (product === 'dtf_a3') {
            productName = 'DTF A3'
            if (quantity >= 20) unitPrice = 5.80
            else if (quantity >= 15) unitPrice = 6.20
            else if (quantity >= 10) unitPrice = 6.80
            else if (quantity >= 5) unitPrice = 7.15
            else if (quantity >= 3) unitPrice = 7.75
            else if (quantity === 2) unitPrice = 7.85
            else unitPrice = 8.20
          } else if (product === 'dtf_metre') {
            productName = 'DTF au Mètre'
            if (quantity >= 100) unitPrice = 13.20
            else if (quantity >= 75) unitPrice = 14.20
            else if (quantity >= 50) unitPrice = 14.50
            else if (quantity >= 25) unitPrice = 15.20
            else if (quantity >= 10) unitPrice = 15.80
            else if (quantity >= 5) unitPrice = 16.50
            else unitPrice = 17.00
          }

          const total = (unitPrice * quantity).toFixed(2)
          toolResults.push({
            type: 'price',
            productName,
            quantity,
            unitPrice: unitPrice.toFixed(2),
            total
          })
        } else if (block.name === 'escalate_to_human') {
          // Send email notification
          toolResults.push({
            type: 'escalation',
            summary: block.input.summary,
            client_email: block.input.client_email || 'non fourni'
          })
        }
      }
    }

    return res.status(200).json({
      message: textResponse || "Je vais vous aider avec ça.",
      toolResults
    })

  } catch (err) {
    console.error('Server error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}
