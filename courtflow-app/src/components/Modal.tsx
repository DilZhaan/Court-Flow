import type { ReactNode } from 'react'
import { X } from 'lucide-react'

import { Button } from './Button'

interface ModalProps {
  title: string
  open: boolean
  children: ReactNode
  onClose: () => void
}

export function Modal({ title, open, children, onClose }: ModalProps) {
  if (!open) return null

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <h2>{title}</h2>
          <Button variant="ghost" icon={<X size={16} />} onClick={onClose} aria-label="Close modal">
            Close
          </Button>
        </header>
        {children}
      </section>
    </div>
  )
}
