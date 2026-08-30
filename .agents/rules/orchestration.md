# Workflow & Multi-Agent Orchestration Directives

## Model Hierarchy & Task Assignment Rules:

1. **Planning & Architectural Reasoning**:
   - Always plan using **Gemini 3.7 Flash High** (Parent Coordinator).
   - Generates full chronological plans in `plans/` before execution.

2. **Simple Tasks, Reading Files & Basic Execution**:
   - **Reading files, inspection, search, modular code edits, type definitions, specific UI tweaks, tests, syntax fixes, and anything simple that does not require a powerful model**:
     -> Delegate and run using **Gemini 3.7 Flash Low** (`Model: 'flash_lite'`).

3. **Complex Tasks & Decisioning**:
   - **Bigger tasks that require high-level decisioning, complex component refactors, multi-system architectural transitions, domain heuristics**:
     -> Use **Gemini 3.7 Flash Medium** (`Model: 'flash'`).
