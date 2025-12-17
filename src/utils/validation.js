/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

/**
 * Validate phone number (Vietnamese format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid phone
 */
export const isValidPhone = (phone) => {
    const regex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
    return regex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate form fields
 * @param {object} data - Form data
 * @param {object} rules - Validation rules
 * @returns {object} Errors object
 */
export const validateForm = (data, rules) => {
    const errors = {};

    Object.keys(rules).forEach((field) => {
        const value = data[field];
        const fieldRules = rules[field];

        // Required
        if (fieldRules.required && (!value || (typeof value === 'string' && !value.trim()))) {
            errors[field] = fieldRules.message || 'Trường này là bắt buộc';
            return;
        }

        // Skip other validations if empty and not required
        if (!value && !fieldRules.required) return;

        // Min length
        if (fieldRules.minLength && value.length < fieldRules.minLength) {
            errors[field] = `Tối thiểu ${fieldRules.minLength} ký tự`;
            return;
        }

        // Max length
        if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
            errors[field] = `Tối đa ${fieldRules.maxLength} ký tự`;
            return;
        }

        // Email
        if (fieldRules.email && !isValidEmail(value)) {
            errors[field] = 'Email không hợp lệ';
            return;
        }

        // Phone
        if (fieldRules.phone && !isValidPhone(value)) {
            errors[field] = 'Số điện thoại không hợp lệ';
            return;
        }

        // Min value
        if (fieldRules.min !== undefined && parseFloat(value) < fieldRules.min) {
            errors[field] = `Giá trị tối thiểu là ${fieldRules.min}`;
            return;
        }

        // Max value
        if (fieldRules.max !== undefined && parseFloat(value) > fieldRules.max) {
            errors[field] = `Giá trị tối đa là ${fieldRules.max}`;
            return;
        }

        // Pattern
        if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
            errors[field] = fieldRules.patternMessage || 'Giá trị không hợp lệ';
            return;
        }

        // Custom validation
        if (fieldRules.validate) {
            const customError = fieldRules.validate(value, data);
            if (customError) {
                errors[field] = customError;
            }
        }
    });

    return errors;
};

/**
 * Check if form has errors
 * @param {object} errors - Errors object
 * @returns {boolean} Has errors
 */
export const hasErrors = (errors) => {
    return Object.keys(errors).length > 0;
};

export default validateForm;
