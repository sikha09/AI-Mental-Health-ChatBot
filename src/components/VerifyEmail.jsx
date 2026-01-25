import React, { useState } from 'react';
import '../styles/VerifyEmail.css';
import { verifyEmail } from '../services/authService';

const VerifyEmail = ({ isOpen, userEmail, onSuccess, onClose }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling && element.value !== '') {
            element.nextSibling.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            // Focus previous input if backspace is pressed on empty input
            const inputs = document.querySelectorAll('.otp-input');
            if (inputs[index - 1]) {
                inputs[index - 1].focus();
            }
        }
    }

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
                onSuccess(response);
            } else {
                setError(response.message || 'Verification failed');
            }
        } catch (err) {
            setError(err.message || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
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
                            />
                        ))}
                    </div>

                    <button type="submit" className="verify-btn" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>
                </form>

                <p className="resend-text">
                    Didn't receive the code?
                    <button className="resend-link" onClick={() => alert('Resend functionality to be implemented')}>
                        Resend
                    </button>
                </p>
            </div>
        </div>
    );
};

export default VerifyEmail;
