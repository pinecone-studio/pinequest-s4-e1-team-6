  'use client'

  import dynamic from 'next/dynamic'
  import { Suspense } from 'react'
  import { Loader2 } from "lucide-react"

  const Spline = dynamic(() => import('@splinetool/react-spline'), {
    ssr: false,
  })

  interface SplineSceneProps {
    scene: string
    className?: string
  }

  export function SplineScene({ scene, className }: SplineSceneProps) {
    return (
      <Suspense 
        fallback={
          <div className="w-full h-full flex items-center justify-center bg-black/5 ">
            <Loader2 className="w-8 h-8 animate-spin text-white/20" />
          </div>
        }
      >
        <Spline 
          scene={scene} 
          className={className} 
        />
      </Suspense>
    )
  }
