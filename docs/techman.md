# Techman: Self-Reflective Agentic Environment

## Core Concept

Techman is a personal intelligence system that continuously models your evolving interests, tools, and behavior through autonomous agents. It provides a living dashboard of your digital workspace.

### The Vision

Imagine opening a dashboard that knows:
- What you're currently working on
- TODOs scattered across your projects
- Emerging interests from your browsing patterns
- Suggestions for workflow improvements
- Forgotten projects worth revisiting

All updated automatically, without breaking, evolving with your needs.

### Architecture Principles

1. **Three-Tier Agent System**
   - **Data Sources**: Gather raw signals (files, browser history, git commits)
   - **Analyzers**: Extract meaning (identify TODOs, track interests, measure velocity)
   - **Wildcards**: Suggest improvements (new workflows, forgotten connections)

2. **Fault-Tolerant Data Flow**
   ```
   External Sources → [Agents] → Data Store → [Dashboard]
                                      ↓
                              (Never breaks on schema changes)
   ```

3. **Loose Coupling**
   - Agents produce versioned data
   - Dashboard consumes what exists
   - Missing data = graceful degradation
   - Schema evolution without migration pain

4. **Server-Based Design**
   - Agents as API endpoints
   - Background processing
   - Real-time updates possible
   - Multiple interfaces (CLI, Web, API)

## Implementation Strategy

This concept will be built through a series of verifiable Proof-of-Concept stages:

### Stage 1: Minimal Viable Intelligence
Single agent, simple server, basic data persistence

### Stage 2: Data Resilience  
Schema versioning, graceful failures, evolution support

### Stage 3: Dashboard Foundation
Read-only view, dynamic data binding, zero-build architecture

### Stage 4: Agent Ecosystem
Registry, scheduling, inter-agent communication

### Stage 5: Intelligence Layer
Pattern detection, suggestions, predictive features

Each stage produces a working system that validates core assumptions before building further.

## Next Steps

See implementation stages:
- `stages/01-minimal-server.md`
- `stages/02-data-contracts.md` 
- `stages/03-dashboard.md`
- (etc.)

The goal is not to build everything at once, but to create a sustainable, evolving system that grows with your needs while maintaining simplicity at its core.
