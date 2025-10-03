import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type SidebarState = {
  isCollapsed: boolean
  toggleSidebar: () => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ isCollapsed: !state.isCollapsed })),
    }),
    {
      name: 'sidebar-storage', // name of the item in the storage (must be unique)
    },
  ),
)
