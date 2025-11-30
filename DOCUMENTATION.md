# DOCUMENTATION - URC (UBO Relay Chat)
# NOTE: REDIS MUST BE RESTORED AFTER MORE THA N15 DAYS OF INACTIVITY SO I MIGRATED IT 
 You can create a user or login with test/testubo(https://urc-tau-jade.vercel.app/login)

**Application de messagerie temps réel déployée sur Vercel** 
Testée en production avec utilisateurs en France et Maroc

## � Table des matières
1. [ Quick Start](#-quick-start-5-minutes)
2. [ Projet](#-projet)
3. [ Exemples de Code](#-exemples-de-code---usage-pratique)
4. [ Architecture API](#architecture-api)
5. [ Architecture Frontend](#architecture-frontend---composants-react)
6. [ Sécurité & Code](#architecture-code---détails-techniques)
7. [ Tests](#tests-postman)
8. [ Diagrammes](#-diagrammes-darchitecture)
9. [ Flux utilisateur](#flux-utilisateur---scenarios)
10. [ Déploiement Vercel](#déploiement-sur-vercel)
11. [ FAQ](#-faq---questions-fréquentes)
12. [ Améliorations](#-améliorations-futures-envisagées)
13. [ Troubleshooting](#troubleshooting)
14. [ Crédits](#crédits--remerciements)

##  Quick Start 

```bash
# 1. Cloner et installer
git clone https://github.com/medbenaissa1/urc.git
cd urc && npm install

# 2. Configurer Vercel
vercel link
vercel env pull .env.development.local
export $(cat .env.development.local | xargs)

# 3. Lancer en local
vercel dev

# 4. Accéder à l'app
# http://localhost:3000
# Login: test / testubo
```

##  Projet

Le travail pratique a été fait personnellement ; certaines fonctions ont ensuite été raffinées avec l'aide de modèles LLM. Le style visuel et la mise en forme ont été conçus entièrement par des LLMs. 
Les API ont été testées via Postman. Merci à M. Thibaut pour son accompagnement pendant les séances de TP.

### Objectifs du TP
-  Créer une application IRC/WhatsApp-like
-  Intégrer PostgreSQL pour données persistantes
-  Intégrer Redis pour sessions temps réel
-  Déployer sur Vercel Serverless
-  Tester en production avec utilisateurs réels

## Arborescence (exemple)
- src/  
- public/  
- package.json  
- README.md  
- DOCUMENTATION.md

(adaptez selon votre projet)

## Prérequis
- Node.js >= 14
- npm ou yarn
- Postman (pour tests API)

## Installation

### Prérequis
- **Node.js** >= 16 (avec npm ou yarn)
- **Git**
- **Vercel CLI** (pour déploiement local)
- **Postman** (optionnel, pour tests API)
- **Compte Vercel** avec PostgreSQL (Neon) + Redis (Upstash) configurés

### Étapes d'installation locale

1. **Cloner le dépôt**
```bash
git clone https://github.com/medbenaissa1/urc.git
cd urc
```

2. **Installer les dépendances**
```bash
npm install
# ou
yarn install
```

3. **Configurer Vercel localement**
```bash
vercel link
# Suivre les prompts pour lier au projet Vercel existant
```

4. **Récupérer les variables d'environnement**
```bash
vercel env pull .env.development.local
# Charge les variables: POSTGRES_PRISMA_URL, KV_URL, KV_REST_API_TOKEN
```

5. **Initialiser la base de données**
```bash
# Via Vercel Dashboard:
# 1. Aller sur Neon Database
# 2. SQL Editor
# 3. Copier-coller contenu de scripts/db.sql
# 4. Exécuter
```

6. **Lancer l'application en développement**
```bash
vercel dev
# Accéder à http://localhost:3000
```

### Variables d'environnement requises
```
POSTGRES_PRISMA_URL=postgresql://...
KV_URL=redis://...
KV_REST_API_TOKEN=...
```

### Scripts disponibles
```bash
npm run start        # Lance React en dev (port 3000)
npm run build        # Build production
npm run test         # Lance tests
npm run eject        # Éject configuration (irréversible)
vercel dev          # Lance Vercel + React (recommandé)
```

##  Exemples de Code - Usage pratique

### Exemple 1: Authentification utilisateur (Frontend)
```tsx
import { loginUser } from "./user/loginApi";
import { useSession } from "./store/session";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useSession((state) => state.setAuth);

  const handleLogin = async (username, password) => {
    try {
      const result = await loginUser({
        username,
        password,
        user_id: -1
      }, 
      (result) => {
        setAuth(result.token, result.username, result.id);
        navigate("/");
      },
      (error) => {
        console.error("Login failed:", error.message);
      });
    } catch (error) {
      console.error("Login error:", error);
    }
  };
}
```

### Exemple 2: Charger et afficher les messages
```jsx
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export function MessagesList({ peerId }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await apiFetch(`/api/message?peerId=${peerId}`);
        setMessages(data);
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [peerId]);

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>
          <strong>{msg.from}:</strong>
          {msg.type === "image" ? (
            <img src={msg.content} alt="image" />
          ) : (
            <p>{msg.content}</p>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Exemple 3: Envoyer un message texte
```javascript
import { apiFetch } from "../lib/api";

async function sendMessage(peerId, content) {
  try {
    const response = await apiFetch("/api/message", {
      method: "POST",
      body: JSON.stringify({
        to: peerId,
        content: content,
        type: "text"
      })
    });
    
    console.log("Message sent with ID:", response.id);
    return response;
  } catch (error) {
    console.error("Failed to send message:", error);
    throw error;
  }
}
```

### Exemple 4: Envoyer une image
```javascript
async function sendImage(peerId, imageFile) {
  const reader = new FileReader();
  
  reader.onload = async (e) => {
    const base64Image = e.target.result;
    
    const response = await apiFetch("/api/message", {
      method: "POST",
      body: JSON.stringify({
        to: peerId,
        content: base64Image,
        type: "image"
      })
    });
    
    console.log("Image sent:", response.id);
  };
  
  reader.readAsDataURL(imageFile);
}
```

### Exemple 5: Utiliser le store Zustand
```javascript
import { useChat } from "../store/chat";

export function ChatUI() {
  const users = useChat((state) => state.users);
  const messages = useChat((state) => state.messages);
  const loadUsers = useChat((state) => state.loadUsers);
  const selectUser = useChat((state) => state.selectUser);
  const sendMessage = useChat((state) => state.sendMessage);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleUserClick = (userId) => {
    selectUser(userId);
  };

  return (
    <div>
      {users.map((user) => (
        <button key={user.user_id} onClick={() => handleUserClick(user.user_id)}>
          {user.username}
        </button>
      ))}
      {messages.map((msg) => (
        <div key={msg.id}>{msg.content}</div>
      ))}
    </div>
  );
}
```

## Architecture API

### Infrastructure Technique
L'application utilise une architecture moderne serverless avec :

- **Frontend** : React + TypeScript + Material-UI (Zustand pour state management)
- **Backend** : Vercel Edge/Node Functions (API Routes)
- **Base de données** : PostgreSQL (Neon)
- **Cache sessions** : Redis (Upstash)
- **Authentification** : JWT Tokens + Session Redis

### Routes API détaillées

#### 1. **POST /api/login** - Authentification utilisateur
**Runtime**: Edge  
**Sécurité**: Hachage SHA-256 (username + password)

```javascript
// Request
POST /api/login
Content-Type: application/json

{
  "username": "test",
  "password": "testubo"
}

// Response (200 OK)
{
  "token": "uuid-string",
  "username": "test",
  "externalId": "uuid-string",
  "id": 1
}

// Response (401 UNAUTHORIZED)
{
  "code": "UNAUTHORIZED",
  "message": "Identifiant ou mot de passe incorrect"
}
```

**Fonctionnement**:
- Hache le mot de passe avec `SHA-256`
- Cherche l'utilisateur dans PostgreSQL
- Génère un JWT (UUID) stocké dans Redis avec TTL de 3600 secondes
- Met à jour la date de dernière connexion

#### 2. **POST /api/register** - Enregistrement utilisateur
**Runtime**: Edge  
**Validation**: Vérification doublon (username + email)

```javascript
// Request
POST /api/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@univ-brest.fr",
  "password": "securepassword"
}

// Response (201 Created)
{
  "message": "Utilisateur créé avec succès"
}

// Response (400 Bad Request)
{
  "message": "Utilisateur déjà existant"
}
```

**Fonctionnement**:
- Valide les champs obligatoires
- Vérifie l'unicité du username et email
- Hache le mot de passe (SHA-256)
- Crée un `external_id` unique (UUID)
- Insère l'utilisateur en base de données

#### 3. **GET /api/users** - Liste des utilisateurs connectés
**Runtime**: Edge  
**Authentification**: Requise (Bearer Token)

```javascript
// Request (avec token)
GET /api/users
Authorization: Bearer <token>

// Response (200 OK)
[
  {
    "user_id": 1,
    "username": "test",
    "last_login": "30/11/2025 14:30"
  },
  {
    "user_id": 2,
    "username": "john",
    "last_login": "30/11/2025 13:45"
  }
]

// Response (401 UNAUTHORIZED)
{
  "code": "UNAUTHORIZED",
  "message": "Session expired"
}
```

**Fonctionnement**:
- Valide le token en le cherchant dans le cache Redis
- Retourne la liste de tous les utilisateurs triés par dernière connexion
- Formate la date au format français (DD/MM/YYYY HH24:MI)

#### 4. **GET /api/message?peerId=<id>** - Récupérer les messages
**Runtime**: Node.js  
**Authentification**: Requise  
**Structure Redis**: `conv:<userId1>:<userId2>` (clés normalisées)

```javascript
// Request
GET /api/message?peerId=2
Authorization: Bearer <token>

// Response (200 OK) - Messages triés chronologiquement
[
  {
    "id": "uuid",
    "from": 1,
    "to": 2,
    "content": "Salut!",
    "timestamp": "2025-11-30T14:30:00Z",
    "type": "text"
  },
  {
    "id": "uuid",
    "from": 2,
    "to": 1,
    "content": "data:image/...",
    "timestamp": "2025-11-30T14:31:00Z",
    "type": "image"
  }
]
```

**Fonctionnement**:
- Valide la session utilisateur
- Crée une clé de conversation normalisée (indépendante du sens)
- Récupère tous les messages de la liste Redis
- Parse et inverse l'ordre chronologique

#### 5. **POST /api/message** - Envoyer un message
**Runtime**: Node.js  
**Authentification**: Requise  
**Stockage**: Redis Lists

```javascript
// Request
POST /api/message
Authorization: Bearer <token>
Content-Type: application/json

{
  "to": 2,
  "content": "Coucou!",
  "type": "text"
}

// ou pour les images

{
  "to": 2,
  "content": "data:image/png;base64,...",
  "type": "image"
}

// Response (201 Created)
{
  "id": "uuid-generated"
}
```

**Fonctionnement**:
- Valide le token et l'ID du destinataire
- Génère un ID unique (UUID)
- Crée l'objet message avec timestamp
- Stock dans la liste Redis avec clé normalisée
- Supporte texte et images Base64

#### 6. **GET /api/beams** - Notifications Push
**Runtime**: Node.js  
**Authentification**: Requise  
**Service**: Push API Beams

```javascript
// Request
GET /api/beams
Authorization: Bearer <token>

// Response (200 OK)
{
  "publishKey": "instance-key",
  "userId": "user-123"
}
```

### Gestion des Sessions

```javascript
// src/lib/session.js - Validation du token
async function checkSession(request) {
  const token = request.headers.get("authorization");
  const user = await redis.get(token.replace("Bearer ", ""));
  if (!user) return null;
  return user; // { id, username, email, externalId }
}

// src/store/session.js - State Zustand
export const useSession = create((set) => ({
  token: sessionStorage.getItem("token"),
  user: sessionStorage.getItem("username"),
  
  setAuth: (token, username, id) => {
    sessionStorage.setItem("token", token);
    set({ token, user: { username, id } });
  },
  
  logout: () => {
    sessionStorage.removeItem("token");
    set({ token: null, user: null });
  }
}));
```

### Gestion des Erreurs API

```javascript
// api/api.js - Wrapper fetch avec authentification
export async function apiFetch(path, init = {}) {
  const token = useSession.getState().token;
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  
  const res = await fetch(path, { ...init, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

### Schéma Base de Données

```sql
-- Table Utilisateurs
CREATE TABLE users (
   user_id serial PRIMARY KEY,
   username VARCHAR(50) UNIQUE NOT NULL,
   password VARCHAR(100) NOT NULL,  -- SHA-256 en Base64
   email VARCHAR(255) UNIQUE NOT NULL,
   created_on TIMESTAMP NOT NULL,
   last_login TIMESTAMP,
   external_id VARCHAR(50) UNIQUE NOT NULL
);

-- Table Rooms (salons de chat)
CREATE TABLE rooms (
   room_id serial PRIMARY KEY,
   name VARCHAR(50) UNIQUE NOT NULL,
   created_on TIMESTAMP NOT NULL,
   created_by INTEGER NOT NULL
);

-- Utilisateur de test
INSERT INTO users VALUES (DEFAULT, 'test', 'gcrjEewWyAuYskG3dd6gFTqsC6/SKRsbTZ+g1XHDO10=', 
                         'test@univ-brest.fr', NOW(), NULL, 'ac7a25a9-bcc5-4fba-8a3d-d42acda26949');
```

### Stack Technologique détaillé

| Domaine | Technologie | Usage |
|---------|-------------|-------|
| Frontend | React 18 | UI & Composants |
| Langage | TypeScript/JSX | Type safety |
| UI Components | Material-UI (MUI) | Design system |
| State Mgmt | Zustand | Global state (auth, chat) |
| Router | React Router v6 | Navigation |
| Backend | Vercel Functions | Serverless API |
| Database | PostgreSQL (Neon) | Données persistantes |
| Session Cache | Redis (Upstash) | JWT + Messages temps réel |
| Crypto | Web Crypto API | Hachage SHA-256 |
| Notifications | Beams API | Push notifications |

## Tests (Postman)

### Collection Postman - Exemples de tests

#### 1. Enregistrement (Register)
```
POST https://urc.vercel.app/api/register
Content-Type: application/json

Body (raw):
{
  "username": "newuser",
  "email": "newuser@univ-brest.fr",
  "password": "password123"
}

Expected Response (201):
{
  "message": "Utilisateur créé avec succès"
}
```

#### 2. Connexion (Login)
```
POST https://urc.vercel.app/api/login
Content-Type: application/json

Body (raw):
{
  "username": "test",
  "password": "testubo"
}

Expected Response (200):
{
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "username": "test",
  "externalId": "ac7a25a9-bcc5-4fba-8a3d-d42acda26949",
  "id": 1
}
```

#### 3. Récupérer les utilisateurs
```
GET https://urc.vercel.app/api/users
Authorization: Bearer 550e8400-e29b-41d4-a716-446655440000

Expected Response (200):
[
  {
    "user_id": 1,
    "username": "test",
    "last_login": "30/11/2025 14:30"
  }
]

Error Response (401):
{
  "code": "UNAUTHORIZED",
  "message": "Session expired"
}
```

#### 4. Récupérer les messages
```
GET https://urc.vercel.app/api/message?peerId=2
Authorization: Bearer 550e8400-e29b-41d4-a716-446655440000

Expected Response (200):
[
  {
    "id": "msg-uuid",
    "from": 1,
    "to": 2,
    "content": "Hello!",
    "timestamp": "2025-11-30T14:30:00Z",
    "type": "text"
  }
]
```

#### 5. Envoyer un message texte
```
POST https://urc.vercel.app/api/message
Authorization: Bearer 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

Body (raw):
{
  "to": 2,
  "content": "Hello from user 1!",
  "type": "text"
}

Expected Response (201):
{
  "id": "uuid-generated"
}
```

#### 6. Envoyer une image
```
POST https://urc.vercel.app/api/message
Authorization: Bearer 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

Body (raw):
{
  "to": 2,
  "content": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "type": "image"
}

Expected Response (201):
{
  "id": "uuid-generated"
}
```

### Conseils de test
- Créer 2 utilisateurs différents pour tester les messages entre utilisateurs
- Copier le token reçu lors du login et l'utiliser dans les requêtes protégées
- Vérifier les headers : `Authorization: Bearer <token>`
- Les timestamps sont en UTC ISO format
- Les images doivent être encodées en Base64 avec le préfixe `data:image/...`
- Vérifier que les messages reçoivent un ID unique (UUID)

## Architecture Frontend - Composants React

### Structure des Composants

```
src/user/
├── Login.tsx          # Page de connexion (non authentifiée)
├── Register.jsx       # Page d'enregistrement
├── Home.jsx          # Accueil après connexion
├── Messenger.jsx     # Page messagerie (avec UsersList + MessagesList)
├── UsersList.jsx     # Liste des utilisateurs
├── MessagesList.jsx  # Affichage des messages
└── loginApi.ts       # Appels API authentification

src/store/
├── session.js        # Zustand: Gestion token + user
└── chat.js          # Zustand: Gestion utilisateurs + messages + refresh

src/lib/
├── api.js           # Wrapper fetch avec Bearer token
├── base64.js        # Conversion Base64 pour hachage
├── session.js       # Validation serveur (vérification token Redis)
└── urlUtils.js      # Utilitaires URLs

src/model/
├── common.ts        # Types TypeScript
└── CustomError.ts   # Classe erreur personnalisée
```

### Flux d'authentification

```
1. Utilisateur arrive → /login (public)
   ↓
2. Saisit username + password → POST /api/login
   ↓
3. Serveur valide → Redis stocke token (3600s) + sessionStorage.setItem('token')
   ↓
4. Frontend stocke dans Zustand useSession.setAuth(token, username, id)
   ↓
5. Accès à / (Home) protégé via <Protected> wrapper
   ↓
6. Peut accéder à /messages/:userId (Messenger)
   ↓
7. Logout → sessionStorage.removeItem + redis.del(token)
```

### Composant Protected (Route Guard)

```javascript
// src/App.js
function Protected({ children }) {
  const token = useSession((s) => s.token) || 
                sessionStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

// Utilisation
<Route path="/" element={<Protected><Home /></Protected>} />
<Route path="/messages/*" element={<Protected><Messenger /></Protected>} />
```

### State Management (Zustand)

#### Session Store
```javascript
// src/store/session.js
export const useSession = create((set) => ({
  // État initial
  token: sessionStorage.getItem("token") || null,
  user: {
    username: sessionStorage.getItem("username"),
    id: sessionStorage.getItem("user_id")
  },
  
  // Après login
  setAuth: (token, username, id) => {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("username", username);
    sessionStorage.setItem("user_id", id);
    set({ token, user: { username, id } });
  },
  
  // Logout
  logout: () => {
    sessionStorage.clear();
    set({ token: null, user: null });
  }
}));

// Utilisation dans composants
const token = useSession((s) => s.token);
const { setAuth, logout } = useSession();
```

#### Chat Store
```javascript
// src/store/chat.js
export const useChat = create((set) => ({
  users: [],
  selectedUserId: null,
  messages: [],
  
  loadUsers: async () => {
    const users = await apiFetch("/api/users");
    set({ users });
  },
  
  selectUser: (userId) => {
    set({ selectedUserId: userId, messages: [] });
  },
  
  sendMessage: async (to, content, type) => {
    const { id } = await apiFetch("/api/message", {
      method: "POST",
      body: JSON.stringify({ to, content, type })
    });
    set(state => ({
      messages: [...state.messages, { 
        id, from: state.currentUser, to, content, type,
        timestamp: new Date().toISOString()
      }]
    }));
  },
  
  // Auto-refresh des messages (polling toutes les 3s)
  startAutoRefresh: (interval) => {
    const timer = setInterval(async () => {
      const messages = await apiFetch(`/api/message?peerId=${selectedUserId}`);
      set({ messages });
    }, interval);
    set({ _refreshTimer: timer });
  },
  
  stopAutoRefresh: () => {
    clearInterval(state._refreshTimer);
  }
}));
```

### Composants principaux

#### Login.tsx
- Formulaire avec validation
- Hachage sécurisé du mot de passe (client-side)
- Gestion des erreurs
- Navigation vers Home après succès
- Icône visibilité mot de passe

#### Messenger.jsx
- Layout 2 colonnes : Sidebar (users) + Messages
- Charge la liste des utilisateurs au montage
- Auto-refresh des messages (polling 3s)
- Logout button
- Affiche le nom de l'utilisateur sélectionné

#### MessagesList.jsx
- Affiche les messages dans l'ordre chronologique
- Support texte + images Base64
- Distingue les messages envoyés vs reçus
- Formulaire d'envoi avec bouton + champ texte

#### UsersList.jsx
- Liste scrollable des utilisateurs triés par dernière connexion
- Highlight de l'utilisateur sélectionné
- Click pour ouvrir la conversation

### Material-UI Theme

```javascript
// src/theme.js
const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
    background: { default: "#fafafa" }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
  }
});
```

### Style et UI
- Le style visuel a été entièrement réalisé avec l'aide de LLMs.
- Material-UI assure une cohérence visuelle et responsive design.
- Les décisions de design ont été appliquées puis ajustées manuellement si nécessaire.
- Utilisation de flexbox et grid pour le layout
- Support du dark mode potentiel

## Architecture Code - Détails Techniques

### Sécurité

#### Hachage des mots de passe
```javascript
// Utilise SHA-256 + username pour créer un hash unique
const hash = await crypto.subtle.digest(
  'SHA-256', 
  stringToArrayBuffer(username + password)
);
const hashed64 = arrayBufferToBase64(hash);
```
-  Crypto Web API native (navigateur + Node.js)
-  SHA-256 (sécurité cryptographique moderne)
-  Encoding Base64 pour stockage BDD

#### Validation des sessions
```javascript
// Chaque requête vérifie le token dans Redis
export async function checkSession(request) {
  const token = extractTokenFromHeaders(request);
  const user = await redis.get(token);
  if (!user) return null; // Session expirée
  return user; // Retourne { id, username, email, externalId }
}
```
-  Token stocké en cache Redis (TTL 1 heure)
-  Validation côté serveur sur chaque API call
-  Nettoyage automatique après expiration

#### Token Bearer
```javascript
// apiFetch ajoute automatiquement l'Authorization header
headers.set("Authorization", `Bearer ${token}`);
```

### Gestion des Erreurs

#### CustomError Model
```typescript
// src/model/CustomError.ts
export class CustomError {
  code: string;      // "UNAUTHORIZED", "VALIDATION_ERROR", etc.
  message: string;   // Message lisible pour l'utilisateur
  status?: number;   // Code HTTP (401, 400, 500)
  timestamp?: string; // Quand l'erreur s'est produite
}
```

#### Propagation d'erreurs
```javascript
// Frontend
try {
  await loginUser(...);
} catch (error) {
  setError(new CustomError(error.code, error.message));
  // Affiche l'erreur dans une Alert MUI
}
```

### Performance & Optimisations

#### Auto-refresh des messages
```javascript
const startAutoRefresh = (interval = 3000) => {
  const timer = setInterval(async () => {
    const messages = await apiFetch(`/api/message?peerId=${selectedUserId}`);
    set({ messages });
  }, interval);
};
```
- Polling toutes les 3 secondes (configurable)
- Récupère uniquement les messages de la conversation active
- Stop automatique au changement d'utilisateur ou logout

#### Optimisations Redis
```javascript
// Clé conversation normalisée (ordre indépendant)
function convKey(a, b) {
  const [x, y] = [String(a), String(b)].sort();
  return `conv:${x}:${y}`;
}
// Avantage: Une seule liste pour bidirectionnel
```

#### Sessions en Redis (au lieu de DB)
-  Temps d'accès < 10ms (vs 100ms+ pour PostgreSQL)
-  TTL automatique (expiration naturelle)
-  In-memory (très rapide pour lectures intensives)

### Scalabilité

#### Serverless avec Vercel Functions
- Auto-scaling selon le trafic
-  Pas d'infra à gérer (déploiement Git)
-  Edge runtime pour login/register (latence ultra-basse)
-  Node.js runtime pour message.js (accès BD + Redis)

#### Vercel Postgres (Neon)
- Réplication automatique
- Sauvegardes journalières
- Connection pooling intégré

#### Upstash Redis
- Multi-région pour latence
- Persistance avec backup automatique
- Scaling transparent

### Remarques sur le code
- **Développement** : Code réalisé personnellement
- **Raffinements** : Certaines fonctions critiques améliorées avec LLM (lisibilité, robustesse)
- **Testing** : Postman pour API endpoints, navigation manuelle pour UI
- **Déploiement** : Testé en production avec utilisateurs en France et Maroc
- **Conventions** : 
  - CamelCase pour variables/fonctions
  - PascalCase pour composants React
  - Suffixe `.ts` pour TypeScript, `.js` pour JavaScript
  - Préfixe `use` pour React hooks & Zustand stores

## Troubleshooting

### Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `401 UNAUTHORIZED` | Token expiré ou invalide | Re-login ou verifier Redis connection |
| `400 Bad Request` | Username/email déjà utilisé | Choisir un nouveau username |
| `ECONNREFUSED (Redis)` | KV_URL invalide | Vérifier `vercel env pull` ou env variables |
| `ECONNREFUSED (PostgreSQL)` | BDD inaccessible | Vérifier POSTGRES_PRISMA_URL |
| Messages non synchronisés | Session Redis expirée | Token expiré, re-login nécessaire |
| Images apparaissent vides | Décodage Base64 échoué | Vérifier format `data:image/...;base64,...` |
| Port 3000 occupé | Autre process utilise le port | Tuer le process ou utiliser autre port |


## Diagrammes d'Architecture

### Architecture générale
```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ React App (Login, Register, Messenger)               │ │
│  │ - Zustand State Management (session + chat)          │ │
│  │ - Material-UI Components                             │ │
│  │ - React Router (Login → Home → Messenger)            │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ↓                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Storage: sessionStorage (token, username, user_id)    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
         ↓ HTTP(S) + Bearer Token ↓
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL EDGE NETWORK                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ /api/register - Edge Runtime                         │ │
│  │ /api/login    - Edge Runtime (SHA-256 crypto)        │ │
│  │ /api/users    - Node Runtime (SQL query)             │ │
│  │ /api/message  - Node Runtime (Redis list ops)        │ │
│  │ /api/beams    - Node Runtime (Push notifications)    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
         ↓                              ↓
┌──────────────────────┐      ┌──────────────────────┐
│  PostgreSQL (Neon)   │      │  Redis (Upstash)     │
│  ┌────────────────┐  │      │  ┌────────────────┐  │
│  │ users table    │  │      │  │ tokens (TTL)   │  │
│  │ rooms table    │  │      │  │ conv:*:* lists │  │
│  │ (future msgs)  │  │      │  │ users hset     │  │
│  └────────────────┘  │      │  └────────────────┘  │
└──────────────────────┘      └──────────────────────┘
```

### Flux authentification
```
┌──────────────┐
│   Client     │
└────────┬─────┘
         │ POST /api/login (username, password)
         ↓
    ┌─────────────┐
    │ Vercel Edge │
    │  login.js   │
    └────────┬────┘
         │ SHA-256(username+password)
         ↓
    ┌──────────────────────┐
    │  PostgreSQL (Neon)   │
    │  SELECT user WHERE   │
    │  username & password │
    └────────┬─────────────┘
         │ Trouvé ✓
         ↓
    ┌──────────────────────┐
    │   Redis (Upstash)    │
    │  SET token ← user    │
    │  (TTL: 3600s)        │
    └────────┬─────────────┘
         │ Response: {token, username, id}
         ↓
┌──────────────────┐
│  sessionStorage  │
│  localStorage    │
│  Zustand state   │
└──────────────────┘
```

### Flux envoi de message
```
┌──────────────────────────┐
│   User 1 (Client)        │
│   Tape: "Hello user 2"   │
└────────┬─────────────────┘
         │ POST /api/message
         │ {to: 2, content: "...", type: "text"}
         │ Authorization: Bearer <token>
         ↓
    ┌──────────────────────────────┐
    │  Vercel Node Runtime         │
    │  message.js handler          │
    │  1. Valide token via Redis   │
    │  2. Génère UUID pour message │
    │  3. Crée clé conv:1:2        │
    │  4. Push dans Redis list     │
    └────────┬─────────────────────┘
             │
    ┌────────▼──────────┐
    │  Redis Upstash    │
    │  conv:1:2 list    │
    │  [msg1, msg2, ...] 
    └─────────────────────┘

┌──────────────────────────┐
│   User 2 (Client)        │
│   Auto-refresh (3s)      │
│   GET /api/message       │
│   ?peerId=1              │
└────────┬─────────────────┘
         │
    ┌────────▼──────────────────┐
    │ Vercel Node Runtime        │
    │ message.js handler         │
    │ 1. Valide token            │
    │ 2. READ conv:1:2 from      │
    │    Redis                   │
    └────────┬───────────────────┘
             │
    ┌────────▼──────────────┐
    │  Redis              │
    │  LRANGE conv:1:2    │
    └────────┬─────────────┘
             │ Response: [msg1, msg2, ...]
             ↓
    ┌────────────────────┐
    │  User 2 voit le    │
    │  message: "Hello"  │
    │  Conversation   │
    └────────────────────┘
```

## Flux utilisateur - Scenarios

### Scenario 1: Nouvel utilisateur
```
1. Accède à https://urc.vercel.app/
   ↓
2. Redirigé vers /login (pas de token)
   ↓
3. Clique sur "Je n'ai pas de compte" → /register
   ↓
4. Remplit username, email, password
   ↓
5. POST /api/register (validation doublon)
   ↓
6. Utilisateur créé en PostgreSQL (external_id généré)
   ↓
7. Redirigé vers login
   ↓
8. Saisit credentials → POST /api/login
   ↓
9. Token généré + stocké Redis (3600s)
   ↓
10. Frontend: setAuth(token, username, userId)
    ↓
11. Redirigé vers /
```

### Scenario 2: Utilisateur existant se connecte
```
1. À /login
   ↓
2. Saisit "test" / "testubo"
   ↓
3. Backend valide le SHA-256
   ↓
4. Génère UUID token → redis.set(token, user, {ex: 3600})
   ↓
5. Retourne token + user data
   ↓
6. Frontend: 
   - sessionStorage.setItem('token', token)
   - Zustand setAuth()
   ↓
7. Navigate vers /
```

### Scenario 3: Conversation entre deux utilisateurs
```
User1                           User2
  │
  ├─→ GET /api/users
  │   (Bearer token1)
  │   ← [user2, user3, ...]
  │
  ├─→ Clique sur user2
  │   (URL: /messages/2)
  │   │
  │   ├─→ GET /api/message?peerId=2
  │       (Bearer token1)
  │       ← [messages]
  │       │
  │       └─ setInterval(3s):
  │           GET /api/message?peerId=2
  │
  ├─→ Tape "Salut!"
      │
      └─→ POST /api/message
          {to: 2, content: "Salut!", type: "text"}
          (Bearer token1)
          ← {id: "msg-uuid"}
          │
          └─ Message ajouté à Redis
             Key: conv:1:2 (normalisée)
             Value: [JSON serialized message]
```

### Scenario 4: Auto-refresh des messages (Polling)
```
Time  User1 Action                 User2 Action
────────────────────────────────────────────────
0s    Ouvre conversation 2    
      startAutoRefresh(3000)

3s    [auto] GET /api/message      Envoie "Hello!"
      ?peerId=2                    POST /api/message
      ← [] vide
                                   ← {id: "msg123"}

6s    [auto] GET /api/message      
      ?peerId=2
      ← [{from:2, content:"Hello"}]
      Affiche message 

9s    Répond "Hi!"
      POST /api/message
      ← {id: "msg456"}

12s   [auto] GET /api/message
      ← [{...}, {from:1, content:"Hi!"}]
```

### Scenario 5: Envoi d'image
```
1. User1 sélectionne une image (input file)
   ↓
2. Lecture avec FileReader API → Base64
   ↓
3. POST /api/message
   {
     to: 2,
     content: "data:image/png;base64,iVBORw0K...",
     type: "image"
   }
   ↓
4. Redis stocke le message complet (Base64 inclus)
   ↓
5. User2 reçoit au prochain refresh
   ↓
6. Frontend détecte type="image"
   ↓
7. Affiche <img src={content} /> (Base64 natif)
```

### Scenario 6: Logout
```
1. User1 clique bouton Logout
   ↓
2. stopAutoRefresh() → clearInterval()
   ↓
3. logout() → sessionStorage.removeItem('token')
   ↓
4. Zustand: set({token: null, user: null})
   ↓
5. Navigate vers /login
   ↓
6. Protected wrapper bloque accès aux routes
   
Note: Redis token reste jusqu'à expiration (3600s)
      mais nouveau refresh ne peut pas valider
```

## Déploiement sur Vercel

### Configuration Vercel
L'application est déployée sur **Vercel** avec l'intégration complète des services suivants :

- **Base de données PostgreSQL (Neon)** : Stockage des utilisateurs et des données d'application
- **Cache Redis (Upstash)** : Gestion des sessions utilisateur et des données en temps réel


### Lien de déploiement
🚀 [Application en production](https://urc-tau-jade.vercel.app/login)



### Tests en production
 **Application testée et validée en temps réel** avec un utilisateur en **Maroc**.
- La connexion utilisateur fonctionne correctement
- La messagerie en temps réel fonctionne sans latence perceptible
- Les sessions Redis se maintiennent correctement
- La synchronisation des messages est fluide

Tous les tests ont été réussis, confirmant la stabilité et la fiabilité de l'application en environnement de production.

##  FAQ - Questions Fréquentes

### Q: Comment puis-je tester l'app localement ?
**R:** Suivez la section "Quick Start" au début. Essentiellement:
```bash
vercel link && vercel env pull && export $(cat .env.development.local | xargs) && vercel dev
```
Puis accédez à `http://localhost:3000` et loggez-vous avec `test / testubo`

### Q: Pourquoi le polling au lieu des WebSockets ?
**R:** Le polling est plus simple à implémenter sur Vercel (pas besoin de connexions persistent). Pour production haute-charge, considérez Socket.io ou Websockets (voir "Améliorations futures").

### Q: Où sont stockées les images envoyées ?
**R:** Actuellement, les images sont encodées en Base64 et stockées directement dans Redis. Pour des images plus volumineuses, utilisez un S3 bucket Vercel.

### Q: Comment gérer les utilisateurs hors ligne ?
**R:** Les utilisateurs restent visibles dans la liste même hors ligne (basé sur la table 
PostgreSQL, pas les sessions). Les sessions Redis expirent après 1 heure. Idée d'amélioration: 
ajouter un champ "last_seen" et un statut online.

### Q: Comment réinitialiser les données ?
**R:** Via le Neon Database editor dans Vercel Dashboard:
```sql
DELETE FROM messages;  -- Pas de table messages, data in Redis
DELETE FROM users WHERE user_id > 1;
DELETE FROM rooms;
```

### Q: Pourquoi les images ne s'affichent pas ?
**R:** Vérifiez que le Base64 est correct et commence par `data:image/png;base64,...`. Le navigateur ne peut pas décoder les Base64 malformés.

### Q: Comment ajouter un nouvel utilisateur de test ?
**R:** Via Neon Editor:
```sql
INSERT INTO users (username, password, email, created_on, external_id)
VALUES ('newuser', '<sha256-hash>', 'newuser@example.com', NOW(), gen_random_uuid()::text);
```

Pour le hash, utilisez `crypto.subtle.digest('SHA-256', ...)` en JavaScript.

### Q: Comment voir les logs serveur ?
**R:** 
- **Local**: `vercel dev` affiche les logs en console
- **Production**: `vercel logs <project-id>`
- **Vercel Dashboard**: Onglet "Deployments" → "Functions Logs"

### Q: Les messages sont-ils persistants ?
**R:** Non actuellement. Ils sont stockés en Redis en mémoire. Pour persistance:
- Implémenter une table PostgreSQL `messages`
- Synchroniser Redis → PostgreSQL périodiquement
- Charger les anciens messages depuis PostgreSQL

### Q: Comment sécuriser les API endpoints ?
**R:** Actuellement, seul le token est validé. Pour plus de sécurité:
- Rate limiting par IP (utiliser Vercel Middleware)
- CORS restrictif (Origin whitelist)
- HTTPS only + Security headers

### Q: Puis-je déployer cette app ailleurs qu'à Vercel ?
**R:** Oui! Elle utilise PostgreSQL standard et Redis standard. À adapter pour:
- Docker + Kubernetes
- AWS Lambda + RDS + ElastiCache
- Google Cloud Functions + Cloud SQL + Memorystore
- Heroku + PostgreSQL + Redis

Seules les variables d'env changent.

## Améliorations futures envisagées

### Fonctionnalités manquantes
- [ ] **Salons de chat (Rooms)** : Tables créées mais non intégrées UI
- [ ] **WebSocket** : Remplacer polling par connection temps réel
- [ ] **Typing indicators** : "X is typing..."
- [ ] **Read receipts** : Marquer messages comme lus
- [ ] **Mentions** : @username pour notifier
- [ ] **Emojis & réactions** : Support emojis sur messages

### Sécurité
- [ ] **2FA** : Authentification double facteur (TOTP)
- [ ] **HTTPS only** : Vérifier HSTS headers
- [ ] **Rate limiting** : Limiter appels API par IP
- [ ] **Password strength validation** : Entropy check client
- [ ] **Account recovery** : Oubli de mot de passe via email
- [ ] **Audit logs** : Tracer actions utilisateurs

### Performance
- [ ] **Pagination** : Messages & users avec cursors
- [ ] **Message compression** : Gzip Base64 images
- [ ] **Lazy loading** : Images chargées à demande
- [ ] **Service Worker** : Offline support
- [ ] **Cache strategy** : Tanstack Query au lieu Zustand
- [ ] **Code splitting** : Lazy routes React

### UI/UX
- [ ] **Dark mode** : Toggle theme
- [ ] **Mobile responsive** : Tester sur mobile
- [ ] **Animations** : Framer Motion transitions
- [ ] **Notifications sonores** : Audio alert
- [ ] **File upload** : Au lieu copier-coller Base64
- [ ] **Message search** : Rechercher dans historique
- [ ] **User profiles** : Avatar, bio, statut online

### Infrastructure
- [ ] **Database replication** : Backup automatique
- [ ] **CDN** : Images via Vercel Image Optimization
- [ ] **Monitoring** : Sentry ou DataDog
- [ ] **Load testing** : k6 ou Artillery tests
- [ ] **Container deployment** : Docker + Kubernetes
- [ ] **API documentation** : Swagger/OpenAPI

### Tests
- [ ] **Unit tests** : Vitest pour functions
- [ ] **Integration tests** : Supertest pour API
- [ ] **E2E tests** : Cypress ou Playwright
- [ ] **Performance tests** : Lighthouse CI
- [ ] **Security scanning** : OWASP ZAP

##  Ressources Utiles Utilisés

### Documentation officielle
- [React](https://react.dev/) - Framework UI
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [Material-UI (MUI)](https://mui.com/) - Components library
- [React Router](https://reactrouter.com/) - Routing
- [Vercel](https://vercel.com/docs) - Deployment & Functions
- [PostgreSQL](https://www.postgresql.org/docs/) - Database
- [Redis](https://redis.io/docs/) - Cache & Sessions
- [TypeScript](https://www.typescriptlang.org/docs/) - Type safety

### Outils essentiels
- [Postman](https://www.postman.com/) - API testing
- [Vercel CLI](https://vercel.com/docs/cli) - Local dev & deployment
- [Git](https://git-scm.com/doc) - Version control
- [Node.js](https://nodejs.org/docs/) - JavaScript runtime

### Services utilisés
- [Vercel](https://vercel.com/) - Hosting & Serverless
- [Neon](https://neon.tech/) - PostgreSQL managed database
- [Upstash](https://upstash.com/) - Redis managed cache
- [Pusher Beams](https://pusher.com/beams) - Push notifications

### Tutoriels recommandés
- [Vercel Quickstart](https://vercel.com/docs/frameworks/nextjs)
- [React + TypeScript](https://www.typescriptlang.org/docs/handbook/react.html)
- [PostgreSQL Basics](https://www.postgresql.org/docs/current/intro.html)
- [Redis Commands](https://redis.io/commands/)

### Communautés
- [React Discord](https://discord.gg/react)
- [Stack Overflow - React](https://stackoverflow.com/questions/tagged/reactjs)
- [GitHub Discussions](https://github.com/medbenaissa1/urc/discussions)

## Crédits / Remerciements
- **Développement** : Mohammed BENAISSA
- **Tests** : 
  - API testées via Postman
  - Production testing en temps réel avec utilisateurs en France et Maroc
- **Encadrement académique** : M. Thibaut (séances TP)
- **Design** : Material-UI + LLM styling assistance

## Support & Documentation

Si vous avez besoin de détails supplémentaires sur un fichier ou une route spécifique, 
n'hésitez pas à demander. Cette documentation couvre la majorité des cas d'usage et 
d'architecture.

---

**Dernière mise à jour et ajout de README** : 30 Novembre 2025  
**Version** : 1.0 Production  
**Status** : Stable & Tested