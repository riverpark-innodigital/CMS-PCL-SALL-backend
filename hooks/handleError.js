const handleError = (res, message, err, status) => {

    const responseCode = status || 500;

    res.status(responseCode).json({
        status: status ? status : 500,
        message: message ? message : "Error",
        error: err ? err : "Error",
    })
}

module.exports = handleError;