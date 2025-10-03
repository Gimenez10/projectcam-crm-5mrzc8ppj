import { create } from 'zustand'

type SidebarState = {
  isExpanded: boolean
  setIsExpanded: (isExpanded: boolean) => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isExpanded: false,
  setIsExpanded: (isExpanded) => set({ isExpanded }),
}))
