# Admin Menu Styling Plan

## Overview
The goal is to improve the styling and visual hierarchy of the admin module's navigation menu to make it feel more premium, organized, and user-friendly.

## Proposed Changes

1. **Add Icons**: Integrate `lucide-react` icons (or existing icon library) for each menu item to provide quick visual context and improve aesthetics.
2. **Refine Typography**: 
   - Enhance the group headers (e.g., "Overview", "Catalog") with a slightly more prominent but refined style (e.g., modern tracking, specific text colors).
   - Adjust font weights and sizes for menu items to clearly distinguish active vs. inactive states.
3. **Enhance Active & Hover States**:
   - Add a subtle background color or gradient to the active item, along with an accent border (e.g., a left border).
   - Implement smoother, micro-animation hover effects (e.g., slight background shift, text color change, or subtle scaling).
4. **Spacing & Layout**:
   - Refine the padding and margin between groups and items.
   - Adjust the width of the sidebar if necessary to accommodate the new icons comfortably.
5. **Footer / Logout Area**:
   - Style the logout button to look consistent with the newly styled menu items (e.g., using a distinct icon and hover state).

## Next Steps
Once this plan is approved or modified, I will:
- Update `apps/web-admin/src/app/(dashboard)/layout.tsx` to include the icons and new styling classes.
- Ensure the changes align with the overall platform design system.
