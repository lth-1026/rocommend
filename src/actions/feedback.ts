'use server'

import { Resend } from 'resend'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { submitFeedbackSchema } from '@/lib/schemas/feedback'
import type { ActionResult } from '@/types/action'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const resend = new Resend(process.env.RESEND_API_KEY)

export async function submitFeedback(input: {
  content: string
  category?: string
}): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다', code: 'UNAUTHORIZED' }
  }

  const parsed = submitFeedbackSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? '입력값이 올바르지 않습니다',
      code: 'VALIDATION',
    }
  }

  const userId = session.user.id
  const { content, category } = parsed.data

  try {
    await prisma.feedback.create({
      data: { userId, content, category },
    })
  } catch {
    return { success: false, error: '저장 중 오류가 발생했습니다', code: 'DB_ERROR' }
  }

  // 수신 설정된 어드민들에게 이메일 발송
  if (process.env.RESEND_API_KEY) {
    try {
      const recipients = await prisma.user.findMany({
        where: { role: 'ADMIN', receiveFeedbackEmail: true },
        select: { email: true },
      })
      const emails = recipients.map((r) => r.email).filter((e): e is string => !!e)

      if (emails.length > 0) {
        await resend.emails.send({
          from: 'roco <onboarding@resend.dev>',
          to: emails,
          subject: `[roco] 새로운 의견이 도착했어요${category ? ` — ${escapeHtml(category)}` : ''}`,
          html: [
            `<p><strong>보낸 사람</strong>: ${escapeHtml(session.user.name ?? '(이름 없음)')} (${escapeHtml(session.user.email ?? '이메일 없음')})</p>`,
            category ? `<p><strong>카테고리</strong>: ${escapeHtml(category)}</p>` : '',
            `<p><strong>내용</strong>:</p>`,
            `<blockquote style="border-left:3px solid #ccc;margin:0;padding:0 1em;color:#555">${escapeHtml(content).replace(/\n/g, '<br/>')}</blockquote>`,
          ]
            .filter(Boolean)
            .join('\n'),
        })
      }
    } catch {
      // 이메일 실패는 무시 — DB 저장이 우선
    }
  }

  return { success: true }
}
