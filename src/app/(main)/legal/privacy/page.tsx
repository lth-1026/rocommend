import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '개인정보처리방침',
}

const EFFECTIVE_DATE = '2026년 4월 20일'
const SERVICE_NAME = 'roco'
const COMPANY_NAME = '[사업자명]'
const CONTACT_EMAIL = 'privacy@roco.kr'

export default function PrivacyPage() {
  return (
    <div className="page-wrapper py-8">
      <div className="flex flex-col gap-8 max-w-2xl">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold">개인정보처리방침</h1>
          <p className="text-sm text-text-secondary">시행일: {EFFECTIVE_DATE}</p>
        </div>

        <p className="text-sm text-text-primary leading-relaxed">
          {COMPANY_NAME}(이하 &quot;회사&quot;)는 {SERVICE_NAME} 서비스(이하 &quot;서비스&quot;)를
          운영함에 있어 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 및 「정보통신망 이용촉진
          및 정보보호 등에 관한 법률」을 준수합니다.
        </p>

        <Section title="1. 수집하는 개인정보 항목 및 수집 방법">
          <p>회사는 다음과 같은 개인정보를 수집합니다.</p>
          <SubSection title="가. 소셜 로그인 시 수집 항목">
            <ul>
              <li>Google: 이름, 이메일 주소, 프로필 이미지</li>
              <li>카카오: 이름(닉네임), 이메일 주소, 프로필 이미지</li>
              <li>네이버: 이름, 이메일 주소, 프로필 이미지</li>
            </ul>
          </SubSection>
          <SubSection title="나. 서비스 이용 과정에서 자동 수집">
            <ul>
              <li>서비스 이용 기록, 접속 로그, 쿠키, IP 주소</li>
              <li>이용자가 직접 입력한 취향 설문 응답, 로스터리 평가 및 즐겨찾기 데이터</li>
            </ul>
          </SubSection>
        </Section>

        <Section title="2. 개인정보의 수집 및 이용 목적">
          <ul>
            <li>회원 식별 및 서비스 제공</li>
            <li>로스터리 추천 알고리즘(협업 필터링) 운영</li>
            <li>서비스 개선 및 신규 기능 개발</li>
            <li>법령 및 이용약관 위반 행위 확인 및 제재</li>
            <li>서비스 관련 공지사항 전달</li>
          </ul>
        </Section>

        <Section title="3. 개인정보의 보유 및 이용 기간">
          <p>
            회사는 이용자의 개인정보를 회원 탈퇴 시 또는 개인정보 수집·이용 목적 달성 시 지체 없이
            파기합니다. 단, 관련 법령에 따라 아래 기간 동안 보존합니다.
          </p>
          <ul>
            <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
            <li>소비자 불만 또는 분쟁처리 기록: 3년 (전자상거래법)</li>
            <li>접속 로그: 3개월 (통신비밀보호법)</li>
          </ul>
        </Section>

        <Section title="4. 개인정보의 제3자 제공">
          <p>
            회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 다음의 경우는
            예외로 합니다.
          </p>
          <ul>
            <li>이용자가 사전에 동의한 경우</li>
            <li>
              법령의 규정에 의거하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의
              요구가 있는 경우
            </li>
          </ul>
        </Section>

        <Section title="5. 개인정보 처리 위탁">
          <p>회사는 서비스 제공을 위해 아래와 같이 개인정보 처리를 위탁합니다.</p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>수탁업체</th>
                  <th>위탁 업무</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Vercel Inc.</td>
                  <td>서비스 인프라 운영</td>
                </tr>
                <tr>
                  <td>Supabase Inc.</td>
                  <td>데이터베이스 운영</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="6. 이용자의 권리와 행사 방법">
          <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
          <ul>
            <li>개인정보 열람 요청</li>
            <li>개인정보 정정·삭제 요청</li>
            <li>개인정보 처리 정지 요청</li>
          </ul>
          <p>
            권리 행사는 서비스 내 &quot;계정 관리&quot; 메뉴 또는 아래 개인정보 보호책임자에게
            이메일로 요청할 수 있습니다. 회원 탈퇴 시 수집된 개인정보는 즉시 파기됩니다.
          </p>
        </Section>

        <Section title="7. 쿠키의 운용">
          <p>
            서비스는 이용자에게 맞춤화된 서비스를 제공하기 위해 쿠키(Cookie)를 사용합니다. 쿠키는
            브라우저 설정을 통해 거부할 수 있으나, 일부 서비스 이용이 제한될 수 있습니다.
          </p>
        </Section>

        <Section title="8. 개인정보의 파기">
          <p>
            보유 기간 만료 또는 처리 목적 달성 후 개인정보는 복구 불가능한 방법으로 즉시 파기합니다.
            전자적 파일은 복구 불가능한 기술적 방법을 사용하며, 종이 문서는 분쇄 또는 소각합니다.
          </p>
        </Section>

        <Section title="9. 개인정보 보호책임자">
          <p>이용자의 개인정보 관련 문의, 불만 처리, 피해 구제 등을 위해 아래와 같이 지정합니다.</p>
          <ul>
            <li>성명: 이태호</li>
            <li>직책: 개인정보 보호책임자</li>
            <li>이메일: {CONTACT_EMAIL}</li>
          </ul>
          <p>개인정보 침해 관련 신고나 상담은 아래 기관에도 문의하실 수 있습니다.</p>
          <ul>
            <li>개인정보 침해신고센터: privacy.kisa.or.kr / 118</li>
            <li>대검찰청 사이버수사과: www.spo.go.kr / 1301</li>
            <li>경찰청 사이버안전국: cyberbureau.police.go.kr / 182</li>
          </ul>
        </Section>

        <Section title="10. 방침 변경 고지">
          <p>
            본 개인정보처리방침은 법령·정책 변경에 따라 수정될 수 있으며, 변경 시 서비스 내 공지를
            통해 사전 안내합니다.
          </p>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      <div className="flex flex-col gap-2 text-sm text-text-primary leading-relaxed [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1 [&_ul]:pl-4 [&_ul]:list-disc [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-border [&_th]:bg-surface [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-xs [&_th]:font-medium [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-xs">
        {children}
      </div>
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
      {children}
    </div>
  )
}
