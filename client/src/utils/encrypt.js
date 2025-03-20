// encrypt.js
import CryptoJS from "crypto-js";

export const encrypt = (data, key) => {
  if (!data || !key) {
    throw new Error("Data and key must be provided for encryption.");
  }
  if (typeof data !== "string" || typeof key !== "string") {
    throw new Error("Data and key must be strings.");
  }
  return CryptoJS.AES.encrypt(data, key).toString();
};
