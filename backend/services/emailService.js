const nodemailer = require('nodemailer');
const { logger } = require('../middleware/error');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
            port: process.env.EMAIL_PORT || 2525,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Verify connection configuration
        this.transporter.verify((error, success) => {
            if (error) {
                logger.error('Email service error:', error);
            } else {
                logger.info('Email service is ready to send messages');
            }
        });
    }

    /**
     * Send email
     */
    async sendEmail(to, subject, html) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || 'Solid Car <noreply@solidcar.com>',
                to,
                subject,
                html
            };

            const info = await this.transporter.sendMail(mailOptions);
            logger.info('Email sent:', info.messageId);
            return info;
        } catch (error) {
            logger.error('Error sending email:', error);
            throw error;
        }
    }

    /**
     * Send verification email
     */
    async sendVerificationEmail(user, verificationUrl) {
        const subject = 'Verify your email address';
        const html = `
            <h1>Welcome to Solid Car!</h1>
            <p>Hi ${user.fullName},</p>
            <p>Thank you for registering with Solid Car. Please verify your email address by clicking the button below:</p>
            <p>
                <a href="${verificationUrl}" style="
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #6f42c1;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                ">Verify Email Address</a>
            </p>
            <p>If the button doesn't work, you can also click this link:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account with Solid Car, please ignore this email.</p>
            <br>
            <p>Best regards,</p>
            <p>The Solid Car Team</p>
        `;

        return this.sendEmail(user.email, subject, html);
    }

    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(user, resetUrl) {
        const subject = 'Reset your password';
        const html = `
            <h1>Password Reset Request</h1>
            <p>Hi ${user.fullName},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p>
                <a href="${resetUrl}" style="
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #6f42c1;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                ">Reset Password</a>
            </p>
            <p>If the button doesn't work, you can also click this link:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email or contact support if you're concerned.</p>
            <br>
            <p>Best regards,</p>
            <p>The Solid Car Team</p>
        `;

        return this.sendEmail(user.email, subject, html);
    }

    /**
     * Send welcome email
     */
    async sendWelcomeEmail(user) {
        const subject = 'Welcome to Solid Car!';
        const html = `
            <h1>Welcome to Solid Car!</h1>
            <p>Hi ${user.fullName},</p>
            <p>Thank you for joining Solid Car. We're excited to have you as a member!</p>
            <p>Here are some things you can do with your account:</p>
            <ul>
                <li>Browse our selection of premium cars</li>
                <li>Book test drives</li>
                <li>Save your favorite cars</li>
                <li>Get personalized recommendations</li>
            </ul>
            <p>If you have any questions, our support team is always here to help.</p>
            <br>
            <p>Best regards,</p>
            <p>The Solid Car Team</p>
        `;

        return this.sendEmail(user.email, subject, html);
    }

    /**
     * Send booking confirmation email
     */
    async sendBookingConfirmationEmail(user, booking) {
        const subject = 'Booking Confirmation';
        const html = `
            <h1>Booking Confirmation</h1>
            <p>Hi ${user.fullName},</p>
            <p>Your booking has been confirmed!</p>
            <h2>Booking Details:</h2>
            <ul>
                <li>Car: ${booking.car.make} ${booking.car.model}</li>
                <li>Date: ${new Date(booking.date).toLocaleDateString()}</li>
                <li>Time: ${new Date(booking.date).toLocaleTimeString()}</li>
                <li>Location: ${booking.location}</li>
                <li>Booking Reference: ${booking._id}</li>
            </ul>
            <p>Need to make changes? You can manage your booking through your account dashboard.</p>
            <br>
            <p>Best regards,</p>
            <p>The Solid Car Team</p>
        `;

        return this.sendEmail(user.email, subject, html);
    }
}

module.exports = new EmailService();
