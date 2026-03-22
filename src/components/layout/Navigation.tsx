import { Header } from './Header'
import { BottomTab } from './BottomTab'

export function Navigation() {
  return (
    <>
      <Header className="hidden lg:flex" />
      <BottomTab className="flex lg:hidden" />
    </>
  )
}
