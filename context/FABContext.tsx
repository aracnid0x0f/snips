import React, { createContext, useContext, useState, ReactNode } from 'react'

type FABContextType = {
  isFABVisible: boolean
  setFABVisible: (visible: boolean) => void
  isFABExpanded: boolean
  setFABExpanded: (expanded: boolean) => void
}

const FABContext = createContext<FABContextType | undefined>(undefined)

export function FABProvider({ children }: { children: ReactNode }) {
  const [isFABVisible, setFABVisible] = useState(true)
  const [isFABExpanded, setFABExpanded] = useState(false)

  return (
    <FABContext.Provider
      value={{
        isFABVisible,
        setFABVisible,
        isFABExpanded,
        setFABExpanded,
      }}
    >
      {children}
    </FABContext.Provider>
  )
}

export function useFAB() {
  const context = useContext(FABContext)
  if (context === undefined) {
    throw new Error('useFAB must be used within a FABProvider')
  }
  return context
}
