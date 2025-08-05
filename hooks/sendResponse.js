
const sendResponse = (res, message, data, status) => {
    const responseCode = status || 200;

    res.status(responseCode).json({
        status: responseCode,
        message: message,
        body: data,
    });
};

module.exports = sendResponse;