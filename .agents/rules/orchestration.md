# Workflow & Multi-Agent Orchestration Directives

## Model Hierarchy & Task Assignment Rules:

1. **Planning & Architectural Reasoning**:
   - Always plan using **Gemini 3.7 Flash High** (Parent Coordinator).
   - Generates full chronological plans in `plans/` before execution.

2. **Subagent Spawning & Tier Allocation**:
   - **Small Individual Tasks** (Modular code edits, types, specific UI components, test runners, JSX fixes, script runs):
     -> Use **Gemini 3.7 Flash Low** (`Model: 'flash_lite'`).
   - **Bigger Tasks & Decisioning** (Complex component refactors, multi-file architectural transitions, domain evaluation, heuristic scoring):
     -> Use **Gemini 3.7 Flash Medium** (`Model: 'flash'`).
