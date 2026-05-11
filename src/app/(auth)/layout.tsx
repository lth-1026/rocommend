export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full overflow-y-auto bg-bg px-4">
      <div className="flex min-h-full flex-col items-center justify-center py-8">{children}</div>
    </div>
  )
}
