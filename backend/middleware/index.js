// backend/middleware/index.js
const { authenticateToken, authorizeRoles } = require('./auth');
const { handleValidationErrors, validateObjectId, sanitizeInput } = require('./validation');

module.exports = {
    authenticateToken,
    authorizeRoles,
    handleValidationErrors,
    validateObjectId,
    sanitizeInput
};