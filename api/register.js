import { db } from '@vercel/postgres';
import { arrayBufferToBase64, stringToArrayBuffer } from "../src/lib/base64";

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return new Response(JSON.stringify({ message: "Champs manquants" }), {
        status: 400,
      });
    }

    const client = await db.connect();

    // Vérifie si l’utilisateur existe déjà
    const { rowCount } = await client.sql`
      SELECT * FROM users WHERE username = ${username} OR email = ${email}
    `;
    if (rowCount > 0) {
      return new Response(JSON.stringify({ message: "Utilisateur déjà existant" }), {
        status: 400,
      });
    }

    // Hasher le mot de passe (username + password)
    const hash = await crypto.subtle.digest('SHA-256', stringToArrayBuffer(username + password));
    const hashed64 = arrayBufferToBase64(hash);

    const externalId = crypto.randomUUID().toString();

    await client.sql`
      INSERT INTO users (username, email, password, external_id, created_on)
      VALUES (${username}, ${email}, ${hashed64}, ${externalId}, NOW())
    `;

    return new Response(JSON.stringify({ message: "Utilisateur créé avec succès" }), {
      status: 201,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Erreur serveur" }), {
      status: 500,
    });
  }
}
