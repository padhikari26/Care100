// models/Client.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Client = sequelize.define('Client', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        medicalId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        signature: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
        contactNumber: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            validate: {
                isEmail: true,
            },
        },
        orgId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Organizations',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
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

    Client.associate = (models) => {
        Client.hasMany(models.WorkAssignment, {
            foreignKey: 'clientId',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
        Client.belongsTo(models.Organization, {
            foreignKey: 'orgId',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
        Client.hasMany(models.Timesheet, {
            foreignKey: 'clientId',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
    };

    return Client;
};