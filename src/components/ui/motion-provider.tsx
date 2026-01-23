"use client"

import { useContext, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime"

function FrozenRouter(props: { children: React.ReactNode }) {
    const context = useContext(LayoutRouterContext)
    const frozen = useRef(context).current

    return (
        <LayoutRouterContext.Provider value={frozen}>
            {props.children}
        </LayoutRouterContext.Provider>
    )
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 15, filter: "blur(5px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -15, filter: "blur(5px)" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full flex-1"
            >
                <FrozenRouter>{children}</FrozenRouter>
            </motion.div>
        </AnimatePresence>
    )
}
