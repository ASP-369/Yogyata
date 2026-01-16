const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth.middleware");
const axios = require("axios");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

/**
 * CHATBOT INTEGRATION ENDPOINTS
 * These endpoints handle chatbot interactions for different use cases
 * The AI partner should implement the chatbot service
 */

// General chatbot interaction
router.post("/message", authMiddleware, async (req, res) => {
  try {
    const { message, conversationId, context } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // TODO: AI Partner - Implement chatbot logic
    // Expected to handle general queries about credentials, platform usage, etc.

    try {
      const aiResponse = await axios.post(
        `${AI_SERVICE_URL}/api/chatbot/message`,
        {
          message,
          conversationId,
          context,
          userId: req.user.id,
          userRole: req.user.user_metadata?.role,
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
      console.log("Chatbot service not available, returning placeholder");
      return res.json({
        success: true,
        data: {
          reply:
            "I'm currently being set up. Please check back soon for AI-powered assistance!",
          conversationId: conversationId || `conv_${Date.now()}`,
          placeholder: true,
        },
      });
    }
  } catch (error) {
    console.error("Chatbot message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process message",
    });
  }
});

// Credential guidance chatbot
router.post("/credential-guide", authMiddleware, async (req, res) => {
  try {
    const { question, credentialType, conversationId } = req.body;

    // TODO: AI Partner - Chatbot specifically for credential-related questions

    try {
      const aiResponse = await axios.post(
        `${AI_SERVICE_URL}/api/chatbot/credential-guide`,
        {
          question,
          credentialType,
          conversationId,
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
      return res.json({
        success: true,
        data: {
          reply:
            "The credential guidance assistant is being configured. Stay tuned!",
          conversationId: conversationId || `cred_${Date.now()}`,
          placeholder: true,
        },
      });
    }
  } catch (error) {
    console.error("Credential guide error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process credential question",
    });
  }
});

// University application assistant chatbot
router.post("/university-assistant", authMiddleware, async (req, res) => {
  try {
    const { question, targetUniversity, targetProgram, conversationId } =
      req.body;

    // TODO: AI Partner - Chatbot for university application guidance

    try {
      const aiResponse = await axios.post(
        `${AI_SERVICE_URL}/api/chatbot/university-assistant`,
        {
          question,
          targetUniversity,
          targetProgram,
          conversationId,
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
      return res.json({
        success: true,
        data: {
          reply:
            "The university application assistant is being set up. Please check back soon!",
          conversationId: conversationId || `uni_${Date.now()}`,
          placeholder: true,
        },
      });
    }
  } catch (error) {
    console.error("University assistant error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process university question",
    });
  }
});

// Career counseling chatbot
router.post("/career-counselor", authMiddleware, async (req, res) => {
  try {
    const { question, currentProfile, conversationId } = req.body;

    // TODO: AI Partner - Career counseling chatbot

    try {
      const aiResponse = await axios.post(
        `${AI_SERVICE_URL}/api/chatbot/career-counselor`,
        {
          question,
          currentProfile,
          conversationId,
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
      return res.json({
        success: true,
        data: {
          reply:
            "The career counselor is being configured. Stay tuned for personalized career guidance!",
          conversationId: conversationId || `career_${Date.now()}`,
          placeholder: true,
        },
      });
    }
  } catch (error) {
    console.error("Career counselor error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process career question",
    });
  }
});

// Get conversation history
router.get("/history/:conversationId", authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;

    try {
      const aiResponse = await axios.get(
        `${AI_SERVICE_URL}/api/chatbot/history/${conversationId}`,
        {
          headers: {
            "X-API-Key": process.env.AI_API_KEY,
            "X-User-Id": req.user.id,
          },
          timeout: 10000,
        }
      );

      return res.json({
        success: true,
        data: aiResponse.data,
      });
    } catch (aiError) {
      return res.json({
        success: true,
        data: {
          messages: [],
          placeholder: true,
        },
      });
    }
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get conversation history",
    });
  }
});

// Clear conversation
router.delete(
  "/conversation/:conversationId",
  authMiddleware,
  async (req, res) => {
    try {
      const { conversationId } = req.params;

      try {
        await axios.delete(
          `${AI_SERVICE_URL}/api/chatbot/conversation/${conversationId}`,
          {
            headers: {
              "X-API-Key": process.env.AI_API_KEY,
              "X-User-Id": req.user.id,
            },
            timeout: 10000,
          }
        );
      } catch (aiError) {
        // Silently handle if service not available
      }

      res.json({
        success: true,
        message: "Conversation cleared",
      });
    } catch (error) {
      console.error("Clear conversation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to clear conversation",
      });
    }
  }
);

module.exports = router;
