"use strict";
module.exports = function (sequelize, DataTypes) {
    var BlogPopularity = sequelize.define("BlogPopularity", {
        blog_id: {
            type: DataTypes.INTEGER,
            field: 'blog_id',
            primaryKey: true
        },
        positive: {
            type: DataTypes.INTEGER,
            field: 'positive',
            allowNull: false
        },
        negative: {
            type: DataTypes.INTEGER,
            field: 'negative',
            allowNull: false
        },
    }, {
            classMethods: {
                associate: function (models) {
                    BlogPopularity.belongsTo(models.blogs, { foreignKey: 'blog_id', as: "Blog" })
                }
            },
            timestamps: false,
            underscored: true
        });
    BlogPopularity.removeAttribute("id");
    return BlogPopularity;
};