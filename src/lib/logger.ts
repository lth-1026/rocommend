import pino from 'pino'

const isDev = process.env.NODE_ENV === 'development'
const axiomToken = process.env.AXIOM_TOKEN
const axiomDataset = process.env.AXIOM_DATASET

function buildTransport() {
  // 개발: 컬러 출력
  if (isDev) {
    return {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
    }
  }

  // 프로덕션: Axiom 토큰이 있으면 Axiom으로 전송
  if (axiomToken && axiomDataset) {
    return {
      target: '@axiomhq/pino',
      options: { token: axiomToken, dataset: axiomDataset },
    }
  }

  // fallback: stdout JSON (Vercel Log Drain이 수집)
  return undefined
}

export const logger = pino({
  level: isDev ? 'debug' : 'info',
  transport: buildTransport(),
})
