import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '이용약관',
}

const EFFECTIVE_DATE = '2025년 1월 1일'
const SERVICE_NAME = 'Rocommend'
const COMPANY_NAME = '[사업자명]'
const CONTACT_EMAIL = 'support@rocommend.kr'

export default function TermsPage() {
  return (
    <div className="page-wrapper py-8">
      <div className="flex flex-col gap-8 max-w-2xl">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold">이용약관</h1>
          <p className="text-sm text-text-secondary">시행일: {EFFECTIVE_DATE}</p>
        </div>

        <Section title="제1조 (목적)">
          <p>
            본 약관은 {COMPANY_NAME}(이하 &quot;회사&quot;)가 제공하는 {SERVICE_NAME} 서비스(이하
            &quot;서비스&quot;)의 이용 조건 및 절차, 회사와 이용자 간의 권리·의무 및 책임사항을
            규정함을 목적으로 합니다.
          </p>
        </Section>

        <Section title="제2조 (정의)">
          <ul>
            <li>
              <strong>&quot;서비스&quot;</strong>란 회사가 제공하는 한국 스페셜티 커피 로스터리 추천
              웹 애플리케이션 및 관련 서비스를 의미합니다.
            </li>
            <li>
              <strong>&quot;이용자&quot;</strong>란 본 약관에 동의하고 서비스를 이용하는 자를
              의미합니다.
            </li>
            <li>
              <strong>&quot;회원&quot;</strong>이란 소셜 로그인을 통해 계정을 생성하고 서비스를
              이용하는 이용자를 의미합니다.
            </li>
            <li>
              <strong>&quot;콘텐츠&quot;</strong>란 이용자가 서비스 내에서 작성한 평가, 한줄평 등의
              정보를 의미합니다.
            </li>
          </ul>
        </Section>

        <Section title="제3조 (약관의 효력 및 변경)">
          <p>
            본 약관은 서비스 화면에 게시하거나 기타 방법으로 이용자에게 공지함으로써 효력이
            발생합니다. 회사는 합리적인 사유가 있는 경우 관련 법령에 위배되지 않는 범위 내에서
            약관을 변경할 수 있으며, 변경 시 시행 7일 전에 공지합니다. 이용자가 변경된 약관에
            동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.
          </p>
        </Section>

        <Section title="제4조 (서비스 이용 계약)">
          <p>
            이용 계약은 이용자가 소셜 로그인을 통해 서비스에 가입하고 본 약관에 동의함으로써
            성립합니다. 만 14세 미만의 경우 서비스를 이용할 수 없습니다.
          </p>
        </Section>

        <Section title="제5조 (서비스 제공 및 변경)">
          <p>회사는 다음 서비스를 제공합니다.</p>
          <ul>
            <li>한국 스페셜티 커피 로스터리 정보 제공</li>
            <li>이용자 취향 기반 로스터리 추천</li>
            <li>로스터리 평가 및 즐겨찾기 기능</li>
            <li>기타 회사가 정하는 서비스</li>
          </ul>
          <p>회사는 서비스 내용을 변경할 수 있으며, 중요한 변경 사항은 사전에 공지합니다.</p>
        </Section>

        <Section title="제6조 (서비스 이용 시간 및 중단)">
          <p>
            서비스는 연중무휴 24시간 제공을 원칙으로 합니다. 단, 시스템 점검, 장애, 천재지변 등으로
            인해 서비스가 일시 중단될 수 있습니다. 예정된 점검은 사전 공지합니다.
          </p>
        </Section>

        <Section title="제7조 (이용자의 의무)">
          <p>이용자는 다음 행위를 해서는 안 됩니다.</p>
          <ul>
            <li>타인의 정보를 도용하거나 허위 정보를 등록하는 행위</li>
            <li>서비스 운영을 방해하거나 서버에 과도한 부하를 주는 행위</li>
            <li>욕설, 혐오, 음란 등 불건전한 콘텐츠를 게시하는 행위</li>
            <li>서비스를 이용해 얻은 정보를 회사의 사전 승낙 없이 상업적으로 이용하는 행위</li>
            <li>기타 관련 법령에 위배되는 행위</li>
          </ul>
        </Section>

        <Section title="제8조 (콘텐츠에 대한 권리)">
          <p>
            이용자가 서비스 내에 작성한 평가, 한줄평 등 콘텐츠의 저작권은 이용자에게 귀속됩니다. 단,
            이용자는 회사가 서비스 제공·개선·홍보를 목적으로 해당 콘텐츠를 사용할 수 있도록
            비독점적· 무상의 라이선스를 부여합니다. 회원 탈퇴 시 해당 콘텐츠는 삭제되거나
            익명화됩니다.
          </p>
        </Section>

        <Section title="제9조 (회원 탈퇴 및 자격 상실)">
          <p>
            회원은 언제든지 서비스 내 계정 관리 메뉴를 통해 탈퇴를 요청할 수 있습니다. 탈퇴 즉시
            계정 정보 및 관련 데이터가 삭제됩니다. 회사는 이용자가 제7조를 위반한 경우 사전 통보
            없이 이용을 제한하거나 계약을 해지할 수 있습니다.
          </p>
        </Section>

        <Section title="제10조 (면책 조항)">
          <ul>
            <li>
              회사는 천재지변, 전쟁, 서비스 제공업체의 장애 등 불가항력으로 인한 서비스 중단에 대해
              책임지지 않습니다.
            </li>
            <li>
              회사는 이용자가 서비스를 통해 얻은 정보의 정확성·완전성을 보장하지 않으며, 이로 인한
              손해에 대해 책임지지 않습니다.
            </li>
            <li>
              이용자 간 또는 이용자와 제3자 간의 분쟁에 대해 회사는 개입하지 않으며 책임지지
              않습니다.
            </li>
          </ul>
        </Section>

        <Section title="제11조 (분쟁 해결)">
          <p>
            본 약관과 관련한 분쟁은 대한민국 법을 준거법으로 하며, 소송 관할법원은 민사소송법상 관할
            법원으로 합니다.
          </p>
        </Section>

        <Section title="제12조 (문의)">
          <p>서비스 이용 관련 문의는 {CONTACT_EMAIL} 로 연락해 주시기 바랍니다.</p>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      <div className="flex flex-col gap-2 text-sm text-text-primary leading-relaxed [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1 [&_ul]:pl-4 [&_ul]:list-disc [&_strong]:font-medium">
        {children}
      </div>
    </section>
  )
}
