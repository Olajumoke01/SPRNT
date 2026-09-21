import json
import logging
import re

from backend.config import settings

logger = logging.getLogger("sprnt.ai")


class AIService:
    def __init__(self, api_key: str | None = None):
        self._custom_api_key = api_key

    @property
    def api_key(self) -> str | None:
        return self._custom_api_key or settings.ai_api_key

    @property
    def provider(self) -> str:
        return settings.ai_provider

    @property
    def model(self) -> str:
        return settings.ai_model

    def generate_tasks(self, goal: str, planning_mode: str = "ai", duration_minutes: int = 30) -> list[str]:
        cleaned = goal.strip()
        if not cleaned:
            raise ValueError("Goal cannot be empty.")

        total_blocks = max(1, int((duration_minutes or 30) / 15))

        if planning_mode == "manual":
            return self._manual_breakdown(cleaned, total_blocks)

        if self.api_key and self.provider != "local":
            tasks = self._generate_via_api(cleaned, total_blocks)
            if tasks:
                return tasks

        return self._fallback_task_breakdown(cleaned, total_blocks)


    def generate_checkin_message(self, user_response: str, next_task_title: str | None) -> str:
        cleaned_response = (user_response or "").strip()
        if not cleaned_response:
            cleaned_response = "I stayed focused and made progress on this block."

        if self.api_key and self.provider != "local":
            msg = self._generate_checkin_via_api(cleaned_response, next_task_title)
            if msg:
                return msg

        return self._fallback_checkin_message(cleaned_response, next_task_title)

    def _manual_breakdown(self, goal: str, total_blocks: int) -> list[str]:
        title = re.sub(r"\s+", " ", goal).strip()
        tasks = []
        for index in range(1, total_blocks + 1):
            tasks.append(f"Block {index}/{total_blocks}: define the next 15-minute win for {title}")
        return tasks[:total_blocks]

    def _fallback_task_breakdown(self, goal: str, total_blocks: int) -> list[str]:
        title = re.sub(r"\s+", " ", goal).strip()
        tasks = [f"Block 1/{total_blocks}: set up and begin first micro-step for {title}"]
        for index in range(1, total_blocks + 1):
            tasks.append(f"Block {index}/{total_blocks}: focused execution sprint on {title}")
        tasks.append(f"Block {total_blocks}/{total_blocks}: review, polish, and wrap up {title}")
        return tasks

    def _fallback_checkin_message(self, user_response: str, next_task_title: str | None) -> str:
        next_text = f" Next step: '{next_task_title}'." if next_task_title else " You're all done with this sprint!"
        return (
            f"Great momentum! Logging '{user_response}' is a win for your executive focus.{next_text} "
            "Take a deep breath and keep this steady rhythm."
        )

    def _extract_text_from_response(self, response) -> str:
        if hasattr(response, "text") and response.text:
            return str(response.text)

        candidates = getattr(response, "candidates", None) or []
        for candidate in candidates:
            content = getattr(candidate, "content", None)
            if not content:
                continue
            parts = getattr(content, "parts", None) or []
            for part in parts:
                text = getattr(part, "text", None)
                if text:
                    return str(text)

        return str(response)

    def _parse_task_list(self, raw_text: str, total_blocks: int) -> list[str]:
        cleaned = raw_text.strip()
        # Remove markdown fences if present
        if "```" in cleaned:
            cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", cleaned.strip(), flags=re.S)

        # Attempt JSON parse
        tasks: list[str] = []
        match = re.search(r"\{.*\}", cleaned, re.S)
        json_str = match.group(0) if match else cleaned

        try:
            parsed = json.loads(json_str)
            raw_items = parsed.get("tasks", []) if isinstance(parsed, dict) else parsed
            if isinstance(raw_items, list):
                for item in raw_items:
                    if isinstance(item, str) and item.strip():
                        tasks.append(item.strip())
                    elif isinstance(item, dict):
                        title = item.get("title") or item.get("task") or item.get("name") or item.get("description")
                        if title and str(title).strip():
                            tasks.append(str(title).strip())
        except Exception:
            # Fallback to regex line matching if JSON parsing fails
            lines = [line.strip() for line in cleaned.split("\n") if line.strip()]
            for line in lines:
                m = re.match(r"^(?:\d+[\.\)]|-|\*)\s+(.+)$", line)
                if m:
                    tasks.append(m.group(1).strip())

        # Clean any quotes or prefixes
        cleaned_tasks = []
        for t in tasks:
            t_clean = re.sub(r"^[\"']|[\"']$", "", t).strip()
            if t_clean:
                cleaned_tasks.append(t_clean)

        return cleaned_tasks

    def _get_client(self):
        if not self.api_key:
            return None
        try:
            from google import genai
            return genai.Client(api_key=self.api_key)
        except Exception as e:
            logger.warning(f"Failed to initialize Gemini client: {e}")
            return None

    def _generate_via_api(self, goal: str, total_blocks: int) -> list[str]:
        client = self._get_client()
        if not client:
            return self._fallback_task_breakdown(goal, total_blocks)

        models_to_try = [self.model, "gemini-2.5-flash", "gemini-2.0-flash"]
        unique_models = []
        for m in models_to_try:
            if m and m not in unique_models:
                unique_models.append(m)

        prompt = (
            f"You are SPRNT, an expert ADHD and focus coach. Break down the user's goal into exactly "
            f"{total_blocks} distinct, highly actionable 15-minute focus blocks.\n"
            f"Goal: '{goal}'.\n\n"
            f"ADHD-friendly requirements:\n"
            f"- Block 1 must be ultra low-friction to overcome task paralysis/inertia.\n"
            f"- Each block must be a concrete, bite-sized outcome achievable in 15 minutes.\n"
            f"- Avoid vague instructions; make each task title clear and active (e.g., 'Draft outline and bullet key points').\n"
            f"- Return ONLY a JSON object in this exact format: {{\"tasks\": [\"task 1\", \"task 2\", ...]}}"
        )

        for model_name in unique_models:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                text = self._extract_text_from_response(response)
                tasks = self._parse_task_list(text, total_blocks)
                if tasks:
                    if len(tasks) >= total_blocks:
                        return tasks[:total_blocks]
                    # Fill any missing block
                    while len(tasks) < total_blocks:
                        idx = len(tasks) + 1
                        tasks.append(f"Block {idx}/{total_blocks}: continue focused progress on {goal}")
                    return tasks
            except Exception as e:
                logger.warning(f"Gemini model {model_name} failed: {e}. Trying fallback if available.")
                continue

        return self._fallback_task_breakdown(goal, total_blocks)

    def _generate_checkin_via_api(self, user_response: str, next_task_title: str | None) -> str:
        client = self._get_client()
        if not client:
            return self._fallback_checkin_message(user_response, next_task_title)

        models_to_try = [self.model, "gemini-2.5-flash", "gemini-2.0-flash"]
        unique_models = []
        for m in models_to_try:
            if m and m not in unique_models:
                unique_models.append(m)

        next_hint = (
            f"The next 15-minute task is: '{next_task_title}'."
            if next_task_title
            else "This was the final block of the session!"
        )

        prompt = (
            "You are SPRNT, an encouraging, neurodivergent-friendly AI focus accountability partner.\n"
            f"The user just completed a 15-minute focus block and reported:\n"
            f"\"{user_response}\"\n\n"
            f"{next_hint}\n\n"
            "Provide a 1-2 sentence warm, energizing, and validating response. "
            "Celebrate their actual progress and gently nudge them with confidence into the next step. "
            "Keep it concise, friendly, and avoid toxic positivity."
        )

        for model_name in unique_models:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                text = self._extract_text_from_response(response)
                cleaned = text.strip()
                if cleaned:
                    return cleaned
            except Exception as e:
                logger.warning(f"Checkin generation with model {model_name} failed: {e}")
                continue

        return self._fallback_checkin_message(user_response, next_task_title)


ai_service = AIService()

