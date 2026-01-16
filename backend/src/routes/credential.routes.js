const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  roleMiddleware,
} = require("../middleware/auth.middleware");
const { supabase } = require("../config/supabase");

// Get all credentials (filtered by user role)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userRole = req.user.user_metadata?.role;
    const userId = req.user.id;

    let query = supabase.from("credentials").select("*");

    // Filter based on role
    if (userRole === "student") {
      query = query.eq("student_id", userId);
    } else if (userRole === "institution") {
      query = query.eq("issuer_id", userId);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Get credentials error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get single credential by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("credentials")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: "Credential not found",
      });
    }

    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Get credential error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Issue new credential (Institution only)
router.post(
  "/issue",
  authMiddleware,
  roleMiddleware("institution"),
  async (req, res) => {
    try {
      const {
        studentEmail,
        credentialType,
        title,
        description,
        skills,
        issueDate,
        expiryDate,
        metadata,
      } = req.body;

      // Validate required fields
      if (!studentEmail || !credentialType || !title) {
        return res.status(400).json({
          success: false,
          message: "Student email, credential type, and title are required",
        });
      }

      // Find student by email
      const { data: studentData, error: studentError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", studentEmail)
        .single();

      if (studentError || !studentData) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      // Create credential record
      const credentialRecord = {
        student_id: studentData.id,
        issuer_id: req.user.id,
        issuer_name:
          req.user.user_metadata?.institution_name || "Unknown Institution",
        credential_type: credentialType,
        title: title,
        description: description || "",
        skills: skills || [],
        issue_date: issueDate || new Date().toISOString(),
        expiry_date: expiryDate || null,
        metadata: metadata || {},
        status: "pending_blockchain", // Will be updated after blockchain verification
        blockchain_hash: null,
        ipfs_hash: null,
      };

      const { data, error } = await supabase
        .from("credentials")
        .insert(credentialRecord)
        .select()
        .single();

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      // TODO: Trigger blockchain minting process (handled by blockchain partner)
      // This will be called via webhook or separate service

      res.status(201).json({
        success: true,
        message:
          "Credential issued successfully. Pending blockchain verification.",
        data: data,
      });
    } catch (error) {
      console.error("Issue credential error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Update credential status (for blockchain callback)
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, blockchainHash, ipfsHash } = req.body;

    const updateData = { status };
    if (blockchainHash) updateData.blockchain_hash = blockchainHash;
    if (ipfsHash) updateData.ipfs_hash = ipfsHash;

    const { data, error } = await supabase
      .from("credentials")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.json({
      success: true,
      message: "Credential status updated",
      data: data,
    });
  } catch (error) {
    console.error("Update credential status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Revoke credential (Institution only)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("institution"),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if institution owns this credential
      const { data: credential, error: fetchError } = await supabase
        .from("credentials")
        .select("issuer_id")
        .eq("id", id)
        .single();

      if (fetchError || !credential) {
        return res.status(404).json({
          success: false,
          message: "Credential not found",
        });
      }

      if (credential.issuer_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to revoke this credential",
        });
      }

      const { error } = await supabase
        .from("credentials")
        .update({ status: "revoked" })
        .eq("id", id);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.json({
        success: true,
        message: "Credential revoked successfully",
      });
    } catch (error) {
      console.error("Revoke credential error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

module.exports = router;
