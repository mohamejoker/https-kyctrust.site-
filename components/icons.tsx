"use client"

import { Award, Clock, Shield, Users } from 'lucide-react'

export function FeatureIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "clock":
      return <Clock className={className} />
    case "shield":
      return <Shield className={className} />
    case "users":
      return <Users className={className} />
    case "award":
      return <Award className={className} />
    default:
      return <Shield className={className} />
  }
}
