require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Rentoo';

async function testPassword() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find admin user
        const adminUser = await User.findOne({ email: 'admin@rentoo.com' });
        if (!adminUser) {
            console.log('Admin user not found');
            process.exit(1);
        }

        console.log('Admin user found:', {
            email: adminUser.email,
            role: adminUser.role,
            passwordHash: adminUser.password
        });

        // Test password comparison
        const testPassword = 'admin123';
        const isMatch = await bcrypt.compare(testPassword, adminUser.password);
        console.log('Password comparison result:', isMatch);

        // Generate new password hash for verification
        const newHash = await bcrypt.hash(testPassword, 8);
        console.log('New hash for same password:', newHash);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testPassword(); 