import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useBoutiqueStore = create()(
    persist(
        (set) => ({
            boutiqueActive: null,
            selectionnerBoutique: (boutique) =>
                set({ boutiqueActive: boutique }),
            deselectionnerBoutique: () =>
                set({ boutiqueActive: null }),
        }),
        {
            name: 'kalis_boutique',
            storage: createJSONStorage(() => localStorage),
        },
    ),
)
