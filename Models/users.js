"use strict";
module.exports = function (sequelize, DataTypes) {
    var User = sequelize.define("User", {
        userid: {
            type: DataTypes.INTEGER,
            field: 'user_id',
            primaryKey: true,
            autoIncrement: true
        },
        firstname: {
            type: DataTypes.STRING,
            field: 'first_name',
            allowNull: false
        },
        lastname: {
            type: DataTypes.STRING,
            field: 'last_name',
            allowNull: false
        },
        email: {
            type: DataTypes.TEXT,
            field: 'email',
            unique: true,
            allowNull: false
        },
        hash: {
            type: DataTypes.TEXT,
            field: 'hash',
            unique: true,
            allowNull: false            
        },
        profile_pic: {
            type: DataTypes.TEXT,
            field: 'profile_pic',
            defaultValue: "/photos/default.jpg",
            allowNull: true            
        }       
    }, {
            classMethods: {
                associate: function (models) {
                    User.hasOne(models.UserRole, { foreignKey: 'user_id', as: "User" })
                }
            },
            underscored: true,
            tableName: "Users"
        });
    User.removeAttribute("id");
    return User;
};