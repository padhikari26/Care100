// models/Organization.js
import { DataTypes, Op } from 'sequelize';

export default (sequelize) => {
    const Organization = sequelize.define('Organization', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        orgName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        orgType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        logo: {
            type: DataTypes.TEXT('long'),
        },
        providerId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
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
        expiryDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    });

    // Define associations
    Organization.associate = (models) => {
        Organization.hasMany(models.Employee, {
            foreignKey: 'orgId',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
        Organization.hasMany(models.Client, {
            foreignKey: 'orgId',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
        Organization.hasMany(models.Work, {
            foreignKey: 'orgId',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
    };

    return Organization;
};