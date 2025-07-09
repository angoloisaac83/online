"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { currencies } from "@/lib/currency-utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, UserPlus, X, RefreshCw } from "lucide-react"

interface CreateUserFormProps {
  loading: boolean
  onSave: (userData: any) => void
  onCancel: () => void
}

// Generate random codes
function generateIMFCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

function generateVATCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function CreateUserForm({ loading, onSave, onCancel }: CreateUserFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    balance: 0,
    savingsBalance: 0,
    currentBalance: 0,
    status: "active",
    kycStatus: "pending",
    role: "user",
    currency: "USD",
    imfCode: generateIMFCode(),
    vatCode: generateVATCode(),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Creating user with data:", formData)
    onSave(formData)
  }

  const handleInputChange = (field: string, value: any) => {
    console.log(`Updating ${field} to:`, value)
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const regenerateCodes = () => {
    const newIMF = generateIMFCode()
    const newVAT = generateVATCode()
    console.log("Regenerating codes:", { imf: newIMF, vat: newVAT })
    setFormData((prev) => ({
      ...prev,
      imfCode: newIMF,
      vatCode: newVAT,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Personal Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              placeholder="Enter first name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              placeholder="Enter last name"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="Enter password"
              required
              minLength={6}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="Enter phone number"
          />
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Address Information</h3>

        <div className="space-y-2">
          <Label htmlFor="address">Street Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            placeholder="Enter street address"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              placeholder="Enter city"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CA">California</SelectItem>
                <SelectItem value="NY">New York</SelectItem>
                <SelectItem value="TX">Texas</SelectItem>
                <SelectItem value="FL">Florida</SelectItem>
                <SelectItem value="IL">Illinois</SelectItem>
                <SelectItem value="WA">Washington</SelectItem>
                <SelectItem value="OR">Oregon</SelectItem>
                <SelectItem value="NV">Nevada</SelectItem>
                <SelectItem value="AZ">Arizona</SelectItem>
                <SelectItem value="CO">Colorado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => handleInputChange("zipCode", e.target.value)}
              placeholder="Enter ZIP code"
            />
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Account Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="balance">Main Balance ({formData.currency})</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) => handleInputChange("balance", Number.parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="savingsBalance">Savings Balance ({formData.currency})</Label>
            <Input
              id="savingsBalance"
              type="number"
              step="0.01"
              value={formData.savingsBalance}
              onChange={(e) => handleInputChange("savingsBalance", Number.parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentBalance">Current Balance ({formData.currency})</Label>
            <Input
              id="currentBalance"
              type="number"
              step="0.01"
              value={formData.currentBalance}
              onChange={(e) => handleInputChange("currentBalance", Number.parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.symbol} {currency.name} ({currency.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
              </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">User Role</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Account Status</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Account Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="kycStatus">KYC Status</Label>
            <Select value={formData.kycStatus} onValueChange={(value) => handleInputChange("kycStatus", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select KYC status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Security Codes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Security Codes</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={regenerateCodes}
            className="text-blue-600 border-blue-300 hover:bg-blue-50 bg-transparent"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate Codes
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="imfCode">IMF Code</Label>
            <Input
              id="imfCode"
              value={formData.imfCode}
              onChange={(e) => handleInputChange("imfCode", e.target.value.toUpperCase())}
              placeholder="Enter IMF code"
              maxLength={6}
              className="font-mono"
            />
            <p className="text-xs text-slate-500">6-character security code for transactions</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vatCode">VAT Code</Label>
            <Input
              id="vatCode"
              value={formData.vatCode}
              onChange={(e) => handleInputChange("vatCode", e.target.value.toUpperCase())}
              placeholder="Enter VAT code"
              maxLength={6}
              className="font-mono"
            />
            <p className="text-xs text-slate-500">6-character security code for verification</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating User...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Create User
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
