"use client"

import React from "react"
import Button from "react-bootstrap/Button" // Using react-bootstrap Button
import Spinner from "react-bootstrap/Spinner" // Using react-bootstrap Spinner
import { useMediaQuery } from "../hooks/use-media-query"
import { X } from 'lucide-react' // Using Lucide React for close icon

export function DeleteConfirmationDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (!isOpen) return null

  const commonClasses = "fixed inset-0 z-50 flex items-center justify-center bg-black/50"

  if (isDesktop) {
    return (
      <div className={commonClasses}>
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in-up">
          <div className="flex justify-between items-center pb-4 border-b">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close dialog"
              disabled={isLoading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="py-4 text-gray-700">
            <p>{description}</p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="warning" onClick={() => onOpenChange(false)} disabled={isLoading}>
              {cancelText}
            </Button>
            <Button variant="primary" onClick={onConfirm} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" className="mr-2" />
                  Loading...
                </>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Mobile Drawer
  return (
    <div className={`${commonClasses} items-end`}>
      <div className="relative bg-white rounded-t-lg shadow-xl w-full p-6 animate-slide-in-bottom">
        <div className="flex justify-between items-center pb-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close drawer"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="py-4 text-gray-700">
          <p>{description}</p>
        </div>
        <div className="flex flex-col gap-3 pt-4 border-t">
          <Button variant="primary" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" className="mr-2" />
                Loading...
              </>
            ) : (
              confirmText
            )}
          </Button>
          <Button variant="warning" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {cancelText}
          </Button>
        </div>
      </div>
    </div>
  )
}
