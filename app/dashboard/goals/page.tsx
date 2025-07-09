"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Target, Plus, Edit, Trash2, DollarSign, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, query, where, updateDoc, deleteDoc, doc } from "firebase/firestore"
import UserLayout from "@/components/user-layout"
import { CurrencyDisplay } from "@/components/currency-display"

interface Goal {
  id: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  category: string
  targetDate: string
  status: "active" | "completed" | "paused"
  createdAt: Date
}

export default function GoalsPage() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    currentAmount: "",
    category: "",
    targetDate: "",
  })

  const categories = [
    "Emergency Fund",
    "Vacation",
    "Home Purchase",
    "Car Purchase",
    "Education",
    "Retirement",
    "Investment",
    "Wedding",
    "Other",
  ]

  useEffect(() => {
    if (user) {
      fetchGoals()
    }
  }, [user])

  const fetchGoals = async () => {
    try {
      const q = query(collection(db, "goals"), where("userId", "==", user?.uid))
      const querySnapshot = await getDocs(q)
      const goalsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Goal[]

      // Sort by creation date (newest first)
      goalsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      setGoals(goalsData)
    } catch (error) {
      console.error("Error fetching goals:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const goalData = {
        userId: user.uid,
        title: formData.title,
        description: formData.description,
        targetAmount: Number.parseFloat(formData.targetAmount),
        currentAmount: Number.parseFloat(formData.currentAmount) || 0,
        category: formData.category,
        targetDate: formData.targetDate,
        status: "active" as const,
        createdAt: new Date(),
      }

      if (editingGoal) {
        await updateDoc(doc(db, "goals", editingGoal.id), goalData)
      } else {
        await addDoc(collection(db, "goals"), goalData)
      }

      setFormData({
        title: "",
        description: "",
        targetAmount: "",
        currentAmount: "",
        category: "",
        targetDate: "",
      })
      setShowAddForm(false)
      setEditingGoal(null)
      fetchGoals()
    } catch (error) {
      console.error("Error saving goal:", error)
    }
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setFormData({
      title: goal.title,
      description: goal.description,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      category: goal.category,
      targetDate: goal.targetDate,
    })
    setShowAddForm(true)
  }

  const handleDelete = async (goalId: string) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      try {
        await deleteDoc(doc(db, "goals", goalId))
        fetchGoals()
      } catch (error) {
        console.error("Error deleting goal:", error)
      }
    }
  }

  const updateGoalAmount = async (goalId: string, newAmount: number) => {
    try {
      await updateDoc(doc(db, "goals", goalId), {
        currentAmount: newAmount,
      })
      fetchGoals()
    } catch (error) {
      console.error("Error updating goal amount:", error)
    }
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600"
      case "paused":
        return "text-yellow-600"
      default:
        return "text-blue-600"
    }
  }

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </UserLayout>
    )
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Goals</h1>
            <p className="text-gray-600 dark:text-gray-400">Track and achieve your financial objectives</p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Goals</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{goals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {goals.filter((g) => g.status === "completed").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-pink-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Target</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    <CurrencyDisplay amount={goals.reduce((sum, goal) => sum + goal.targetAmount, 0)} />
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Goal Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingGoal ? "Edit Goal" : "Add New Goal"}</CardTitle>
              <CardDescription>
                {editingGoal ? "Update your financial goal" : "Create a new financial goal to track"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Goal Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Emergency Fund"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your goal..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetAmount">Target Amount</Label>
                    <div className="relative">
                      <CurrencyDisplay
                        amount={0}
                        symbolOnly
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      />
                      <Input
                        id="targetAmount"
                        type="number"
                        step="0.01"
                        value={formData.targetAmount}
                        onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                        placeholder="10000"
                        className="pl-8"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentAmount">Current Amount</Label>
                    <div className="relative">
                      <CurrencyDisplay
                        amount={0}
                        symbolOnly
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      />
                      <Input
                        id="currentAmount"
                        type="number"
                        step="0.01"
                        value={formData.currentAmount}
                        onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                        placeholder="0"
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetDate">Target Date</Label>
                    <Input
                      id="targetDate"
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="bg-gradient-to-r from-blue-600 to-pink-500">
                    {editingGoal ? "Update Goal" : "Create Goal"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingGoal(null)
                      setFormData({
                        title: "",
                        description: "",
                        targetAmount: "",
                        currentAmount: "",
                        category: "",
                        targetDate: "",
                      })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Goals List */}
        <div className="space-y-4">
          {goals.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Goals Yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start by creating your first financial goal to track your progress
                </p>
                <Button onClick={() => setShowAddForm(true)} className="bg-gradient-to-r from-blue-600 to-pink-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Goal
                </Button>
              </CardContent>
            </Card>
          ) : (
            goals.map((goal) => (
              <Card key={goal.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {goal.category}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(goal.status)}`}>
                          {goal.status}
                        </span>
                      </div>

                      {goal.description && <p className="text-gray-600 dark:text-gray-400 mb-3">{goal.description}</p>}

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="font-medium">
                            <CurrencyDisplay amount={goal.currentAmount} /> /{" "}
                            <CurrencyDisplay amount={goal.targetAmount} />
                          </span>
                        </div>
                        <Progress
                          value={getProgressPercentage(goal.currentAmount, goal.targetAmount)}
                          className="h-2"
                        />
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                          <span>
                            {getProgressPercentage(goal.currentAmount, goal.targetAmount).toFixed(1)}% complete
                          </span>
                          <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newAmount = prompt("Enter new amount:", goal.currentAmount.toString())
                          if (newAmount && !isNaN(Number.parseFloat(newAmount))) {
                            updateGoalAmount(goal.id, Number.parseFloat(newAmount))
                          }
                        }}
                      >
                        <DollarSign className="w-4 h-4 mr-1" />
                        Update
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(goal)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(goal.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </UserLayout>
  )
}
