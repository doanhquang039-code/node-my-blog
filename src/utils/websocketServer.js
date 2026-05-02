const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

/**
 * Setup WebSocket Server
 * @param {http.Server} server - HTTP server instance
 * @returns {WebSocket.Server} WebSocket server instance
 */
function setupWebSocketServer(server) {
    const wss = new WebSocket.Server({ 
        server,
        path: process.env.WS_PATH || '/ws'
    });

    // Store connected clients with user info
    const clients = new Map();

    wss.on('connection', (ws, req) => {
        console.log('🔌 New WebSocket connection');
        
        let userId = null;
        let isAuthenticated = false;

        // Send welcome message
        ws.send(JSON.stringify({
            type: 'connected',
            message: 'Connected to WebSocket server',
            timestamp: new Date().toISOString()
        }));

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                
                // Handle authentication
                if (data.type === 'auth') {
                    try {
                        const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
                        userId = decoded.id;
                        isAuthenticated = true;
                        
                        // Store client
                        clients.set(userId, ws);
                        
                        ws.send(JSON.stringify({
                            type: 'auth_success',
                            message: 'Authentication successful',
                            userId: userId
                        }));
                        
                        console.log(`✅ User ${userId} authenticated via WebSocket`);
                    } catch (error) {
                        ws.send(JSON.stringify({
                            type: 'auth_error',
                            message: 'Invalid token'
                        }));
                    }
                    return;
                }

                // Require authentication for other messages
                if (!isAuthenticated) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Please authenticate first'
                    }));
                    return;
                }

                // Handle different message types
                switch (data.type) {
                    case 'ping':
                        ws.send(JSON.stringify({
                            type: 'pong',
                            timestamp: new Date().toISOString()
                        }));
                        break;

                    case 'message':
                        // Broadcast message to all authenticated clients
                        broadcastToAll({
                            type: 'message',
                            from: userId,
                            content: data.content,
                            timestamp: new Date().toISOString()
                        });
                        break;

                    case 'private_message':
                        // Send private message to specific user
                        sendToUser(data.to, {
                            type: 'private_message',
                            from: userId,
                            content: data.content,
                            timestamp: new Date().toISOString()
                        });
                        break;

                    default:
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'Unknown message type'
                        }));
                }
            } catch (error) {
                console.error('❌ WebSocket message error:', error);
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Invalid message format'
                }));
            }
        });

        ws.on('close', () => {
            if (userId) {
                clients.delete(userId);
                console.log(`🔌 User ${userId} disconnected`);
            } else {
                console.log('🔌 Client disconnected');
            }
        });

        ws.on('error', (error) => {
            console.error('❌ WebSocket error:', error);
        });
    });

    // Helper function to broadcast to all clients
    function broadcastToAll(data) {
        const message = JSON.stringify(data);
        clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }

    // Helper function to send to specific user
    function sendToUser(userId, data) {
        const client = clients.get(userId);
        if (client && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
            return true;
        }
        return false;
    }

    // Helper function to send notification to user
    function sendNotification(userId, notification) {
        return sendToUser(userId, {
            type: 'notification',
            notification: notification,
            timestamp: new Date().toISOString()
        });
    }

    // Attach helper functions to wss for external use
    wss.broadcastToAll = broadcastToAll;
    wss.sendToUser = sendToUser;
    wss.sendNotification = sendNotification;
    wss.clients = clients;

    console.log(`✅ WebSocket server initialized on ${process.env.WS_PATH || '/ws'}`);
    
    return wss;
}

module.exports = setupWebSocketServer;
