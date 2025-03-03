const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [2, 'Full name must be at least 2 characters long'],
        maxlength: [50, 'Full name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
            },
            message: 'Please enter a valid email address'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false // Don't include password in queries by default
    },
    phone: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                return !v || /^\+?[1-9]\d{1,14}$/.test(v);
            },
            message: 'Please enter a valid phone number'
        }
    },
    memberSince: {
        type: Date,
        default: Date.now
    },
    membershipLevel: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
        default: 'Bronze'
    },
    verified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLogin: Date,
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date,
    preferences: {
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            sms: {
                type: Boolean,
                default: false
            }
        },
        newsletter: {
            type: Boolean,
            default: true
        }
    },
    twoFactorSecret: {
        type: String,
        select: false
    },
    twoFactorVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ verificationToken: 1 });
userSchema.index({ resetPasswordToken: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Instance method to check if account is locked
userSchema.methods.isLocked = function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Static method to find by email with password
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email }).select('+password');
};

// Static method to increment login attempts
userSchema.statics.incrementLoginAttempts = async function(email) {
    const lockTime = 15 * 60 * 1000; // 15 minutes

    return this.findOneAndUpdate(
        { email },
        {
            $inc: { loginAttempts: 1 },
            $set: {
                lockUntil: Date.now() + lockTime
            }
        },
        { new: true }
    );
};

// Static method to reset login attempts
userSchema.statics.resetLoginAttempts = function(email) {
    return this.findOneAndUpdate(
        { email },
        {
            $set: {
                loginAttempts: 0,
                lockUntil: null,
                lastLogin: Date.now()
            }
        }
    );
};

const User = mongoose.model('User', userSchema);

module.exports = User;
