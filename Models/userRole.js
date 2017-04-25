"use strict";
module.exports = function (sequelize, DataTypes) {
    var UserRole = sequelize.define("UserRole", {
        user_id: {
            type: DataTypes.INTEGER,
            feild: "user_id",
        },
        role_id: {
            type: DataTypes.INTEGER,
            feild: "role_id",
        }
    }, {
            classMethods: {
                associate: function (models) {
                    UserRole.belongsTo(models.User, { foreignKey: 'user_id', as: "User" }),
                        UserRole.belongsTo(models.Role, { foreignKey: 'role_id', as: "Role" })
                }
            },
            underscored: true,
            tableName: "UserRole"
        });

    UserRole.removeAttribute("id");
    return UserRole;
};