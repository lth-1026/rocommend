export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center overflow-y-auto bg-bg px-4">
      {children}
    </div>
  )
}
