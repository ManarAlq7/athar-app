import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import { Spinner } from './Spinner'

/**
 * يحرس صفحتي «أضف صورة» و«حسابي».
 * غير المسجَّل يُحوَّل لصفحة الدخول مع حفظ وجهته، فيعود إليها بعد الدخول
 * بدل أن يُلقى في الصفحة الرئيسية.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner label="جارٍ التحقق من الجلسة…" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}
