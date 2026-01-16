const express = require("express");
const router = express.Router();
const { supabase } = require("../config/supabase");

// Public verification endpoint - verify by credential ID
router.get("/:credentialId", async (req, res) => {
  try {
    const { credentialId } = req.params;

    const { data: credential, error } = await supabase
      .from("credentials")
      .select(
        `
        id,
        title,
        credential_type,
        description,
        skills,
        issue_date,
        expiry_date,
        status,
        blockchain_hash,
        issuer_name,
        student:profiles!credentials_student_id_fkey(full_name, email)
      `
      )
      .eq("id", credentialId)
      .single();

    if (error || !credential) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: "Credential not found",
      });
    }

    // Check if credential is valid
    const isExpired =
      credential.expiry_date && new Date(credential.expiry_date) < new Date();
    const isRevoked = credential.status === "revoked";
    const isVerified =
      credential.status === "verified" && credential.blockchain_hash;

    res.json({
      success: true,
      verified: isVerified && !isExpired && !isRevoked,
      data: {
        credential: {
          id: credential.id,
          title: credential.title,
          type: credential.credential_type,
          description: credential.description,
          skills: credential.skills,
          issueDate: credential.issue_date,
          expiryDate: credential.expiry_date,
          issuerName: credential.issuer_name,
          studentName: credential.student?.full_name,
          blockchainHash: credential.blockchain_hash,
        },
        status: {
          isVerified,
          isExpired,
          isRevoked,
          currentStatus: credential.status,
        },
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      success: false,
      verified: false,
      message: "Verification failed",
    });
  }
});

// Verify by QR code data (usually contains credential ID and hash)
router.post("/qr", async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: "QR data is required",
      });
    }

    // Parse QR data (expected format: { credentialId, hash })
    let parsedData;
    try {
      parsedData = typeof qrData === "string" ? JSON.parse(qrData) : qrData;
    } catch {
      return res.status(400).json({
        success: false,
        verified: false,
        message: "Invalid QR data format",
      });
    }

    const { credentialId, hash } = parsedData;

    const { data: credential, error } = await supabase
      .from("credentials")
      .select(
        `
        id,
        title,
        credential_type,
        description,
        skills,
        issue_date,
        expiry_date,
        status,
        blockchain_hash,
        issuer_name,
        student:profiles!credentials_student_id_fkey(full_name)
      `
      )
      .eq("id", credentialId)
      .single();

    if (error || !credential) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: "Credential not found",
      });
    }

    // Verify hash matches
    const hashMatches = credential.blockchain_hash === hash;
    const isExpired =
      credential.expiry_date && new Date(credential.expiry_date) < new Date();
    const isRevoked = credential.status === "revoked";
    const isVerified = credential.status === "verified" && hashMatches;

    res.json({
      success: true,
      verified: isVerified && !isExpired && !isRevoked,
      data: {
        credential: {
          id: credential.id,
          title: credential.title,
          type: credential.credential_type,
          issuerName: credential.issuer_name,
          studentName: credential.student?.full_name,
          issueDate: credential.issue_date,
        },
        status: {
          isVerified,
          hashMatches,
          isExpired,
          isRevoked,
        },
      },
    });
  } catch (error) {
    console.error("QR verification error:", error);
    res.status(500).json({
      success: false,
      verified: false,
      message: "Verification failed",
    });
  }
});

// Batch verification (for employers verifying multiple credentials)
router.post("/batch", async (req, res) => {
  try {
    const { credentialIds } = req.body;

    if (!credentialIds || !Array.isArray(credentialIds)) {
      return res.status(400).json({
        success: false,
        message: "Array of credential IDs is required",
      });
    }

    const { data: credentials, error } = await supabase
      .from("credentials")
      .select(
        `
        id,
        title,
        credential_type,
        status,
        blockchain_hash,
        expiry_date,
        issuer_name
      `
      )
      .in("id", credentialIds);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const results = credentials.map((cred) => {
      const isExpired =
        cred.expiry_date && new Date(cred.expiry_date) < new Date();
      const isRevoked = cred.status === "revoked";
      const isVerified = cred.status === "verified" && cred.blockchain_hash;

      return {
        id: cred.id,
        title: cred.title,
        type: cred.credential_type,
        issuerName: cred.issuer_name,
        verified: isVerified && !isExpired && !isRevoked,
        status: cred.status,
      };
    });

    res.json({
      success: true,
      data: results,
      summary: {
        total: results.length,
        verified: results.filter((r) => r.verified).length,
        failed: results.filter((r) => !r.verified).length,
      },
    });
  } catch (error) {
    console.error("Batch verification error:", error);
    res.status(500).json({
      success: false,
      message: "Batch verification failed",
    });
  }
});

module.exports = router;
