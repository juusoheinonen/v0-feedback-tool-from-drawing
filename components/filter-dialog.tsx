"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface FilterDialogProps {
  isOpen: boolean
  onClose: () => void
  filters: {
    received: boolean
    sent: boolean
    wishSent: boolean
    wishReceived: boolean
  }
  setFilters: React.Dispatch<
    React.SetStateAction<{
      received: boolean
      sent: boolean
      wishSent: boolean
      wishReceived: boolean
    }>
  >
}

export default function FilterDialog({ isOpen, onClose, filters, setFilters }: FilterDialogProps) {
  const handleFilterChange = (key: keyof typeof filters) => {
    setFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">Filter Feedback</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="received"
              checked={filters.received}
              onCheckedChange={() => handleFilterChange("received")}
              className="h-5 w-5 border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="received" className="text-gray-700 font-medium">
              Feedback Received
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="sent"
              checked={filters.sent}
              onCheckedChange={() => handleFilterChange("sent")}
              className="h-5 w-5 border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="sent" className="text-gray-700 font-medium">
              Feedback Sent
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="wishSent"
              checked={filters.wishSent}
              onCheckedChange={() => handleFilterChange("wishSent")}
              className="h-5 w-5 border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="wishSent" className="text-gray-700 font-medium">
              Wish Sent
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="wishReceived"
              checked={filters.wishReceived}
              onCheckedChange={() => handleFilterChange("wishReceived")}
              className="h-5 w-5 border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="wishReceived" className="text-gray-700 font-medium">
              Wish Received
            </Label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
