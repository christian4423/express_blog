"use strict";
module.exports = function (sequelize, DataTypes) {
    var Blog = sequelize.define("blogs", {
        blog_id: {
            type: DataTypes.INTEGER,
            field: 'blog_id',
            primaryKey: true,
            autoIncrement: true
        },
        subject: {
            type: DataTypes.STRING,
            field: 'subject',
            allowNull: true
        },
        body: {
            type: DataTypes.TEXT,
            field: 'body',
            allowNull: false
        },
        tags: {
            type: DataTypes.TEXT,
            field: 'tags',
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            field: 'createdAt',
            allowNull: true
        },
        updated_at: {
            type: DataTypes.DATE,
            field: 'updatedAt',
            allowNull: true
        },
        user_added: {
            type: DataTypes.TEXT,
            field: 'user_added',
            allowNull: true
        },
        user_updated: {
            type: DataTypes.TEXT,
            field: 'user_updated',
            allowNull: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            field: 'user_id',
            allowNull: false
        }
    }, {
            classMethods: {
                associate: function (models) {
                    Blog.belongsTo(models.User, { foreignKey: 'user_id', as: "User", onDelete: "SET NULL", onUpdate: "CASCADE", hooks: true })
                    Blog.hasOne(models.BlogPopularity, { foreignKey: 'blog_id', as: "Popularity", onDelete: "SET NULL", onUpdate: "CASCADE", hooks: true })
                    Blog.hasMany(models.BlogComments, { foreignKey: 'blog_id', as: "Comments", onDelete: "SET NULL", onUpdate: "CASCADE", hooks: true })
                }
            },
        });
    Blog.removeAttribute("id");
    return Blog;
};