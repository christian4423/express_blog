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
            allowNull: false
        },
        body: {
            type: DataTypes.STRING,
            field: 'body',
            allowNull: false
        },
        tags: {
            type: DataTypes.TEXT,
            field: 'tags',
            allowNull: true
        },
        created_at:{
            type: DataTypes.DATE,
            field: 'createdAt',
            allowNull: true
        },
        updated_at:{
            type: DataTypes.DATE,
            field: 'updatedAt',
            allowNull: true
        },
        user_added:{
            type: DataTypes.TEXT,
            field: 'user_added',
            allowNull: true
        },
        user_updated:{
            type: DataTypes.TEXT,
            field: 'user_updated',
            allowNull: true
        },
        user_id:{
            type: DataTypes.INTEGER,
            field: 'user_id',
            allowNull: false
        }                      
    });
    Blog.removeAttribute("id");
    return Blog;
};