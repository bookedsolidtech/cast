# Phase 1: Core Tray + Window Hide Behavior

**Duration**: 0.5-1 week
**Owner**: TBD
**Dependencies**: None
**Parallel Work**: Can run alongside other phases (if applicable)

---

## Overview

Add Tray and Menu to imports, create a createTray() function that initializes the menubar icon with a context menu (Open Board, separator, Quit), wire tray click to show/focus the main window. Change mainWindow close handler on macOS to call hide() instead of allowing destroy. Intercept the 'before-quit' intent from Cmd+Q on macOS: register a 'will-quit' listener that only allows quit when a flag isQuittingIntentionally is set (set by the tray Quit menu item). Add tray.destroy() cleanup in the existing before-quit handler. Gate all tray code behind process.platform === 'darwin'. The icon to use is path.join(__dirname, '../public/icons/icon-16.png') — verify this resolves correctly in both dev and packaged builds using getIconPath() pattern already in the file.

---

## Tasks

### Files to Create/Modify
- [ ] `apps/ui/src/main.ts`

### Verification
- [ ] Tray icon appears in macOS menubar when app starts
- [ ] Clicking tray icon shows/focuses the main window
- [ ] Context menu has 'Open Board' and 'Quit' items
- [ ] Clicking window red X hides the window (not quit) on macOS
- [ ] Cmd+Q hides window instead of quitting on macOS
- [ ] Tray 'Quit' fully quits the app and server
- [ ] Tray icon is destroyed in before-quit handler
- [ ] Windows and Linux behavior unchanged
- [ ] npm run build:server passes with no TypeScript errors

---

## Deliverables

- [ ] Code implemented and working
- [ ] Tests passing
- [ ] Documentation updated

---

## Handoff Checklist

Before marking Phase 1 complete:

- [ ] All tasks complete
- [ ] Tests passing
- [ ] Code reviewed
- [ ] PR merged to main
- [ ] Team notified

**Next**: Phase 2
