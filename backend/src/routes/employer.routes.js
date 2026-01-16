const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  roleMiddleware,
} = require("../middleware/auth.middleware");
const { supabase } = require("../config/supabase");

// Get employer profile
router.get(
  "/profile",
  authMiddleware,
  roleMiddleware("employer"),
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("employer_profiles")
        .select("*")
        .eq("user_id", req.user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.json({
        success: true,
        data: data || null,
      });
    } catch (error) {
      console.error("Get employer profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Update employer profile
router.put(
  "/profile",
  authMiddleware,
  roleMiddleware("employer"),
  async (req, res) => {
    try {
      const {
        companyName,
        industry,
        description,
        website,
        address,
        contactEmail,
        contactPhone,
        logo,
      } = req.body;

      const profileData = {
        user_id: req.user.id,
        company_name: companyName,
        industry,
        description,
        website,
        address,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        logo,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("employer_profiles")
        .upsert(profileData, { onConflict: "user_id" })
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
        message: "Profile updated successfully",
        data: data,
      });
    } catch (error) {
      console.error("Update employer profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Get verification history
router.get(
  "/verifications",
  authMiddleware,
  roleMiddleware("employer"),
  async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from("verification_logs")
        .select(
          "*, credential:credentials(title, credential_type, issuer_name)",
          { count: "exact" }
        )
        .eq("verified_by", req.user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.json({
        success: true,
        data: data || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error("Get verifications error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Log a verification (when employer verifies a credential)
router.post(
  "/verifications",
  authMiddleware,
  roleMiddleware("employer"),
  async (req, res) => {
    try {
      const { credentialId, verificationMethod, result } = req.body;

      const logData = {
        credential_id: credentialId,
        verified_by: req.user.id,
        verification_method: verificationMethod, // 'qr', 'manual', 'batch'
        result: result, // 'valid', 'invalid', 'expired', 'revoked'
        verified_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("verification_logs")
        .insert(logData)
        .select()
        .single();

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(201).json({
        success: true,
        data: data,
      });
    } catch (error) {
      console.error("Log verification error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Get employer dashboard stats
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware("employer"),
  async (req, res) => {
    try {
      const { data: verifications, error } = await supabase
        .from("verification_logs")
        .select("result")
        .eq("verified_by", req.user.id);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      const stats = {
        totalVerifications: verifications.length,
        validCredentials: verifications.filter((v) => v.result === "valid")
          .length,
        invalidCredentials: verifications.filter((v) => v.result === "invalid")
          .length,
        expiredCredentials: verifications.filter((v) => v.result === "expired")
          .length,
        revokedCredentials: verifications.filter((v) => v.result === "revoked")
          .length,
      };

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Get employer stats error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Save candidate (bookmark a student for later)
router.post(
  "/candidates",
  authMiddleware,
  roleMiddleware("employer"),
  async (req, res) => {
    try {
      const { studentId, notes } = req.body;

      const candidateData = {
        employer_id: req.user.id,
        student_id: studentId,
        notes,
      };

      const { data, error } = await supabase
        .from("saved_candidates")
        .insert(candidateData)
        .select()
        .single();

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(201).json({
        success: true,
        message: "Candidate saved",
        data: data,
      });
    } catch (error) {
      console.error("Save candidate error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Get saved candidates
router.get(
  "/candidates",
  authMiddleware,
  roleMiddleware("employer"),
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("saved_candidates")
        .select("*, student:student_profiles(user_id, bio, skills)")
        .eq("employer_id", req.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.json({
        success: true,
        data: data || [],
      });
    } catch (error) {
      console.error("Get candidates error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

module.exports = router;
