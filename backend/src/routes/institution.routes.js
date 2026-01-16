const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  roleMiddleware,
} = require("../middleware/auth.middleware");
const { supabase } = require("../config/supabase");

// Get institution profile
router.get(
  "/profile",
  authMiddleware,
  roleMiddleware("institution"),
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("institutions")
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
      console.error("Get institution profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Update institution profile
router.put(
  "/profile",
  authMiddleware,
  roleMiddleware("institution"),
  async (req, res) => {
    try {
      const {
        name,
        description,
        address,
        website,
        contactEmail,
        contactPhone,
        logo,
        accreditation,
      } = req.body;

      const profileData = {
        user_id: req.user.id,
        name,
        description,
        address,
        website,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        logo,
        accreditation,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("institutions")
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
      console.error("Update institution profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Get institution's issued credentials
router.get(
  "/credentials",
  authMiddleware,
  roleMiddleware("institution"),
  async (req, res) => {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      let query = supabase
        .from("credentials")
        .select(
          "*, student:profiles!credentials_student_id_fkey(full_name, email)",
          { count: "exact" }
        )
        .eq("issuer_id", req.user.id)
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
      console.error("Get institution credentials error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Get institution dashboard stats
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware("institution"),
  async (req, res) => {
    try {
      const { data: credentials, error } = await supabase
        .from("credentials")
        .select("status")
        .eq("issuer_id", req.user.id);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      const stats = {
        total: credentials.length,
        verified: credentials.filter((c) => c.status === "verified").length,
        pending: credentials.filter((c) => c.status === "pending_blockchain")
          .length,
        revoked: credentials.filter((c) => c.status === "revoked").length,
      };

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Get institution stats error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Get credential templates
router.get(
  "/templates",
  authMiddleware,
  roleMiddleware("institution"),
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("credential_templates")
        .select("*")
        .eq("institution_id", req.user.id)
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
      console.error("Get templates error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Create credential template
router.post(
  "/templates",
  authMiddleware,
  roleMiddleware("institution"),
  async (req, res) => {
    try {
      const { name, credentialType, fields, defaultSkills, description } =
        req.body;

      const templateData = {
        institution_id: req.user.id,
        name,
        credential_type: credentialType,
        fields: fields || [],
        default_skills: defaultSkills || [],
        description,
      };

      const { data, error } = await supabase
        .from("credential_templates")
        .insert(templateData)
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
        message: "Template created successfully",
        data: data,
      });
    } catch (error) {
      console.error("Create template error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

module.exports = router;
