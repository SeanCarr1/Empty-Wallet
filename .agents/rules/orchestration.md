# Workflow & Multi-Agent Orchestration Directives

## Model Hierarchy & Task Assignment Rules:

1. **Planning, Architectural Reasoning & In-Depth Research**:
   - **Planning, architecture design, and comprehensive deep research (including the `research` skill)**:
     -> MUST use **Gemini 3.7 Flash High** (`pro` / `inherit` / Parent Coordinator).
   - Generates full chronological plans in `plans/` and comprehensive research docs in `research/`.

2. **Simple Tasks, Reading Files & Basic Execution**:
   - **Reading specific files, codebase inspection, search, modular code edits, type definitions, specific UI tweaks, tests, syntax fixes, and anything simple that does not require a powerful model**:
     -> Delegate and run using **Gemini 3.7 Flash Low** (`Model: 'flash_lite'`).

3. **Complex Tasks & Decisioning**:
   - **Bigger tasks that require high-level decisioning, complex component refactors, multi-system architectural transitions, domain heuristics**:
     -> Use **Gemini 3.7 Flash Medium** (`Model: 'flash'`).

4. **Subagent Spawning Notification Protocol**:
   - **Whenever spawning subagents**, the coordinator MUST report to the user:
     - **Task / Role**: Exact purpose and scope of work.
     - **Model Used**: (e.g. Gemini 3.7 Flash High `pro`, Gemini 3.7 Flash Medium `flash`, or Gemini 3.7 Flash Low `flash_lite`).
     - **Expected Runtime**: Estimated execution time.
     - **Skills Used**: (e.g. `research`, `impeccable`, or default toolset).
