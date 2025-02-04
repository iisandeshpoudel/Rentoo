const Notification = require('../models/Notification');

exports.createNotification = async ({ recipient, type, message, data = {} }) => {
    try {
        const notification = new Notification({
            recipient,
            type,
            message,
            data,
            createdAt: new Date()
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};
