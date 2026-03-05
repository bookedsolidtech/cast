# PRD: macOS System Tray Icon

## Situation
The protoLabs Studio Electron app already handles macOS window lifecycle correctly — closing the main window keeps the server and app process alive. However, there is no tray icon or menubar presence, so once the window is closed there is no visual indication that Ava is still running and no way to reopen it without going to the Dock. The global Cmd+Shift+Space overlay exists but is invisible to users who don't know the shortcut.

## Problem
Users have no persistent visual anchor for Ava in the macOS menubar. Closing the window feels like quitting the app even though the server is still running. There is no quick way to: (1) reopen the board, (2) see at a glance whether agents are active, or (3) quit cleanly. The Cmd+Q shortcut also fully quits the app and server, which is destructive if agents are mid-execution.

## Approach
Add a native Electron Tray icon to the macOS menubar using the built-in Tray and Menu classes (no new npm packages). The tray icon will show the app logo (icon-16.png already exists), display a context menu with 'Open Board', a live agent count status line, and 'Quit'. Change the main window close behavior on macOS to hide (not destroy) the window for instant re-open. Intercept Cmd+Q on macOS to hide the window instead of quitting, with quit only available via the tray menu. Wire a polling loop in the main process to fetch /api/agents/running and update the tray tooltip and menu dynamically.

## Results
Users see a menubar icon whenever Ava is running. Clicking it shows the board instantly (hidden window, not re-created). The menu shows live agent count. Quitting requires a deliberate action via the tray menu. The app feels like a proper macOS background service rather than a window-centric app.

## Constraints
macOS only — tray code must be gated behind process.platform === 'darwin' guards,No new npm packages — Tray and Menu are built into Electron 39,All changes in apps/ui/src/main.ts — no new files unless strictly necessary,Must not break Windows or Linux behavior,Must not break the existing overlay (Cmd+Shift+Space) or auto-updater,Tray must be destroyed cleanly in the before-quit handler,Window hide-on-close must only apply on macOS
