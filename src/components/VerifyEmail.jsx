import React, { useState, useEffect } from 'react';
import '../styles/VerifyEmail.css';
import { verifyEmail, resendVerification } from '../services/authService';

const VerifyEmail = ({ isOpen, userEmail, onSuccess }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');

    // FIXED: useEffect MUST come before any conditional returns (Rules of Hooks)
    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setTimeout(() => {
                setResendCountdown(resendCountdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCountdown]);

    // Conditional return is now AFTER all hooks
    if (!isOpen) return null;

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;
        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
        if (element.nextSibling && element.value !== '') {
            element.nextSibling.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const inputs = document.querySelectorAll('.otp-input');
            if (inputs[index - 1]) {
                inputs[index - 1].focus();
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpValue = otp.join('');

        if (otpValue.length !== 6) {
            setError('Please enter the 6-digit code sent to your email.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await verifyEmail(userEmail, otpValue);
            if (response.success) {
                setSuccessMessage('Email verified successfully! Redirecting...');
                setTimeout(() => {
                    onSuccess(response);
                }, 1000);
            } else {
                setError(response.message || 'Verification failed');
            }
        } catch (err) {
            setError(err.message || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCountdown > 0) return;

        setResendLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await resendVerification(userEmail);
            if (response.success) {
                setSuccessMessage('Verification code resent! Please check your email.');
                setResendCountdown(60);
                setOtp(['', '', '', '', '', '']);
                const inputs = document.querySelectorAll('.otp-input');
                if (inputs[0]) inputs[0].focus();
            } else {
                setError(response.message || 'Failed to resend code');
            }
        } catch (err) {
            setError(err.message || 'Failed to resend code. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="verify-overlay">
            <div className="verify-modal">
                <div className="verify-icon">✉️</div>
                <h2>Verify your Email</h2>
                <p>
                    We've sent a 6-digit verification code to<br />
                    <strong>{userEmail}</strong>
                </p>

                {error && (
                    <div className="error-message">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {successMessage && (
                    <div className="success-message">
                        <span>✅</span> {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="otp-input-container">
                        {otp.map((data, index) => (
                            <input
                                className="otp-input"
                                type="text"
                                name="otp"
                                maxLength="1"
                                key={index}
                                value={data}
                                onChange={(e) => handleChange(e.target, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onFocus={(e) => e.target.select()}
                                disabled={loading}
                            />
                        ))}
                    </div>

                    <button type="submit" className="verify-btn" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>
                </form>

                <p className="resend-text">
                    Didn't receive the code?
                    <button
                        className="resend-link"
                        onClick={handleResend}
                        disabled={resendCountdown > 0 || resendLoading}
                        type="button"
                    >
                        {resendLoading ? 'Sending...' : resendCountdown > 0 ? `Resend (${resendCountdown}s)` : 'Resend'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default VerifyEmail;
