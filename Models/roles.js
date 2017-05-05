"use strict";
module.exports = function (sequelize, DataTypes) {
    var Role = sequelize.define("Role", {
        roleid: {
            type: DataTypes.INTEGER,
            field: 'role_id',
            primaryKey: true
        },
        role: {
            type: DataTypes.STRING({length: 15}),
            field: 'role',
        }
    }, {
            classMethods: {
                associate: function (models) {
                    Role.hasOne(models.UserRole, {onDelete:"cascade", hooks: true, onUpdate: "CASCADE", foreignKey: 'role_id', as: "Role" })
                }
            },
            underscored: true,
            tableName: "Roles",
            timestamps: false
        });
    Role.removeAttribute("id");
    return Role;
};