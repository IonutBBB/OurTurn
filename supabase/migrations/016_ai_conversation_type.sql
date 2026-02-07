-- Add conversation type and context to ai_conversations
ALTER TABLE ai_conversations
  ADD COLUMN conversation_type TEXT DEFAULT 'open'
    CHECK (conversation_type IN ('situation', 'workflow', 'topic', 'open')),
  ADD COLUMN conversation_context TEXT;
