exports.success = (res, data, message = "OK") => {
  return res.status(200).json({ success: true, message, data });
};

exports.error = (res, message = "Something went wrong", code = 400) => {
  return res.status(code).json({ success: false, message });
};
