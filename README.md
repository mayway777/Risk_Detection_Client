# 🚦 Real-time CCTV Accident Detection System

YOLO 기반의 영상 처리 기술을 활용하여 **실시간으로 사고나 이상 상황을 감지**하고, 사용자에게 **자동 알림**을 제공하는 지능형 모니터링 시스템입니다.
---
👉 [서버 레포지토리 보기](https://github.com/mayway777/Risk_Detection_Server.git)
---

## 📖 프로젝트 소개

`Daejeon_Yuseong_Accidents` 프로젝트는 오픈소스를 기반으로 사고 감지 솔루션을 제안하는 데 초점을 맞췄다면, 본 프로젝트는 **YOLO를 활용한 실시간 영상 분석 기술을 직접 적용**하여 더욱 발전된 형태의 솔루션을 구현하였습니다.

사용자가 등록한 **CCTV 실시간 영상**을 서버에서 자동 분석하고, 사고나 위험 상황 발생 시 **즉시 알림 전송**을 통해 빠른 대응을 가능하게 합니다.

> 사용자가 직접 영상을 모니터링할 필요 없이 자동 감지 및 알림!

---
![스크린샷 2025-04-08 032423](https://github.com/user-attachments/assets/04047511-ff13-41cf-a7ce-ca528f9d6170)


## 🧠 시스템 흐름도

![image](https://github.com/user-attachments/assets/205afe33-4c11-45f9-b6fe-4c32ce380bc5)


---

## 🔧 주요 기능

- 🔐 구글 OAuth 기반 회원가입 및 로그인  
- 📡 RTMP URL 등록을 통한 영상 스트리밍  
- 🎯 YOLO 기반 실시간 객체 탐지 및 분석  
- 🔔 사고 발생 시 사용자에게 실시간 알림 전송  

---

## 🥹 시행착오를 겪은 부분

- RTMP 실시간 영상을 서버로 안정적으로 전송하는 과정에서 다수의 오류 발생  
- Firebase DB 구조와 실시간 데이터 흐름에 대한 이해 부족  
- 여러 페이지에서 동일한 영상 데이터를 일관되게 표시하는 데 어려움  

---

## 💡 해결한 점 & 깨달은 점

### ✅ 해결 방법

- **RTMP → HLS 변환**을 통해 브라우저에서 실시간 영상 스트리밍 구현 성공  
- **요청/응답 구조 설계**를 명확히 하여 데이터 전달을 안정화함  

### ✨ 배운 점

- 무작정 개발하기보다 **체계적 설계**가 훨씬 중요하다는 것을 느꼈습니다  
- 감에 의존한 실습만으로는 한계가 있어, **기초 개념부터 탄탄히 다지는 학습 자세**가 필요하다는 것을 깨달았습니다  

---

## 💻 사용 기술

- **백엔드**: FastAPI, Python, Firebase (Auth, Firestore)  
- **프론트엔드**: React
- **영상처리**: YOLOv5, OpenCV  
- **스트리밍**: RTMP, HLS  

---

## ⚙️ 설치 및 실행 방법

### 1️⃣ Node.js 설치

- 이 프로젝트는 **Node.js v16.14.0** 버전에서 개발되었습니다.  
- [Node.js v16.14.0 다운로드 링크](https://nodejs.org/download/release/v16.14.0/)에서 설치해 주세요.
- 설치가 완료되면 다음 명령어로 버전을 확인하세요:

```bash
node -v
# v16.14.0
```

### 2️⃣ 프로젝트 클론 및 의존성 설치

```bash
git clone https://github.com/your-id/your-repo.git
cd your-repo
npm install
```

### 3️⃣ .env.local 설정

루트 경로에 `.env.local` 파일을 생성하고 아래 내용을 입력하세요:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=당신의_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=당신의_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=당신의_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=당신의_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=당신의_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=당신의_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=당신의_MEASUREMENT_ID
```

> 🔐 위 값들은 [Firebase 콘솔](https://console.firebase.google.com/)에서 확인 가능합니다.

### 4️⃣ Firebase 설정 (firebase.js)

```js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";

// ⚠️ 본인의 Firebase 설정 정보로 수정하세요
const firebaseConfig = {
  apiKey: "당신의_API_KEY",
  authDomain: "당신의_AUTH_DOMAIN",
  projectId: "당신의_PROJECT_ID",
  storageBucket: "당신의_STORAGE_BUCKET",
  messagingSenderId: "당신의_SENDER_ID",
  appId: "당신의_APP_ID",
  measurementId: "당신의_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
```

### 5️⃣ 실행

```bash
npm start
```

> 💡 개발 환경에서는 아래 명령어도 사용할 수 있습니다:

```bash
npm run dev
```

