"use client";

import { useState } from "react";

const EN = `# Privacy Policy

**Effective Date: May 9, 2026**
**Platform: ADOFAI.NET**

---

## 1. Introduction

ADOFAI.NET ("we", "our", "the Service") is committed to protecting your privacy. This Privacy Policy explains what data we collect, how we use it, and your rights.

## 2. Data We Collect

**Account Data** (when you register):
- Username, email address, and hashed password
- Optional: country, bio, profile picture URL

**Usage Data**:
- Maps you upload, records you submit, and likes
- Log data such as IP address and browser type (for security)

**Imported Data**:
- Map metadata from adofai.gg and Steam Workshop (public sources only)

## 3. How We Use Your Data

- To provide and maintain the Service
- To display your public profile, rankings, and records
- To improve the platform and fix bugs
- We do NOT sell your data to third parties

## 4. Data Sharing

We do not share your personal data with third parties except:
- When required by law
- To protect the safety of users or the Service

Public information (username, country, bio, records) is visible to all users of the Service.

## 5. Cookies

We use a single httpOnly cookie (auth_token) to maintain your login session. No third-party tracking cookies are used.

## 6. Data Retention

- Account data is retained until you delete your account.
- Log data is retained for a maximum of 30 days.

## 7. Your Rights

You have the right to:
- Access the personal data we hold about you
- Request correction of inaccurate data
- Request deletion of your account and associated data

To exercise these rights, contact us via the GitHub repository.

## 8. Children's Privacy

The Service is not directed at children under 13. If we become aware of data collected from a child under 13 without parental consent, we will delete it.

## 9. AI Features

The AI coaching feature sends anonymized map metadata to Pollinations AI (pollinations.ai) for text generation. No personal user data is sent to Pollinations AI.

## 10. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify users of significant changes by posting an update on the site.

## 11. Contact

For privacy inquiries, contact us via GitHub Issues at the ADOFAI.NET repository.`;

const KR = `# 개인정보 처리방침

**시행일: 2026년 5월 9일**
**플랫폼: ADOFAI.NET**

---

## 1. 소개

ADOFAI.NET("당사", "서비스")는 귀하의 개인정보 보호를 위해 최선을 다하고 있습니다. 본 개인정보 처리방침은 수집하는 데이터, 사용 방법 및 귀하의 권리를 설명합니다.

## 2. 수집하는 데이터

**계정 데이터** (회원가입 시):
- 사용자 이름, 이메일 주소, 해시된 비밀번호
- 선택 사항: 국가, 자기소개, 프로필 사진 URL

**이용 데이터**:
- 업로드한 맵, 제출한 기록, 좋아요
- IP 주소, 브라우저 유형 등 보안 목적의 로그 데이터

**가져온 데이터**:
- adofai.gg 및 스팀 워크샵의 공개 맵 메타데이터

## 3. 데이터 사용 목적

- 서비스 제공 및 유지 관리
- 공개 프로필, 랭킹, 기록 표시
- 플랫폼 개선 및 버그 수정
- 당사는 귀하의 데이터를 제3자에게 판매하지 않습니다.

## 4. 데이터 공유

당사는 다음의 경우를 제외하고 귀하의 개인 데이터를 제3자와 공유하지 않습니다:
- 법적 요구가 있는 경우
- 이용자 또는 서비스의 안전을 보호하기 위한 경우

공개 정보(사용자 이름, 국가, 자기소개, 기록)는 모든 이용자에게 공개됩니다.

## 5. 쿠키

당사는 로그인 세션 유지를 위해 단일 httpOnly 쿠키(auth_token)를 사용합니다. 제3자 추적 쿠키는 사용하지 않습니다.

## 6. 데이터 보존

- 계정 데이터는 계정을 삭제할 때까지 보존됩니다.
- 로그 데이터는 최대 30일 동안 보존됩니다.

## 7. 귀하의 권리

귀하는 다음의 권리를 가집니다:
- 당사가 보유한 개인 데이터에 대한 접근 권리
- 부정확한 데이터 수정 요청 권리
- 계정 및 관련 데이터 삭제 요청 권리

이러한 권리를 행사하려면 GitHub 저장소를 통해 문의하시기 바랍니다.

## 8. 아동 개인정보 보호

본 서비스는 만 13세 미만 아동을 대상으로 하지 않습니다. 보호자의 동의 없이 만 13세 미만 아동의 데이터가 수집된 것을 발견하는 경우 즉시 삭제합니다.

## 9. AI 기능

AI 코칭 기능은 텍스트 생성을 위해 익명화된 맵 메타데이터를 Pollinations AI(pollinations.ai)에 전송합니다. 개인 사용자 데이터는 Pollinations AI에 전송되지 않습니다.

## 10. 방침 변경

당사는 본 개인정보 처리방침을 수시로 업데이트할 수 있습니다. 중요한 변경 사항은 사이트에 공지합니다.

## 11. 문의

개인정보 관련 문의는 ADOFAI.NET 저장소의 GitHub Issues를 통해 연락 주시기 바랍니다.`;

export default function PrivacyPage() {
  const [lang, setLang] = useState<"en" | "kr">("en");
  const content = lang === "en" ? EN : KR;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-white">
          {lang === "en" ? "Privacy Policy" : "개인정보 처리방침"}
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

      <div className="bg-card border border-line rounded-xl p-8 space-y-5">
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
