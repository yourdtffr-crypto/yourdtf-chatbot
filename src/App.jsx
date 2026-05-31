import { useState, useRef, useEffect } from 'react'

const SUGGESTIONS = [
  "Je veux créer une planche DTF",
  "Quel est le prix pour 10 DTF A3 ?",
  "C'est quoi le DTF au mètre ?",
  "Quels fichiers acceptez-vous ?",
]

const TypingDots = () => (
  <div style={{
    display: 'flex', gap: 5, alignItems: 'center', padding: '14px 18px',
    background: 'var(--surface2)', borderRadius: '18px 18px 18px 4px',
    width: 'fit-content',
  }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: 7, height: 7, borderRadius: '50%',
        background: 'var(--orange)',
        animation: 'bounce 1.2s infinite',
        animationDelay: `${i * 0.2}s`,
      }} />
    ))}
  </div>
)

const ProductCard = ({ data }) => (
  <a href={data.url} target="_blank" rel="noopener noreferrer" style={{
    display: 'flex', alignItems: 'center', gap: 12,
    background: 'var(--surface)', border: '1px solid var(--orange)',
    borderRadius: 12, padding: '12px 16px', textDecoration: 'none',
    color: 'var(--text)', cursor: 'pointer', marginTop: 8,
    transition: 'all 0.2s',
  }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,61,0,0.1)'}
    onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
  >
    <span style={{ fontSize: 24 }}>{data.emoji}</span>
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>{data.name}</div>
      <div style={{ fontSize: 11, color: 'var(--orange)', marginTop: 2 }}>Voir le produit →</div>
    </div>
  </a>
)

const PriceCard = ({ data }) => (
  <div style={{
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '14px 16px', marginTop: 8,
  }}>
    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      Estimation de prix
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Produit</span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{data.productName}</span>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Quantité</span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{data.quantity}</span>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Prix unitaire HT</span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{data.unitPrice}€</span>
    </div>
    <div style={{ height: 1, background: 'var(--border)', margin: '10px 0' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 14, fontWeight: 700 }}>Total HT</span>
      <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--orange)', fontFamily: 'var(--font-display)' }}>{data.total}€</span>
    </div>
  </div>
)

const EscalationCard = ({ data }) => {
  const mailto = `mailto:yourdtf.fr@gmail.com?subject=${encodeURIComponent('Client nécessite assistance')}&body=${encodeURIComponent(`Résumé de la conversation:\n${data.summary}\n\nEmail client: ${data.client_email || 'non fourni'}`)}`
  
  useEffect(() => {
    // Auto-open email client
    window.open(mailto, '_blank')
  }, [])

  return (
    <div style={{
      background: 'rgba(255,61,0,0.08)', border: '1px solid var(--orange)',
      borderRadius: 12, padding: '14px 16px', marginTop: 8,
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>📧 Mise en relation avec l'équipe</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
        Un email a été préparé pour l'équipe YourDTF. Ils vous répondront rapidement.
      </div>
      <a href={mailto} style={{
        display: 'inline-block', padding: '8px 14px',
        background: 'var(--orange)', borderRadius: 8,
        color: 'white', fontSize: 12, fontWeight: 600,
        textDecoration: 'none',
      }}>Envoyer l'email →</a>
    </div>
  )
}

const Message = ({ msg }) => {
  const isUser = msg.role === 'user'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', animation: 'fadeIn 0.3s ease forwards' }}>
      <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', width: '100%' }}>
        {!isUser && (
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--orange)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, marginRight: 10, marginTop: 2,
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: 'white',
          }}>Y</div>
        )}
        {msg.content && (
          <div style={{
            maxWidth: '75%', padding: '12px 16px',
            borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            background: isUser ? 'linear-gradient(135deg, var(--orange) 0%, var(--orange-dark) 100%)' : 'var(--surface2)',
            color: 'var(--text)', fontSize: 14, lineHeight: 1.6,
            fontFamily: 'var(--font-body)', fontWeight: 400,
            boxShadow: isUser ? '0 4px 20px rgba(255,61,0,0.25)' : 'none',
            whiteSpace: 'pre-wrap',
          }}>{msg.content}</div>
        )}
      </div>

      {/* Tool results */}
      {msg.toolResults && msg.toolResults.map((tool, i) => (
        <div key={i} style={{ width: '85%', marginLeft: 42 }}>
          {tool.type === 'link' && <ProductCard data={tool} />}
          {tool.type === 'price' && <PriceCard data={tool} />}
          {tool.type === 'escalation' && <EscalationCard data={tool} />}
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text) => {
    const content = text || input.trim()
    if (!content || loading) return

    setStarted(true)
    setInput('')

    const newMessages = [...messages, { role: 'user', content }]
    setMessages(newMessages)
    setLoading(true)

    // Build API messages (without toolResults)
    const apiMessages = newMessages.map(({ role, content }) => ({ role, content }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        toolResults: data.toolResults || []
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Désolé, une erreur s'est produite. Veuillez réessayer dans un instant.",
        toolResults: []
      }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--black)', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-6px); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ position: 'absolute', top: -200, right: -200, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,61,0,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(17,17,17,0.95)', backdropFilter: 'blur(10px)', flexShrink: 0, zIndex: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'white', boxShadow: '0 4px 16px rgba(255,61,0,0.4)' }}>Y</div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text)', letterSpacing: '-0.3px' }}>YourDTF</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>Assistant en ligne</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {!started && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 24, animation: 'slideUp 0.5s ease forwards' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: 8 }}>Bonjour 👋</div>
              <div style={{ fontSize: 15, color: 'var(--text-muted)', fontWeight: 300 }}>Comment puis-je vous aider avec vos impressions DTF ?</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 360 }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)} style={{ padding: '9px 15px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, color: 'var(--text)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.target.style.borderColor = 'var(--orange)'; e.target.style.color = 'var(--orange)' }}
                  onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text)' }}
                >{s}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: 'white' }}>Y</div>
            <TypingDots />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px 16px', borderTop: '1px solid var(--border)', background: 'rgba(17,17,17,0.95)', backdropFilter: 'blur(10px)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '10px 12px', transition: 'border-color 0.2s' }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--orange)'}
          onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="Posez votre question..." rows={1}
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 14, resize: 'none', outline: 'none', lineHeight: 1.5, maxHeight: 100, overflowY: 'auto' }}
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading} style={{ width: 36, height: 36, borderRadius: 10, background: input.trim() && !loading ? 'var(--orange)' : 'var(--surface2)', border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0, boxShadow: input.trim() && !loading ? '0 4px 12px rgba(255,61,0,0.3)' : 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: '#444', fontFamily: 'var(--font-body)' }}>
          Propulsé par <span style={{ color: 'var(--orange)', fontWeight: 500 }}>YourDTF</span>
        </div>
      </div>
    </div>
  )
}
