const Notification = require('../models/Notification');

async function createNotification(recipientId, type, title, message, relatedData = {}) {
  try {
    const notification = new Notification({
      recipient: recipientId,
      type,
      title,
      message,
      ...relatedData
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

module.exports = {
  createNotification
};
