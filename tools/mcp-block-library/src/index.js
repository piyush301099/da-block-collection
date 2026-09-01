import { TOOLS, callTool } from './tools.js';

const PROTOCOL_VERSION = '2025-03-26';
const SERVER_INFO = { name: 'da-block-library-mcp', version: '1.0.0' };

function jsonRpcResponse(id, result) {
  return new Response(JSON.stringify({ jsonrpc: '2.0', id, result }), {
    headers: { 'content-type': 'application/json' },
  });
}

function jsonRpcErrorResponse(id, code, message) {
  return new Response(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }), {
    headers: { 'content-type': 'application/json' },
  });
}

async function handleRequest(request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonRpcErrorResponse(null, -32700, 'Parse error');
  }

  const { id, method, params } = body;

  // Notifications carry no id and expect a bare 202, not a JSON-RPC response.
  if (method === 'notifications/initialized') {
    return new Response(null, { status: 202 });
  }

  if (method === 'initialize') {
    return jsonRpcResponse(id, {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: { tools: {} },
      serverInfo: SERVER_INFO,
    });
  }

  if (method === 'tools/list') {
    return jsonRpcResponse(id, { tools: TOOLS });
  }

  if (method === 'tools/call') {
    const { name, arguments: toolArgs } = params || {};
    try {
      const result = await callTool(name, toolArgs || {});
      return jsonRpcResponse(id, result);
    } catch (err) {
      return jsonRpcResponse(id, {
        content: [{ type: 'text', text: `Error: ${err.message}` }],
        isError: true,
      });
    }
  }

  return jsonRpcErrorResponse(id, -32601, `Method not found: ${method}`);
}

export default {
  fetch: (request) => handleRequest(request),
};
