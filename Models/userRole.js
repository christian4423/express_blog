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
                        UserRole.belongsTo(models.User, { foreignKey: 'user_id', as: "User", onDelete:"SET NULL", onUpdate: "CASCADE", hooks: true }),
                        UserRole.belongsTo(models.Role, { foreignKey: 'role_id', as: "Role", onDelete:"SET NULL", onUpdate: "CASCADE", hooks: true  })
                }
            },
            underscored: true,
            tableName: "UserRole",
            timestamps: false
        });

    UserRole.removeAttribute("id");
    return UserRole;
};