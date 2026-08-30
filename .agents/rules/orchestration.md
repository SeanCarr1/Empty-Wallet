# Workflow & Multi-Agent Orchestration Directives

## Standard Execution Protocol:
1. **Interactive Questions & Scoping**:
   - Conduct design/feature discovery and questions using Gemini 3.7 Flash Medium.
2. **Detailed Plan Generation**:
   - Once a generic plan is aligned, generate the full structured chronological plan (in `plans/XXX_...md`) using Gemini 3.7 Flash High / High reasoning.
3. **Parallel Subagent Execution**:
   - Decompose and execute implementation tasks using parallel subagents equipped with Gemini 3.7 Flash Low (`flash_lite` / `flash`) models.
