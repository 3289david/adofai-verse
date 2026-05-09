"use client";

import { useState } from "react";

const EN = `# Terms of Service

**Effective Date: May 9, 2026**
**Platform: ADOFAI.NET**

---

## 1. Acceptance of Terms

By accessing or using ADOFAI.NET ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, you may not use the Service.

## 2. Description of Service

ADOFAI.NET is a community platform for the rhythm game *A Dance of Fire and Ice*. It provides a map database, global rankings, file analysis tools, and AI-powered coaching features. The Service is not affiliated with or endorsed by 7th Beat Games.

## 3. User Accounts

- You must be at least 13 years old to create an account.
- You are responsible for maintaining the confidentiality of your password.
- You may not impersonate other users or create accounts for deceptive purposes.
- We reserve the right to suspend or terminate accounts that violate these Terms.

## 4. User Content

By submitting maps, records, or other content to ADOFAI.NET, you:
- Confirm you have the right to share the content.
- Grant ADOFAI.NET a non-exclusive, royalty-free license to display and distribute that content on the platform.
- Understand that content that infringes copyright, contains malware, or violates community standards will be removed.

## 5. Prohibited Conduct

You agree not to:
- Upload malicious files or attempt to exploit the Service.
- Harass, threaten, or harm other users.
- Use automated tools to scrape or abuse the Service without permission.
- Post content that is illegal, defamatory, or otherwise harmful.

## 6. Copyright

All game-related assets, names, and trademarks belong to their respective owners (7th Beat Games). User-submitted content remains the property of the original creator.

## 7. Disclaimers

The Service is provided "as is" without warranty of any kind. We do not guarantee uptime, accuracy of rankings, or continued availability.

## 8. Limitation of Liability

To the fullest extent permitted by law, ADOFAI.NET shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.

## 9. Changes to Terms

We may update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the updated Terms.

## 10. Contact

For questions, contact us at legal@adofai.net or visit our GitHub at https://github.com/3289david/adofai-verse`;

const KR = `# 이용약관

**시행일: 2026년 5월 9일**
**플랫폼: ADOFAI.NET**

---

## 1. 약관 동의

ADOFAI.NET("서비스")에 접속하거나 이용함으로써, 귀하는 본 이용약관에 동의하는 것으로 간주됩니다. 동의하지 않으시는 경우, 서비스를 이용하실 수 없습니다.

## 2. 서비스 설명

ADOFAI.NET은 리듬게임 *A Dance of Fire and Ice*를 위한 커뮤니티 플랫폼입니다. 맵 데이터베이스, 글로벌 랭킹, 파일 분석 도구, AI 코칭 기능을 제공합니다. 본 서비스는 7th Beat Games와 무관하며 공식 서비스가 아닙니다.

## 3. 계정

- 계정을 생성하려면 만 13세 이상이어야 합니다.
- 귀하는 자신의 비밀번호 기밀 유지에 대한 책임이 있습니다.
- 타인을 사칭하거나 기만적인 목적으로 계정을 생성할 수 없습니다.
- 본 약관을 위반하는 계정은 정지 또는 삭제될 수 있습니다.

## 4. 사용자 콘텐츠

ADOFAI.NET에 맵, 기록 등의 콘텐츠를 제출함으로써 귀하는:
- 해당 콘텐츠를 공유할 권리가 있음을 확인합니다.
- ADOFAI.NET에 해당 콘텐츠를 플랫폼 내에서 표시 및 배포할 수 있는 비독점적 무상 라이선스를 부여합니다.
- 저작권을 침해하거나 악성 코드를 포함하거나 커뮤니티 기준을 위반하는 콘텐츠는 삭제될 수 있음을 이해합니다.

## 5. 금지 행위

귀하는 다음 행위를 하지 않을 것에 동의합니다:
- 악성 파일을 업로드하거나 서비스를 악용하는 행위
- 다른 이용자를 괴롭히거나 위협하는 행위
- 허가 없이 자동화 도구를 사용하여 서비스를 무단 수집하는 행위
- 불법적이거나 명예훼손적이거나 해로운 콘텐츠를 게시하는 행위

## 6. 저작권

게임 관련 자산, 명칭 및 상표는 해당 소유자(7th Beat Games)의 재산입니다. 사용자 제출 콘텐츠의 저작권은 원작자에게 있습니다.

## 7. 면책 조항

서비스는 어떠한 보증도 없이 "있는 그대로" 제공됩니다. 서비스 가동률, 랭킹 정확성 또는 지속적인 이용 가능성을 보장하지 않습니다.

## 8. 책임 제한

법이 허용하는 최대 한도 내에서, ADOFAI.NET은 귀하의 서비스 이용으로 인한 간접적, 부수적 또는 결과적 손해에 대해 책임을 지지 않습니다.

## 9. 약관 변경

당사는 언제든지 본 약관을 업데이트할 수 있습니다. 변경 후 서비스를 계속 이용하면 업데이트된 약관에 동의한 것으로 간주됩니다.

## 10. 문의

문의 사항은 legal@adofai.net 으로 이메일을 보내시거나 GitHub(https://github.com/3289david/adofai-verse)를 방문해 주세요.`;

export default function TermsPage() {
  const [lang, setLang] = useState<"en" | "kr">("en");
  const content = lang === "en" ? EN : KR;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-white">
          {lang === "en" ? "Terms of Service" : "이용약관"}
        </h1>
        <div className="flex gap-2">
          <button onClick={() => setLang("en")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${lang === "en" ? "bg-fire/10 border border-fire/25 text-fire" : "text-soft hover:text-white border border-transparent"}`}>
            English
          </button>
          <button onClick={() => setLang("kr")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${lang === "kr" ? "bg-fire/10 border border-fire/25 text-fire" : "text-soft hover:text-white border border-transparent"}`}>
            한국어
          </button>
        </div>
      </div>

      <div className="prose-custom bg-card border border-line rounded-xl p-8 space-y-5">
        {content.split("\n\n").map((block, i) => {
          if (block.startsWith("# "))    return <h1 key={i} className="text-xl font-black text-white">{block.slice(2)}</h1>;
          if (block.startsWith("## "))   return <h2 key={i} className="text-base font-bold text-white mt-6">{block.slice(3)}</h2>;
          if (block.startsWith("**") && block.endsWith("**")) return <p key={i} className="text-xs text-dim">{block.replace(/\*\*/g, "")}</p>;
          if (block === "---") return <hr key={i} className="border-line" />;
          const lines = block.split("\n").filter(Boolean);
          const isList = lines.every(l => l.startsWith("- "));
          if (isList) return (
            <ul key={i} className="list-disc list-inside space-y-1 text-sm text-soft/90">
              {lines.map((l, j) => <li key={j}>{l.slice(2)}</li>)}
            </ul>
          );
          return <p key={i} className="text-sm text-soft/90 leading-relaxed">{block}</p>;
        })}
      </div>
    </div>
  );
}
