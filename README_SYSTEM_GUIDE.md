# Flowith.io 통합 관리 시스템 - 종합 실행 및 시연 가이드

## 1. 시스템 개요

본 문서는 Flowith.io 통합 관리 시스템의 모든 기능을 효과적으로 시연하고 활용할 수 있도록 돕는 최종 가이드입니다. 각 기능별로 단계별 지침을 제공하여 사용자가 시스템을 쉽고 정확하게 사용할 수 있도록 안내합니다.

**주요 특징:**
- **아키텍처:** 확장성과 유지보수성을 고려한 백엔드(NestJS)와 프론트엔드(Vanilla JS) 분리 구조
- **데이터베이스:** PostgreSQL을 사용한 안정적인 데이터 저장
- **핵심 기능:** 프로젝트, 계약, 거래처, 청구, 견적, 인력 등 엔지니어링 서비스의 모든 핵심 정보 통합 관리
- **자동화:** PII 데이터 암호화, 만료 기한 알림 등 자동화된 프로세스 내장

## 2. 시스템 실행 가이드 (Quick Start)

### 2.1. 필수 설치 항목

- [Node.js](https://nodejs.org/) (v18 이상 권장)
- [PostgreSQL](https://www.postgresql.org/download/) (v16 이상 권장)
- [Docker](https://www.docker.com/products/docker-desktop/) (권장, PostgreSQL 실행용)
- `git`

### 2.2. 백엔드 (NestJS) 실행 방법

**참고:** 제공된 프론트엔드는 `mock_data.json`을 사용하여 백엔드 없이도 독립적으로 완벽하게 동작합니다. 아래 백엔드 설정은 실제 데이터베이스와 연동하여 시스템을 운영하고자 할 때 필요합니다.

1.  **데이터베이스 실행 (Docker 사용 시):**
    ```bash
    docker run --name flowith-db -e POSTGRES_PASSWORD=admin -e POSTGRES_DB=flowith_db -p 5432:5432 -d postgres:16
    ```

2.  **데이터베이스 스키마 생성:**
    DB 클라이언트(DBeaver, DataGrip 등)를 사용하여 `backend/database/schema.sql` 스크립트 전체를 실행합니다.

3.  **환경 변수 설정:**
    `backend` 디렉터리에 `.env` 파일을 생성하고 `backend/.env.example` 파일의 내용을 복사한 후, 아래와 같이 실제 값으로 채웁니다.
    ```env
    # PostgreSQL Database Connection
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=postgres
    DB_PASSWORD=admin
    DB_DATABASE=flowith_db

    # JWT Authentication
    JWT_SECRET=your-super-secret-key-for-jwt-token-CHANGE-ME
    JWT_EXPIRES_IN=3600s

    # PII Encryption
    ENCRYPTION_KEY=your-32-character-encryption-key-CHANGE-ME
    ENCRYPTION_IV=your-16-character-encryption-iv-CHANGE-ME
    ```
    ⚠️ **중요:** 보안을 위해 `JWT_SECRET`, `ENCRYPTION_KEY`, `ENCRYPTION_IV`는 반드시 예측 불가능한 무작위 문자열로 변경해야 합니다.

4.  **의존성 설치 및 서버 실행:**
    (실제 NestJS 프로젝트 코드가 구성되었다고 가정)
    ```bash
    cd backend
    npm install
    npm run start:dev
    ```
    서버는 `http://localhost:3000`에서 실행됩니다.

### 2.3. 프론트엔드 (Vanilla JS) 실행 방법

1.  **웹 서버 패키지 설치 (없는 경우):**
    ```bash
    npm install -g serve
    ```

2.  **프론트엔드 서버 실행:**
    ```bash
    cd frontend-vanilla
    serve -l 3001
    ```

3.  **시스템 접속:**
    웹 브라우저에서 `http://localhost:3001` 주소로 접속하여 시스템을 사용합니다.

## 3. 핵심 기능 시연 가이드

- **로그인:** 초기 화면에서 이메일/비밀번호로 로그인
- **프로젝트 관리:** 대시보드에서 프로젝트 조회, 필터링, 정렬 및 신규 생성
- **상세 정보 관리:** 프로젝트 클릭 후 상세 정보 확인 및 자동 저장 기능 확인
- **문서 출력:** 계약서, 착수계, 완료계 PDF 출력
- **거래처 관리:** 거래처 목록 조회, 신규 등록 및 수정
- **인력 관리:** 프로젝트 참여자 배정 및 역할 지정
- **재무 관리:** 견적서 작성/출력, 상세 청구 내역 및 입금 처리

상세한 시나리오는 종합 기술 문서와 시연 가이드를 참고하세요.
