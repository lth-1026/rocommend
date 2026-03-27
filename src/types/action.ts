export type ActionResult<T = void> =
  | { success: true; data?: T }
  | {
      success: false
      error: string
      code?: 'UNAUTHORIZED' | 'VALIDATION' | 'DB_ERROR' | 'NOT_FOUND' | 'UPLOAD_ERROR'
    }
