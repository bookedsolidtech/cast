# Project: Ava Delegation Architecture

## Goal
Redesign Ava's tool surface from a 69-tool monolith into a delegated 3-tier architecture: Ask Ava (slim operator assistant with delegation, info gathering, audit tools) → Project PM (full project lifecycle tools per project) → Lead Engineer (execution orchestration). Ava delegates project-specific questions to the PM via backchannel rather than having direct access to every project tool.

