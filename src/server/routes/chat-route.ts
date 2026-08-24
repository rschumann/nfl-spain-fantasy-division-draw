import type {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest
} from 'fastify';
import { findTeamByKey } from './auth-route.js';
import type { ChatStore } from '../chat-store.js';

interface MessageBody {
  key?: string;
  body?: string;
}

interface MessageQuery {
  key?: string;
}

async function handlePostMessage(
  request: FastifyRequest<{ Body: MessageBody }>,
  reply: FastifyReply,
  chatStore: ChatStore
): Promise<FastifyReply> {
  reply.header('Cache-Control', 'no-store');
  const { key, body } = request.body || {};
  if (!key || typeof key !== 'string') {
    return reply.status(401).send({ error: 'Clave de equipo requerida' });
  }
  const team = findTeamByKey(key);
  if (!team) {
    return reply.status(401).send({ error: 'Clave de equipo no válida' });
  }
  const text = (body ?? '').trim();
  if (!text || text.length > 280) {
    return reply
      .status(400)
      .send({ error: 'El mensaje debe tener entre 1 y 280 caracteres' });
  }
  const msg = chatStore.addMessage(team.teamId, team.teamName, text);
  return reply.status(201).send({
    ok: true,
    message: msg,
    onlineTeamIds: chatStore.getOnlineTeamIds()
  });
}

function handleGetMessages(
  request: FastifyRequest<{ Querystring: MessageQuery }>,
  reply: FastifyReply,
  chatStore: ChatStore
): { messages: readonly unknown[]; onlineTeamIds: readonly string[] } {
  reply.header('Cache-Control', 'no-store');
  const key = request.query?.key;
  if (key && typeof key === 'string') {
    const team = findTeamByKey(key);
    if (team) chatStore.touchPresence(team.teamId);
  }
  return {
    messages: chatStore.getMessages(),
    onlineTeamIds: chatStore.getOnlineTeamIds()
  };
}

export function createChatRoutes(chatStore: ChatStore): FastifyPluginAsync {
  return async (app: FastifyInstance) => {
    app.get<{ Querystring: MessageQuery }>('/api/chat/messages', async (req, reply) => {
      return handleGetMessages(req, reply, chatStore);
    });

    app.post<{ Body: MessageBody }>('/api/chat/messages', async (req, reply) => {
      return handlePostMessage(req, reply, chatStore);
    });

    app.get('/api/chat/presence', async (_req, reply) => {
      reply.header('Cache-Control', 'no-store');
      return { onlineTeamIds: chatStore.getOnlineTeamIds() };
    });
  };
}
