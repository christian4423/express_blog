"use strict";
module.exports = function (sequelize, DataTypes) {
    var BlogComments = sequelize.define("BlogComments", {
        comment_id: {
            type: DataTypes.INTEGER,
            field: 'comment_id',
            primaryKey: true,
            autoIncrement: true
        },
        blog_id: {
            type: DataTypes.INTEGER,
            field: 'blog_id',
        },
        user_id: {
            type: DataTypes.INTEGER,
            field: 'user_id',
        },
        comment: {
            type: DataTypes.STRING,
            field: 'subject',
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
        }
    }, {
        classMethods: {
            associate: function (models) {
                BlogComments.belongsTo(models.User, { foreignKey: 'user_id', as: "User" })
            }
        }
    });
    BlogComments.removeAttribute("id");
    return BlogComments;
};