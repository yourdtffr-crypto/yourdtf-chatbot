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
      description: "Envoie une carte produit cliquable vers un produit YourDTF",
      input_schema: {
        type: "object",
        properties: {
          product: {
            type: "string",
            enum: ["dtf_metre", "dtf_a3", "uv_dtf_a3", "uv_dtf_a4", "uv_dtf_a5", "uv_dtf_metre", "createur_planche_dtf", "createur_planche_uv"],
          }
        },
        required: ["product"]
      }
    },
    {
      name: "calculate_price",
      description: "Calcule le prix total HT selon le produit et la quantité",
      input_schema: {
        type: "object",
        properties: {
          product: { type: "string", enum: ["dtf_a3", "dtf_metre", "uv_dtf_a3", "uv_dtf_a4", "uv_dtf_a5"] },
          quantity: { type: "number" }
        },
        required: ["product", "quantity"]
      }
    },
    {
      name: "escalate_to_human",
      description: "Met en relation avec l'équipe YourDTF quand le client est confus ou a besoin d'aide humaine",
      input_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          client_email: { type: "string" }
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
        system: `Tu es l'assistant expert de YourDTF (yourdtf.fr), spécialiste en impression DTF textile et UV DTF, basé à Tétéghem dans le Nord de la France.
Tu réponds toujours en français, de façon professionnelle, claire et pédagogique.
Téléphone : +33 3 28 63 22 12 | Email : yourdtf.fr@gmail.com
Expédition le jour même pour toute commande passée avant 12h. Livraison gratuite en point relais dès 50€.

━━━━━━━━━━━━━━━━━━━━━━━━
🖨️ DTF TEXTILE — Pour textiles uniquement
━━━━━━━━━━━━━━━━━━━━━━━━
Le DTF (Direct To Film) est une technique d'impression sur film PET transféré sur textile via une PRESSE À CHAUD.
Le motif est imprimé sur film, recouvert de poudre thermofusible, puis pressé à chaud sur le vêtement.

✅ Compatibilité textile :
- Coton, polyester, viscose, élasthanne, soie, fibres synthétiques, mélanges
- Fonctionne sur textiles clairs ET foncés
- Résiste à plus de 50 lavages

✅ Avantages DTF textile :
- Couleurs vibrantes et détails ultra-précis
- Aucune limite de couleurs ni de formes
- Pas besoin de prétraitement du tissu
- Économique dès la 1ère pièce

❌ Ne convient PAS pour les surfaces rigides (mugs, téléphones, bois…)

📋 CONSEILS DE PRESSAGE DTF TEXTILE (étapes vérifiées) :
1. PRÉPARATION : tissu propre, sec et à plat. Pas de poussières ni résidus.
2. PRÉ-PRESSAGE : presser le textile seul 2 à 5 secondes pour éliminer l'humidité et les plis. Étape essentielle.
3. POSITIONNEMENT : placer le film PET face imprimée (côté poudré blanc) CONTRE le textile.
4. PRESSAGE : 150°C pendant 10 à 12 secondes, pression moyenne à forte et homogène. Attendre la fin complète du temps.
5. PELAGE :
   - Hot peel (à chaud) : retirer le film immédiatement après le pressage
   - Cold peel (à froid) : attendre le refroidissement complet avant de retirer
   → Les transferts YourDTF peuvent se peler à chaud ou à froid. Tester sur un échantillon.
6. POST-PRESSAGE (recommandé) : presser à nouveau 2 à 3 secondes avec une feuille de protection (papier sulfurisé ou Teflon) pour améliorer la durabilité et la résistance au lavage.

⚠️ Erreurs fréquentes à éviter :
- Température trop basse → adhésif mal fondu, motif qui se décolle
- Température trop élevée → transfert brûlé ou déformé, couleurs altérées
- Pression irrégulière → adhérence incomplète
- Retrait du film trop rapide → motif arraché
- Ne jamais repasser directement sur le motif (toujours mettre une protection)
- Sur polyester : pression légèrement réduite pour éviter la déformation du tissu

📐 PRODUITS DTF :
- DTF A3 : format A3, idéal pour logos, visuels moyens
- DTF au Mètre (55x100cm) : grandes planches personnalisées

━━━━━━━━━━━━━━━━━━━━━━━━
✨ UV DTF — Pour surfaces rigides uniquement
━━━━━━━━━━━━━━━━━━━━━━━━
Le UV DTF utilise des encres polymérisées aux UV. AUCUNE presse à chaud n'est nécessaire.
Le transfert s'applique à froid comme un sticker, par simple pression manuelle.

✅ Compatibilité surfaces rigides :
- Verre, métal, plastique rigide (ABS, PET, acrylique), bois verni, céramique, porcelaine, cuir lisse, coques téléphone
- Fonctionne sur surfaces lisses, planes ou légèrement incurvées

❌ NE CONVIENT PAS pour :
- Textiles (t-shirts, sweats…) → utiliser le DTF textile
- Surfaces poreuses, caoutchouc souple, silicone, plastique granuleux
- Pas compatible lave-vaisselle (lavage à la main recommandé)

✅ Avantages UV DTF :
- Aucune machine ni chaleur requise → pose accessible à tous
- Rendu légèrement en relief, brillant, photographique
- Résistant aux rayures et à l'eau
- Compatible avec les supports qui ne supportent pas la chaleur (coques plastique fine)

📋 CONSEILS DE POSE UV DTF (étapes vérifiées) :
1. NETTOYAGE DU SUPPORT : dégraisser soigneusement avec alcool neutre ou détergent doux. La surface doit être parfaitement propre, lisse et sèche.
2. DÉCOLLER LE FILM : retirer délicatement le film applicateur (liner transparent) pour exposer la face adhésive.
3. APPLICATION : poser progressivement le transfert sur la surface, en commençant par un bord.
4. MAROUFLER : presser fermement avec une raclette ou une carte plastique en chassant les bulles d'air vers l'extérieur.
5. RETRAIT DU FILM : décoller doucement le film applicateur en angle rasant. Le motif doit rester sur la surface.
→ Résultat : visuel net, en relief, résistant.

⚠️ Erreurs à éviter :
- Surface pas assez propre ou grasse → mauvaise adhérence
- Bulles d'air non chassées → décollements
- Retrait du film trop brusque → motif arraché

📐 PRODUITS UV DTF :
- UV DTF A3 (6,65€) : mugs, téléphones, objets A3
- UV DTF A4 (5,95€) : surfaces A4
- UV DTF A5 (3,95€) : petits objets, autocollants
- UV DTF au Mètre 50x100cm (35€/m) : grandes surfaces rigides

━━━━━━━━━━━━━━━━━━━━━━━━
📊 COMPARATIF DTF vs UV DTF
━━━━━━━━━━━━━━━━━━━━━━━━
Quand un client demande la différence, explique-la TOUJOURS comme ceci, de façon simple et visuelle :

🖨️ DTF Textile — c'est pour les VÊTEMENTS
→ T-shirts, sweats, casquettes, tout ce qui est tissu
→ Nécessite une presse à chaud (150°C)
→ Résiste à 50+ lavages en machine

✨ UV DTF — c'est pour les OBJETS RIGIDES
→ Mugs, téléphones, briquets, bois, métal, verre...
→ Aucune machine ni chaleur — ça se pose comme un sticker
→ Lavage à la main recommandé

La règle simple à retenir :
👕 Tu personnalises un vêtement ? → DTF Textile
☕ Tu personnalises un objet ? → UV DTF

━━━━━━━━━━━━━━━━━━━━━━━━
💰 TARIFS HT
━━━━━━━━━━━━━━━━━━━━━━━━
DTF A3 & UV DTF A3 :
1→8,20€ | 2→7,85€ | 3-4→7,75€ | 5-9→7,15€ | 10-14→6,80€ | 15-19→6,20€ | 20+→5,80€

DTF au Mètre (par mètre) :
1-4→17,00€ | 5-9→16,50€ | 10-24→15,80€ | 25-49→15,20€ | 50-74→14,50€ | 75-99→14,20€ | 100+→13,20€

UV DTF A4 : 5,95€/unité | UV DTF A5 : 3,95€/unité | UV DTF Mètre : 35,00€/m

━━━━━━━━━━━━━━━━━━━━━━━━
📁 FICHIERS ACCEPTÉS
━━━━━━━━━━━━━━━━━━━━━━━━
- Format recommandé : PNG fond transparent
- Résolution minimum : 150 dpi (300 dpi recommandé)
- Autres formats : PDF, AI, PSD vectoriel
- Important : pas de fond blanc sur les motifs

━━━━━━━━━━━━━━━━━━━━━━━━
🔧 RÈGLES D'UTILISATION DES OUTILS
━━━━━━━━━━━━━━━━━━━━━━━━
- Client demande un produit → TOUJOURS utiliser send_product_link
- Client demande un prix ou une quantité → TOUJOURS utiliser calculate_price
- Client confus, pose la même question 2+ fois, ou frustré → utiliser escalate_to_human
- Devis complexes ou commandes spéciales → inviter à appeler le +33 3 28 63 22 12`,
        messages: messages.slice(-10),
        tools,
      }),
    })

    if (!response.ok) {
      console.error('Anthropic API error:', await response.text())
      return res.status(500).json({ error: 'API error' })
    }

    const data = await response.json()
    const toolResults = []
    let textResponse = ''

    const PRODUCTS = {
      dtf_metre: { name: 'DTF au Mètre (55x100 cm)', url: 'https://yourdtf.fr/collections/formats-dtf/products/planche-dtf-personnalisee-format-550x1000-mm', emoji: '📏', tag: 'DTF Textile' },
      dtf_a3: { name: 'DTF Format A3', url: 'https://yourdtf.fr/collections/formats-dtf/products/transfert-dtf-format-a3', emoji: '🖨️', tag: 'DTF Textile' },
      uv_dtf_a3: { name: 'UV DTF Format A3', url: 'https://yourdtf.fr/collections/dtf-uv/products/impression-uv-dtf-a3', emoji: '✨', tag: 'UV DTF Rigide' },
      uv_dtf_a4: { name: 'UV DTF Format A4', url: 'https://yourdtf.fr/products/transfert-uv-dtf-a4', emoji: '✨', tag: 'UV DTF Rigide' },
      uv_dtf_a5: { name: 'UV DTF Format A5', url: 'https://yourdtf.fr/collections/dtf-uv/products/impression-uv-dtf-a5', emoji: '🏷️', tag: 'UV DTF Rigide' },
      uv_dtf_metre: { name: 'UV DTF au Mètre (50x100 cm)', url: 'https://yourdtf.fr/products/impression-uv-dtf-au-metre', emoji: '📐', tag: 'UV DTF Rigide' },
      createur_planche_dtf: { name: 'Créateur de Planche DTF', url: 'https://yourdtf.fr/collections/planche-dtf-personnalisee/products/planche-dtf-personnalisee', emoji: '🎨', tag: 'Outil en ligne' },
      createur_planche_uv: { name: 'Créateur de Planche UV DTF', url: 'https://yourdtf.fr/collections/createur-de-planche-dtf-uv', emoji: '🎨', tag: 'Outil en ligne' },
    }

    const PRICES = {
      dtf_a3: [{ max: 1, price: 8.20 }, { max: 2, price: 7.85 }, { max: 4, price: 7.75 }, { max: 9, price: 7.15 }, { max: 14, price: 6.80 }, { max: 19, price: 6.20 }, { max: Infinity, price: 5.80 }],
      uv_dtf_a3: [{ max: 1, price: 8.20 }, { max: 2, price: 7.85 }, { max: 4, price: 7.75 }, { max: 9, price: 7.15 }, { max: 14, price: 6.80 }, { max: 19, price: 6.20 }, { max: Infinity, price: 5.80 }],
      dtf_metre: [{ max: 4, price: 17.00 }, { max: 9, price: 16.50 }, { max: 24, price: 15.80 }, { max: 49, price: 15.20 }, { max: 74, price: 14.50 }, { max: 99, price: 14.20 }, { max: Infinity, price: 13.20 }],
      uv_dtf_a4: [{ max: Infinity, price: 5.95 }],
      uv_dtf_a5: [{ max: Infinity, price: 3.95 }],
    }

    for (const block of data.content) {
      if (block.type === 'text') {
        textResponse += block.text
      } else if (block.type === 'tool_use') {
        if (block.name === 'send_product_link') {
          const p = PRODUCTS[block.input.product]
          if (p) toolResults.push({ type: 'link', ...p })
        } else if (block.name === 'calculate_price') {
          const { product, quantity } = block.input
          const tiers = PRICES[product]
          const productInfo = PRODUCTS[product]
          if (tiers && productInfo) {
            const tier = tiers.find(t => quantity <= t.max)
            const unitPrice = tier ? tier.price : tiers[tiers.length - 1].price
            const total = (unitPrice * quantity).toFixed(2)
            toolResults.push({ type: 'price', productName: productInfo.name, quantity, unitPrice: unitPrice.toFixed(2), total })
          }
        } else if (block.name === 'escalate_to_human') {
          toolResults.push({ type: 'escalation', summary: block.input.summary, client_email: block.input.client_email || 'non fourni' })
        }
      }
    }

    return res.status(200).json({ message: textResponse || "Je vais vous aider.", toolResults })
  } catch (err) {
    console.error('Server error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}
