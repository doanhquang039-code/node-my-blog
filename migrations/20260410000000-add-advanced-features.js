'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create newsletters table
    await queryInterface.createTable('newsletters', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      subscription_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create comment_ratings table
    await queryInterface.createTable('comment_ratings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      comment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      rating: {
        type: Sequelize.ENUM('helpful', 'unhelpful'),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create user_activities table
    await queryInterface.createTable('user_activities', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      activity_type: {
        type: Sequelize.ENUM('view_post', 'like_post', 'comment', 'create_post', 'login'),
        allowNull: false,
      },
      post_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      details: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create scheduled_posts table
    await queryInterface.createTable('scheduled_posts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      post_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      scheduled_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      is_published: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      published_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('newsletters');
    await queryInterface.dropTable('comment_ratings');
    await queryInterface.dropTable('user_activities');
    await queryInterface.dropTable('scheduled_posts');
  },
};
