"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  Shield,
  Zap,
  Users,
  TrendingUp,
  Globe,
  Star,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  Award,
  Lock,
  Smartphone,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useSiteSettings } from "@/lib/site-settings-context"

export default function HomePage() {
  const { user } = useAuth()
  const { siteSettings, contactSettings, bankingSettings } = useSiteSettings()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  if (!mounted) {
    return null
  }

  const features = [
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your money is protected with enterprise-grade security and encryption",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      icon: Zap,
      title: "Instant Transfers",
      description: "Send money instantly to anyone, anywhere, anytime with zero fees",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      icon: TrendingUp,
      title: "High Interest Savings",
      description: `Earn ${bankingSettings.savingsRate}% APY on your savings with no minimum balance`,
      gradient: "from-purple-500 to-pink-600",
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Access your account from anywhere in the world with our mobile app",
      gradient: "from-orange-500 to-red-600",
    },
    {
      icon: Users,
      title: "24/7 Support",
      description: "Get help whenever you need it with our round-the-clock customer support",
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      icon: Award,
      title: "Competitive Loans",
      description: "Get personal and business loans with competitive rates and flexible terms",
      gradient: "from-green-500 to-emerald-600",
    },
  ]

  const stats = [
    { label: "Happy Customers", value: "50K+", icon: Users },
    { label: "Transactions Daily", value: "100K+", icon: TrendingUp },
    { label: "Countries Served", value: "25+", icon: Globe },
    { label: "Uptime Guarantee", value: "99.9%", icon: Shield },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Small Business Owner",
      content:
        "SecureBank has transformed how I manage my business finances. The instant transfers and competitive loan rates have been game-changers.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Freelancer",
      content:
        "The mobile app is incredibly user-friendly, and the 24/7 support team is always there when I need help. Highly recommended!",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Teacher",
      content:
        "I love the high-yield savings account. It's helping me save for my future while earning great interest rates.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              {siteSettings.logo ? (
                <img
                  src={siteSettings.logo || "/placeholder.svg"}
                  alt={siteSettings.siteName}
                  className="w-10 h-10 rounded-xl object-cover shadow-lg"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                  }}
                >
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h1
                  className="text-2xl font-bold bg-clip-text text-transparent"
                  style={{
                    background: `linear-gradient(135deg, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {siteSettings.siteName}
                </h1>
                <p className="text-sm text-slate-600 hidden sm:block">{siteSettings.tagline}</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-slate-700 hover:text-slate-900 transition-colors">
                Features
              </Link>
              <Link href="#about" className="text-slate-700 hover:text-slate-900 transition-colors">
                About
              </Link>
              <Link href="#contact" className="text-slate-700 hover:text-slate-900 transition-colors">
                Contact
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-700 max-[500px]:hidden hover:text-slate-900 hover:bg-slate-100">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  className="text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                  }}
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge
              className="mb-6 text-white border-0 shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
              }}
            >
              🎉 Now serving 50,000+ happy customers worldwide
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Banking Made
              <span
                className="block bg-clip-text text-transparent"
                style={{
                  background: `linear-gradient(135deg, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Simple & Secure
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">{siteSettings.description}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="text-white shadow-xl hover:shadow-2xl transition-all duration-300 text-lg px-8 py-6"
                  style={{
                    background: `linear-gradient(135deg, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                  }}
                >
                  Open Account Today
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-slate-700 border-slate-300 hover:bg-slate-50 text-lg px-8 py-6 bg-transparent"
                >
                  <Smartphone className="mr-2 w-5 h-5" />
                  Mobile Banking
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                    }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
                  <div className="text-slate-600">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Choose {siteSettings.siteName}?</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Experience the future of banking with our cutting-edge features designed for your financial success
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card
                  key={index}
                  className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm hover:scale-105"
                >
                  <CardHeader>
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-xl text-slate-900">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600 text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-slate-600">
              Join thousands of satisfied customers who trust us with their finances
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-slate-700 text-base leading-relaxed">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                      }}
                    >
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{testimonial.name}</div>
                      <div className="text-slate-600 text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Ready to Start Your Financial Journey?</h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Join thousands of customers who have already made the switch to smarter banking
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="text-white shadow-xl hover:shadow-2xl transition-all duration-300 text-lg px-8 py-6"
                style={{
                  background: `linear-gradient(135deg, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                }}
              >
                Open Free Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="text-slate-700 border-slate-300 hover:bg-slate-50 text-lg px-8 py-6 bg-transparent"
              >
                <Phone className="mr-2 w-5 h-5" />
                Talk to Expert
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Get in Touch</h2>
            <p className="text-xl text-slate-600">We're here to help you with all your banking needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm text-center">
              <CardHeader>
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                  }}
                >
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-slate-900">Call Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-2">{contactSettings.phone}</p>
                <p className="text-sm text-slate-500">{contactSettings.businessHours}</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm text-center">
              <CardHeader>
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                  }}
                >
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-slate-900">Email Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-2">{contactSettings.email}</p>
                <p className="text-sm text-slate-500">We'll respond within 24 hours</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm text-center">
              <CardHeader>
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                  }}
                >
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-slate-900">Visit Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-2">{contactSettings.address}</p>
                <p className="text-sm text-slate-500">Open Monday - Friday</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                {siteSettings.logo ? (
                  <img
                    src={siteSettings.logo || "/placeholder.svg"}
                    alt={siteSettings.siteName}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${siteSettings.primaryColor}, ${siteSettings.secondaryColor})`,
                    }}
                  >
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold">{siteSettings.siteName}</h3>
                  <p className="text-slate-400">{siteSettings.tagline}</p>
                </div>
              </div>
              <p className="text-slate-400 mb-6 max-w-md">{siteSettings.description}</p>
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <Lock className="w-4 h-4" />
                <span>FDIC Insured • Equal Housing Lender</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/register" className="block text-slate-400 hover:text-white transition-colors">
                  Open Account
                </Link>
                <Link href="/login" className="block text-slate-400 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link href="/loans" className="block text-slate-400 hover:text-white transition-colors">
                  Loans
                </Link>
                <Link href="/cards" className="block text-slate-400 hover:text-white transition-colors">
                  Credit Cards
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2">
                <p className="text-slate-400">
                  <Phone className="w-4 h-4 inline mr-2" />
                  {contactSettings.phone}
                </p>
                <p className="text-slate-400">
                  <Mail className="w-4 h-4 inline mr-2" />
                  {contactSettings.email}
                </p>
                <p className="text-slate-400">
                  <Clock className="w-4 h-4 inline mr-2" />
                  {contactSettings.businessHours}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 {siteSettings.siteName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
