# YourDTF Chatbot

Widget chatbot pour yourdtf.fr, propulsé par Claude (Anthropic).

## 🚀 Déploiement sur Vercel

### 1. Prérequis
- Un compte [Vercel](https://vercel.com) (gratuit)
- Une clé API Anthropic → [console.anthropic.com](https://console.anthropic.com)
- [Node.js](https://nodejs.org) installé sur ton PC

### 2. Installer et tester en local

```bash
npm install
npm run dev
```
Ouvre http://localhost:5173

### 3. Déployer sur Vercel

**Option A — Via l'interface Vercel (recommandé)**

1. Crée un repo GitHub et pousse le projet :
```bash
git init
git add .
git commit -m "YourDTF chatbot"
git remote add origin https://github.com/TON-COMPTE/yourdtf-chatbot.git
git push -u origin main
```

2. Sur [vercel.com](https://vercel.com) → **Add New Project** → importe ton repo GitHub

3. Dans **Environment Variables**, ajoute :
   - Nom : `ANTHROPIC_API_KEY`
   - Valeur : ta clé API (commence par `sk-ant-...`)

4. Clique **Deploy** → Vercel te donne une URL du type `https://yourdtf-chatbot.vercel.app`

---

**Option B — Via la CLI Vercel**

```bash
npm install -g vercel
vercel login
vercel
# Quand il demande les env vars, entre ANTHROPIC_API_KEY
```

---

## 🛒 Intégration Shopify

Une fois ton URL Vercel obtenue, ajoute ce code dans **Shopify > Thème > Modifier le code > theme.liquid**, juste avant `</body>` :

```html
<!-- Chatbot YourDTF -->
<div id="ydtf-btn" onclick="document.getElementById('ydtf-chat').style.display='flex'" style="position:fixed;bottom:24px;right:24px;z-index:9999;width:56px;height:56px;background:#FF3D00;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(255,61,0,0.5)">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
</div>
<div id="ydtf-chat" style="display:none;position:fixed;bottom:90px;right:24px;z-index:9999;width:400px;height:620px;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);flex-direction:column">
  <button onclick="document.getElementById('ydtf-chat').style.display='none'" style="position:absolute;top:10px;right:10px;z-index:10;background:rgba(0,0,0,0.5);color:white;border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:16px;line-height:1">✕</button>
  <iframe src="https://VOTRE-URL-VERCEL.vercel.app" width="100%" height="100%" frameborder="0"></iframe>
</div>
```

> ⚠️ Remplace `https://VOTRE-URL-VERCEL.vercel.app` par ton URL réelle.

---

## 📁 Structure du projet

```
yourdtf-chatbot/
├── api/
│   └── chat.js          ← Fonction serverless (clé API cachée côté serveur)
├── src/
│   ├── App.jsx          ← Interface du chatbot
│   ├── main.jsx         ← Point d'entrée React
│   └── index.css        ← Styles globaux
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
└── README.md
```

## ✏️ Personnalisation

Pour modifier le comportement du bot, édite le `system` prompt dans `api/chat.js`.
Tu peux y ajouter tes tarifs, tes produits spécifiques, tes délais exacts, etc.
