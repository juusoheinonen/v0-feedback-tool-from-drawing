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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Feedback</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="received" checked={filters.received} onCheckedChange={() => handleFilterChange("received")} />
            <Label htmlFor="received">Feedback Received</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="sent" checked={filters.sent} onCheckedChange={() => handleFilterChange("sent")} />
            <Label htmlFor="sent">Feedback Sent</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="wishSent" checked={filters.wishSent} onCheckedChange={() => handleFilterChange("wishSent")} />
            <Label htmlFor="wishSent">Wish Sent</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="wishReceived"
              checked={filters.wishReceived}
              onCheckedChange={() => handleFilterChange("wishReceived")}
            />
            <Label htmlFor="wishReceived">Wish Received</Label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
