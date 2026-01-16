const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth.middleware");
const axios = require("axios");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

/**
 * AI PARTNER INTEGRATION ENDPOINTS
 * These endpoints act as a proxy to the AI service
 * The AI partner should implement their service at AI_SERVICE_URL
 */

// Get skill recommendations based on user profile and credentials
router.post("/recommendations/skills", authMiddleware, async (req, res) => {
  try {
    const { currentSkills, careerGoal, credentials } = req.body;

    // TODO: AI Partner - Implement skill recommendation logic
    // Expected request to AI service:
    // POST /api/skills/recommend
    // Body: { currentSkills, careerGoal, credentials, userId }

    try {
      const aiResponse = await axios.post(
        `${AI_SERVICE_URL}/api/skills/recommend`,
        {
          currentSkills,
          careerGoal,
          credentials,
          userId: req.user.id,
        },
        {
          headers: { "X-API-Key": process.env.AI_API_KEY },
          timeout: 30000,
        }
      );

      return res.json({
        success: true,
        data: aiResponse.data,
      });
    } catch (aiError) {
      // If AI service is not available, return placeholder
      console.log("AI service not available, returning placeholder");
      return res.json({
        success: true,
        data: {
          recommendedSkills: [],
          message:
            "AI service is being integrated. Recommendations will be available soon.",
          placeholder: true,
        },
      });
    }
  } catch (error) {
    console.error("Skill recommendations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get skill recommendations",
    });
  }
});

// Match credentials to job descriptions
router.post("/match/jobs", authMiddleware, async (req, res) => {
  try {
    const { jobDescription, studentCredentials } = req.body;

    // TODO: AI Partner - Implement NLP-based job matching
    // Uses DistilBERT or similar model to extract skills from job description
    // and match with student credentials

    try {
      const aiResponse = await axios.post(
        `${AI_SERVICE_URL}/api/jobs/match`,
        {
          jobDescription,
          studentCredentials,
          userId: req.user.id,
        },
        {
          headers: { "X-API-Key": process.env.AI_API_KEY },
          timeout: 30000,
        }
      );

      return res.json({
        success: true,
        data: aiResponse.data,
      });
    } catch (aiError) {
      console.log("AI service not available, returning placeholder");
      return res.json({
        success: true,
        data: {
          matchScore: 0,
          matchedSkills: [],
          missingSkills: [],
          message:
            "AI service is being integrated. Job matching will be available soon.",
          placeholder: true,
        },
      });
    }
  } catch (error) {
    console.error("Job matching error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to match jobs",
    });
  }
});

// Get credential recommendations for higher studies
router.post(
  "/recommendations/credentials",
  authMiddleware,
  async (req, res) => {
    try {
      const { targetUniversity, targetProgram, currentCredentials } = req.body;

      // TODO: AI Partner - Recommend credentials for university applications

      try {
        const aiResponse = await axios.post(
          `${AI_SERVICE_URL}/api/credentials/recommend`,
          {
            targetUniversity,
            targetProgram,
            currentCredentials,
            userId: req.user.id,
          },
          {
            headers: { "X-API-Key": process.env.AI_API_KEY },
            timeout: 30000,
          }
        );

        return res.json({
          success: true,
          data: aiResponse.data,
        });
      } catch (aiError) {
        console.log("AI service not available, returning placeholder");
        return res.json({
          success: true,
          data: {
            recommendedCredentials: [],
            requirements: [],
            message:
              "AI service is being integrated. Credential recommendations will be available soon.",
            placeholder: true,
          },
        });
      }
    } catch (error) {
      console.error("Credential recommendations error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get credential recommendations",
      });
    }
  }
);

// Analyze skills from uploaded document (resume, certificate)
router.post("/analyze/document", authMiddleware, async (req, res) => {
  try {
    const { documentText, documentType } = req.body;

    // TODO: AI Partner - Extract skills from documents using NLP

    try {
      const aiResponse = await axios.post(
        `${AI_SERVICE_URL}/api/documents/analyze`,
        {
          documentText,
          documentType,
          userId: req.user.id,
        },
        {
          headers: { "X-API-Key": process.env.AI_API_KEY },
          timeout: 30000,
        }
      );

      return res.json({
        success: true,
        data: aiResponse.data,
      });
    } catch (aiError) {
      console.log("AI service not available, returning placeholder");
      return res.json({
        success: true,
        data: {
          extractedSkills: [],
          confidence: 0,
          message:
            "AI service is being integrated. Document analysis will be available soon.",
          placeholder: true,
        },
      });
    }
  } catch (error) {
    console.error("Document analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to analyze document",
    });
  }
});

// Get paperwork guidance for university applications
router.post("/guidance/paperwork", authMiddleware, async (req, res) => {
  try {
    const { targetUniversity, targetProgram, studentProfile } = req.body;

    // TODO: AI Partner - Provide guidance on required paperwork

    try {
      const aiResponse = await axios.post(
        `${AI_SERVICE_URL}/api/guidance/paperwork`,
        {
          targetUniversity,
          targetProgram,
          studentProfile,
          userId: req.user.id,
        },
        {
          headers: { "X-API-Key": process.env.AI_API_KEY },
          timeout: 30000,
        }
      );

      return res.json({
        success: true,
        data: aiResponse.data,
      });
    } catch (aiError) {
      console.log("AI service not available, returning placeholder");
      return res.json({
        success: true,
        data: {
          requiredDocuments: [],
          steps: [],
          timeline: null,
          message:
            "AI service is being integrated. Paperwork guidance will be available soon.",
          placeholder: true,
        },
      });
    }
  } catch (error) {
    console.error("Paperwork guidance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get paperwork guidance",
    });
  }
});

// Get career path recommendations
router.post("/recommendations/career", authMiddleware, async (req, res) => {
  try {
    const { currentSkills, interests, credentials, experience } = req.body;

    // TODO: AI Partner - Suggest career paths based on profile

    try {
      const aiResponse = await axios.post(
        `${AI_SERVICE_URL}/api/career/recommend`,
        {
          currentSkills,
          interests,
          credentials,
          experience,
          userId: req.user.id,
        },
        {
          headers: { "X-API-Key": process.env.AI_API_KEY },
          timeout: 30000,
        }
      );

      return res.json({
        success: true,
        data: aiResponse.data,
      });
    } catch (aiError) {
      console.log("AI service not available, returning placeholder");
      return res.json({
        success: true,
        data: {
          careerPaths: [],
          recommendations: [],
          message:
            "AI service is being integrated. Career recommendations will be available soon.",
          placeholder: true,
        },
      });
    }
  } catch (error) {
    console.error("Career recommendations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get career recommendations",
    });
  }
});

module.exports = router;
