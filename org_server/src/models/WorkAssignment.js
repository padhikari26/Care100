// models/WorkAssignment.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const WorkAssignment = sequelize.define('WorkAssignment', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        employeeId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        clientId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        workId: {
            type: DataTypes.UUID,
            allowNull: false,
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

    WorkAssignment.associate = (models) => {
        WorkAssignment.belongsTo(models.Employee, {
            foreignKey: 'employeeId',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
        WorkAssignment.belongsTo(models.Client, {
            foreignKey: 'clientId',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
        WorkAssignment.belongsTo(models.Work, {
            foreignKey: 'workId',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
    };

    return WorkAssignment;
};