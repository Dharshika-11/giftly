"""Gemini LLM service for gift recommendations."""
import json
import logging
import re
from typing import List, Optional
import google.generativeai as genai

from app.config import get_settings
from app.schemas.chat import GiftRecommendation

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a thoughtful personal gift-shopping assistant named Giftly.

Your goal is to help users discover gifts that genuinely fit the recipient. You feel like a knowledgeable friend who knows about great gifts — not like a chatbot or AI system.

When helping find a gift, try to understand:
- Who the recipient is (relationship to the user)
- The occasion (birthday, anniversary, graduation, etc.)
- The recipient's age when relevant
- Their interests, hobbies, and personality
- Budget (always acknowledge currency — ₹ for Indian users unless stated otherwise)
- Location when relevant for shipping or local experiences
- Things they already have or wouldn't want

Guidelines:
- Ask ONE concise follow-up question at a time when essential information is missing.
- Do NOT ask unnecessary questions if you already have enough to suggest gifts.
- When you have enough information, provide 3–5 thoughtful, specific gift suggestions.
- Each suggestion should feel personally curated, not generic.
- Speak warmly, naturally, and enthusiastically — like a friend who loves helping people find the perfect gift.
- Never say "As an AI" or reference being an AI system.
- Never invent product links or claim specific products are currently in stock.
- Keep suggestions practical and within the stated budget.
- Vary your suggestions across different categories when possible.

IMPORTANT — Structured Output:
When you are ready to suggest gifts (not during the questioning phase), you MUST respond in this exact JSON format:

{
  "message": "Your warm conversational message here (e.g., 'Here are some ideas I think she'd love!')",
  "recommendations": [
    {
      "name": "Gift name",
      "reason": "Why this fits the recipient (1-2 sentences)",
      "price_range": "₹X,XXX – ₹X,XXX",
      "category": "Category (e.g., Personalized, Tech, Fashion, Wellness, Books, Experience)",
      "personalization": "A specific personal touch idea",
      "alternative": "A related alternative option (optional)"
    }
  ]
}

When you are still asking questions (gathering information), respond with plain conversational text only — NO JSON.

When you have enough information, ALWAYS respond with the JSON format above.
"""


class GeminiService:
    def __init__(self):
        settings = get_settings()
        if not settings.gemini_api_key:
            logger.warning("GEMINI_API_KEY is not set.")
            self._model = None
            return

        genai.configure(api_key=settings.gemini_api_key)
        self._model = genai.GenerativeModel(
            model_name="gemini-3.5-flash",
            system_instruction=SYSTEM_PROMPT,
        )
        logger.info("Gemini service initialized.")

    def _build_history(self, messages: list) -> list:
        """Convert stored messages to Gemini chat history format."""
        settings = get_settings()
        # Limit context to avoid token overflow
        recent = messages[-settings.max_context_messages:]
        history = []
        for msg in recent:
            role = "user" if msg["role"] == "user" else "model"
            history.append({
                "role": role,
                "parts": [{"text": msg["content"]}],
            })
        return history

    def _parse_response(self, text: str) -> tuple[str, List[GiftRecommendation]]:
        """Parse Gemini response — extract JSON if present, else plain text."""
        recommendations: List[GiftRecommendation] = []
        message = text.strip()

        # Try to extract JSON block
        json_match = re.search(r'\{[\s\S]*"message"[\s\S]*"recommendations"[\s\S]*\}', text)
        if not json_match:
            # Also try code block wrapped JSON
            code_match = re.search(r'```(?:json)?\s*(\{[\s\S]*\})\s*```', text)
            if code_match:
                json_match = code_match
                json_str = code_match.group(1)
            else:
                json_str = None
        else:
            json_str = json_match.group(0)

        if json_str:
            try:
                data = json.loads(json_str)
                message = data.get("message", message)
                recs = data.get("recommendations", [])
                for rec in recs:
                    recommendations.append(
                        GiftRecommendation(
                            name=rec.get("name", ""),
                            reason=rec.get("reason", ""),
                            price_range=rec.get("price_range", ""),
                            category=rec.get("category", ""),
                            personalization=rec.get("personalization"),
                            alternative=rec.get("alternative"),
                        )
                    )
            except (json.JSONDecodeError, KeyError) as exc:
                logger.warning("Could not parse structured response: %s", exc)
                message = text.strip()

        return message, recommendations

    async def generate_response(
        self,
        user_message: str,
        conversation_history: list,
    ) -> tuple[str, List[GiftRecommendation]]:
        """Generate a gift assistant response using Gemini."""
        if self._model is None:
            return (
                "I'm having trouble connecting right now. Please ensure the service is configured correctly and try again.",
                [],
            )

        try:
            # Build history excluding the latest user message
            history = self._build_history(conversation_history)

            chat = self._model.start_chat(history=history)
            response = await chat.send_message_async(user_message)
            text = response.text
            return self._parse_response(text)

        except Exception as exc:
            logger.error("Gemini API error: %s", exc)
            raise RuntimeError(f"Failed to generate response: {exc}") from exc


# Singleton instance
_gemini_service: Optional[GeminiService] = None


def get_gemini_service() -> GeminiService:
    global _gemini_service
    if _gemini_service is None:
        _gemini_service = GeminiService()
    return _gemini_service
