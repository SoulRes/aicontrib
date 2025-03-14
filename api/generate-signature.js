const crypto = require("crypto");

// ✅ Your BTCPay Webhook Secret
const secret = "2Hw8qFmtfDPsCRrRUm4ZSPti3Rm8";  // Replace with your actual BTCPAY_WEBHOOK_SECRET

// ✅ Your test payload (same as what you send in Postman)
const payload = JSON.stringify({
    invoiceId: "test-invoice-123",
    status: "complete",
    userId: "kramerknol@proton.me"
});

// ✅ Generate HMAC-SHA256 Signature
const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

console.log("Generated Signature:", signature);
