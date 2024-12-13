const Notification = require('../models/Notification');

const createNotification = async ({
  recipient,
  type,
  title,
  message,
  relatedRental = null,
  relatedProduct = null
}) => {
  try {
    const notification = new Notification({
      recipient,
      type,
      title,
      message,
      relatedRental,
      relatedProduct
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

const createRentalRequestNotification = async (rental) => {
  const vendorNotification = await createNotification({
    recipient: rental.vendor,
    type: 'RENTAL_REQUEST',
    title: 'New Rental Request',
    message: `You have received a new rental request for ${rental.product.name}`,
    relatedRental: rental._id,
    relatedProduct: rental.product._id
  });

  const customerNotification = await createNotification({
    recipient: rental.customer,
    type: 'RENTAL_REQUEST',
    title: 'Rental Request Submitted',
    message: `Your rental request for ${rental.product.name} has been submitted`,
    relatedRental: rental._id,
    relatedProduct: rental.product._id
  });

  return { vendorNotification, customerNotification };
};

const createRentalStatusNotification = async (rental, status) => {
  const title = status === 'approved' ? 'Rental Request Approved' : 'Rental Request Rejected';
  const message = status === 'approved'
    ? `Your rental request for ${rental.product.name} has been approved`
    : `Your rental request for ${rental.product.name} has been rejected`;

  return await createNotification({
    recipient: rental.customer,
    type: status === 'approved' ? 'RENTAL_APPROVED' : 'RENTAL_REJECTED',
    title,
    message,
    relatedRental: rental._id,
    relatedProduct: rental.product._id
  });
};

const createPaymentNotification = async (rental) => {
  const vendorNotification = await createNotification({
    recipient: rental.vendor,
    type: 'PAYMENT_RECEIVED',
    title: 'Payment Received',
    message: `Payment received for rental of ${rental.product.name}`,
    relatedRental: rental._id,
    relatedProduct: rental.product._id
  });

  const customerNotification = await createNotification({
    recipient: rental.customer,
    type: 'PAYMENT_RECEIVED',
    title: 'Payment Confirmed',
    message: `Your payment for ${rental.product.name} has been confirmed`,
    relatedRental: rental._id,
    relatedProduct: rental.product._id
  });

  return { vendorNotification, customerNotification };
};

const createReturnNotification = async (rental) => {
  return await createNotification({
    recipient: rental.vendor,
    type: 'PRODUCT_RETURNED',
    title: 'Product Returned',
    message: `${rental.product.name} has been marked as returned`,
    relatedRental: rental._id,
    relatedProduct: rental.product._id
  });
};

module.exports = {
  createNotification,
  createRentalRequestNotification,
  createRentalStatusNotification,
  createPaymentNotification,
  createReturnNotification
};
