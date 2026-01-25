exports.isExpired = (urlDoc) => {
  if (!urlDoc.expiryDate) return false;
  return new Date() > new Date(urlDoc.expiryDate);
};
