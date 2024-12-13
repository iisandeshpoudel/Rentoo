require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Rentoo';

async function createAdminUser() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Delete existing admin if exists
        await mongoose.connection.collection('users').deleteOne({ email: 'admin@rentoo.com' });
        console.log('Cleaned up existing admin user');

        // Create a new password hash
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 8);

        // Create admin user directly in the database
        await mongoose.connection.collection('users').insertOne({
            name: 'Admin User',
            email: 'admin@rentoo.com',
            password: hashedPassword,
            role: 'admin',
            createdAt: new Date()
        });

        console.log('Admin user created successfully');
        console.log('\nLogin credentials:');
        console.log('Email: admin@rentoo.com');
        console.log('Password: admin123');
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

createAdminUser(); 