const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  roleMiddleware,
} = require("../middleware/auth.middleware");
const { supabase } = require("../config/supabase");

// Get student profile
router.get(
  "/profile",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("student_profiles")
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
      console.error("Get student profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Update student profile
router.put(
  "/profile",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const {
        bio,
        education,
        skills,
        interests,
        targetUniversities,
        careerGoals,
        linkedinUrl,
        portfolioUrl,
        avatar,
      } = req.body;

      const profileData = {
        user_id: req.user.id,
        bio,
        education: education || [],
        skills: skills || [],
        interests: interests || [],
        target_universities: targetUniversities || [],
        career_goals: careerGoals,
        linkedin_url: linkedinUrl,
        portfolio_url: portfolioUrl,
        avatar,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("student_profiles")
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
      console.error("Update student profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Get student's credentials
router.get(
  "/credentials",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      let query = supabase
        .from("credentials")
        .select("*", { count: "exact" })
        .eq("student_id", req.user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error, count } = await query;

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.json({
        success: true,
        data: data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error("Get student credentials error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Get student dashboard stats
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const { data: credentials, error } = await supabase
        .from("credentials")
        .select("status, skills")
        .eq("student_id", req.user.id);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      // Collect all skills
      const allSkills = credentials.reduce((acc, cred) => {
        if (cred.skills && Array.isArray(cred.skills)) {
          acc.push(...cred.skills);
        }
        return acc;
      }, []);
      const uniqueSkills = [...new Set(allSkills)];

      const stats = {
        totalCredentials: credentials.length,
        verifiedCredentials: credentials.filter((c) => c.status === "verified")
          .length,
        pendingCredentials: credentials.filter(
          (c) => c.status === "pending_blockchain"
        ).length,
        totalSkills: uniqueSkills.length,
        skills: uniqueSkills,
      };

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Get student stats error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Share credential (generate shareable link)
router.post(
  "/credentials/:id/share",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { expiresIn } = req.body; // in hours, optional

      // Verify student owns this credential
      const { data: credential, error: credError } = await supabase
        .from("credentials")
        .select("id, student_id")
        .eq("id", id)
        .single();

      if (credError || !credential) {
        return res.status(404).json({
          success: false,
          message: "Credential not found",
        });
      }

      if (credential.student_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to share this credential",
        });
      }

      // Create share record
      const shareData = {
        credential_id: id,
        created_by: req.user.id,
        expires_at: expiresIn
          ? new Date(Date.now() + expiresIn * 3600000).toISOString()
          : null,
      };

      const { data: share, error } = await supabase
        .from("credential_shares")
        .insert(shareData)
        .select()
        .single();

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      const shareUrl = `${process.env.FRONTEND_URL}/verify/${share.id}`;

      res.json({
        success: true,
        data: {
          shareId: share.id,
          shareUrl,
          expiresAt: share.expires_at,
        },
      });
    } catch (error) {
      console.error("Share credential error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Get shared credentials
router.get(
  "/shares",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("credential_shares")
        .select("*, credential:credentials(title, credential_type)")
        .eq("created_by", req.user.id)
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
      console.error("Get shares error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

module.exports = router;
