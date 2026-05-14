const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ChatSession = sequelize.define('ChatSession', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sessionId: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        field: 'session_id'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'user_id'
    },
    status: {
        type: DataTypes.ENUM('active', 'closed', 'expired'),
        defaultValue: 'active'
    },
    context: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    startedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'started_at'
    },
    lastActivityAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'last_activity_at'
    },
    endedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'ended_at'
    }
}, {
    tableName: 'chat_sessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
});

module.exports = ChatSession;
