const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ChatMessage = sequelize.define('ChatMessage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sessionId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'session_id',
        references: {
            model: 'chat_sessions',
            key: 'session_id'
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    sender: {
        type: DataTypes.ENUM('user', 'bot'),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    messageType: {
        type: DataTypes.ENUM('text', 'rich', 'mixed'),
        field: 'message_type',
        defaultValue: 'text'
    },
    attachments: {
        type: DataTypes.JSON,
        allowNull: true
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Additional data like intent, entities, etc.'
    },
    suggestions: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Quick reply suggestions'
    },
    rating: {
        type: DataTypes.ENUM('helpful', 'not_helpful'),
        allowNull: true
    },
    feedback: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ratedAt: {
        type: DataTypes.DATE,
        field: 'rated_at',
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'chat_messages',
    timestamps: false,
    indexes: [
        { fields: ['session_id'] },
        { fields: ['user_id'] },
        { fields: ['sender'] },
        { fields: ['created_at'] }
    ]
});

module.exports = ChatMessage;
