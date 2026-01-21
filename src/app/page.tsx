import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-semibold text-gray-900">Cardiva</h1>
        <p className="mt-2 text-gray-600">RFP Matching Application</p>
      </div>

      {/* Design System Verification */}
      <div className="flex flex-col gap-4 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">Design System Check</h2>

        {/* Color Swatches */}
        <div className="flex gap-2">
          <div className="h-10 w-10 rounded bg-primary" title="Primary (Teal)" />
          <div className="h-10 w-10 rounded bg-destructive" title="Destructive (Coral)" />
          <div className="h-10 w-10 rounded bg-accent" title="Accent" />
          <div className="h-10 w-10 rounded bg-muted" title="Muted" />
        </div>

        {/* Button Variants */}
        <div className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>
    </main>
  )
}
