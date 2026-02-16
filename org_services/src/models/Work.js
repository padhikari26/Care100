// models/Work.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Work = sequelize.define('Work', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        code: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            get() {
                return this.getDataValue('createdAt')?.toISOString();
            },
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            get() {
                return this.getDataValue('updatedAt')?.toISOString();
            },
        },
    });

    Work.associate = (models) => {
        Work.hasMany(models.WorkAssignment, {
            foreignKey: 'workId',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
        Work.belongsTo(models.Employee, {
            foreignKey: 'orgId',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
    };


    return Work;
};