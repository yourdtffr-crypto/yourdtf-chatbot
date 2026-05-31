export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { summary, client_email } = req.body

  // Use Resend or just log for now - we'll use a simple mailto approach
  // In production, integrate with Resend.com (free tier: 100 emails/day)
  console.log('ESCALATION REQUEST:', { summary, client_email })

  // For now return success - the frontend will open mailto
  return res.status(200).json({ 
    success: true,
    mailto: `mailto:yourdtf.fr@gmail.com?subject=Client nécessite assistance&body=${encodeURIComponent(`Résumé: ${summary}\n\nEmail client: ${client_email || 'non fourni'}`)}`
  })
}
