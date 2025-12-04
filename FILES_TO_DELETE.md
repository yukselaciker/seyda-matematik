# 🗑️ Files to Delete - Static Site Conversion

## Files to DELETE Manually

### Authentication & Admin Components
- ✅ `frontend/components/AuthPage.tsx` - Login/Register page
- ✅ `frontend/components/DashboardLayout.tsx` - Dashboard wrapper
- ✅ `frontend/components/StudentPanel.tsx` - Student dashboard (causing build errors)
- ✅ `frontend/components/TeacherPanel.tsx` - Teacher dashboard
- ✅ `frontend/components/AdminMessages.tsx` - Admin messages panel

### Student Components (No longer needed)
- ✅ `frontend/components/student/` - **ENTIRE FOLDER** - Delete the whole directory:
  - `ActiveClassmates.tsx`
  - `AppointmentRequestsTab.tsx`
  - `AppointmentTab.tsx`
  - `CalendarTab.tsx`
  - `ChatTab.tsx`
  - `DragDropUpload.tsx`
  - `EmptyState.tsx`
  - `FlashcardGame.tsx`
  - `GamificationHeader.tsx`
  - `HomeworkTab.tsx`
  - `index.ts`
  - `LibraryTab.tsx`
  - `LoadingSpinner.tsx` (or keep if used elsewhere)
  - `OverviewTab.tsx`
  - `PomodoroTimer.tsx`
  - `PracticeExamsTab.tsx`
  - `VideoManagementTab.tsx`
  - `VideosTab.tsx`
  - `VideoUploadTab.tsx`
  - `Whiteboard.tsx`

### Services & Storage (No longer needed)
- ✅ `frontend/services/StorageService.ts` - localStorage management (not needed for static site)
- ✅ `frontend/mockDb.ts` - Mock database (not needed)

### Hooks (No longer needed)
- ✅ `frontend/hooks/useStudentSystem.ts` - Student system logic
- ✅ `frontend/hooks/useSystemHealth.ts` - System health monitoring
- ✅ `frontend/hooks/useSystemMonitor.ts` - System monitoring
- ⚠️ `frontend/hooks/index.ts` - Check if only exports above hooks, then delete

### Types (Cleanup)
- ⚠️ `frontend/types.ts` - Review and remove User, Homework, and other auth-related types. Keep only public types if any.

---

## Quick Delete Command

```bash
cd frontend

# Delete auth/admin components
rm components/AuthPage.tsx
rm components/DashboardLayout.tsx
rm components/StudentPanel.tsx
rm components/TeacherPanel.tsx
rm components/AdminMessages.tsx

# Delete entire student folder
rm -rf components/student/

# Delete services
rm services/StorageService.ts

# Delete hooks
rm hooks/useStudentSystem.ts
rm hooks/useSystemHealth.ts
rm hooks/useSystemMonitor.ts

# Delete mock database
rm mockDb.ts
```

---

## Files to KEEP (Public Static Site)

✅ **Keep these:**
- `App.tsx` - Already cleaned
- `Navbar.tsx` - Already cleaned
- `Hero.tsx`
- `About.tsx`
- `Services.tsx`
- `Features.tsx`
- `Testimonials.tsx`
- `FAQ.tsx`
- `Contact.tsx` - Uses API config
- `Footer.tsx`
- `BookingModal.tsx`
- `CommonMistakes.tsx`
- `MathAssistant.tsx`
- `Logo.tsx`
- `ErrorBoundary.tsx`
- `contexts/ToastContext.tsx` - Still needed for notifications
- `config/api.ts` - NEW: API configuration

---

## After Deletion

1. **Check for broken imports:**
   ```bash
   npm run build
   ```

2. **Fix any remaining imports:**
   - Search for `StudentPanel`, `AuthPage`, `DashboardLayout` references
   - Remove unused imports

3. **Test the site:**
   ```bash
   npm run dev
   ```




