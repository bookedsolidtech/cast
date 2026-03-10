# Project: Calendar Domain Hardening & Completion

## Goal
Fix all 14 identified gaps, bugs, missing logic, and security issues in the calendar domain — covering CalendarService, JobExecutorService, GoogleCalendarSyncService, MCP tools, CRDT wiring, ceremony integration, WebSocket push, and test coverage.

## Milestones
1. Critical Bug Fixes & Security - Fix the four P1 issues: MCP enum mismatch, shell injection vulnerability, CRDT project scoping collision, and dead reminder pipeline wiring. These are independent fixes that unblock correct behavior for everything downstream.
2. Runtime Integrations & Google Sync Completion - Add the missing runtime integrations: WebSocket push for calendar events, ceremony-to-calendar bridge, and Google Calendar sync completion (cancelled event deletion + periodic scheduler).
3. Skill Rewrite & Test Coverage - Rewrite the calendar-assistant skill for SDK-native agent patterns (no execute_dynamic_agent), then add test coverage for the now-correct calendar implementation.
