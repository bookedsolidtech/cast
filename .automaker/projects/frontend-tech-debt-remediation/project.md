# Project: Frontend Tech Debt Remediation

## Goal
Eliminate the remaining frontend tech debt: decompose the monolithic terminal panel, reach full Storybook coverage with Chromatic CI, extract organisms to the shared UI package, and establish the a11y linting baseline.

## Milestones
1. A11y Baseline - Install eslint-plugin-jsx-a11y, wire it into the ESLint config, and verify @storybook/addon-a11y is enabled in preview.tsx. Quick win that unblocks the Storybook milestone.
2. Storybook Coverage - Delete 5 duplicate stories from apps/ui, add missing atom stories in libs/ui, add stories for the 6 molecule components, and set up Chromatic CI integration.
3. Terminal Panel Decomposition - Break terminal-panel.tsx (2,251 lines) into focused sub-components: a toolbar, a settings popover, and a keyboard shortcut display. The parent component orchestrates but delegates rendering to these children.
4. Organisms Extraction - Populate libs/ui/src/organisms/ by migrating hitl-form/* and protolabs-report/* from apps/ui/src/components/shared/. Update all import paths.
