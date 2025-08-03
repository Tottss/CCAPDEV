const Errors = require('./models/Errors');

async function logError(error, location) {
  try {
    await Errors.create({
      message: error.message,
      stack: error.stack,
      location
    });
  } catch (err) {
    console.error("Failed to log error:", err);
  }
}

module.exports = logError;