import { cn } from '@/lib/utils'
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

export type ToastVariant = 'default' | 'destructive'

interface ToastOptions {
  title: string
  description?: string
  variant?: ToastVariant
}

interface ToastMessage extends ToastOptions {
  id: string
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

function createToastId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const toast = useCallback((options: ToastOptions) => {
    const id = createToastId()

    setMessages((previous) => [...previous, { id, ...options }])

    window.setTimeout(() => {
      setMessages((previous) => previous.filter((message) => message.id !== id))
    }, 3500)
  }, [])

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex w-[min(92vw,24rem)] flex-col gap-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'pointer-events-auto rounded-md border bg-background p-4 shadow-lg',
              message.variant === 'destructive' ? 'border-destructive text-destructive' : 'border-border text-foreground'
            )}
          >
            <p className="text-sm font-semibold">{message.title}</p>
            {message.description ? (
              <p className="mt-1 text-sm text-muted-foreground">{message.description}</p>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return context
}
