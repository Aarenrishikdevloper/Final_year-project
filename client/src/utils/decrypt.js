import CryptoJS from "crypto-js";

export const decrypt = (encryptedText, encryptionKey) => {
  if (!encryptedText || !encryptionKey) {
    throw new Error("encryptedText and key must be provided for encryption.");
  }
  if (typeof encryptedText !== "string" || typeof encryptionKey !== "string") {
    throw new Error("Data and key must be strings.");
  }
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, encryptionKey);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedText || "Decryption failed!"; // Handle empty result
  } catch (error) {
    console.error("Decryption error:", error);
    return "Error decrypting data!";
  }
};
