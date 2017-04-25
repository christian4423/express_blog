"use strict";
module.exports = function (sequelize, DataTypes) {
    var Role = sequelize.define("Role", {
        roleid: {
            type: DataTypes.INTEGER,
            field: 'role_id',
            primaryKey: true
        },
        role: {
            type: DataTypes.STRING,
            field: 'role',
        }
    }, {
            classMethods: {
                associate: function (models) {
                    Role.hasOne(models.UserRole, { foreignKey: 'role_id', as: "Role" })
                }
            },
            underscored: true,
            tableName: "Roles"
        });
    Role.removeAttribute("id");
    Role.removeAttribute("created_at");
    Role.removeAttribute("updated_at");
    return Role;
};