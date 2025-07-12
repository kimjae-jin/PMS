# **Flowith.io 통합 관리 시스템 - 전체 소스 코드**

**문서 버전:** Final 1.0  
**작성일:** 2025년 7월 11일  
**요약:** 본 문서는 Flowith.io 프로젝트 통합 관리 시스템의 백엔드(NestJS)와 프론트엔드(Next.js/Vanilla)의 전체 소스 코드와 실행 가이드를 포함합니다.

---

## **1. 시스템 개요 및 실행 가이드 (README)**

### **1.1. 프로젝트 개요**

Flowith.io 통합 관리 시스템은 엔지니어링 서비스업의 복잡한 프로젝트 및 인적 자원 관리를 디지털화하고 자동화하기 위해 설계되었습니다. 이 시스템은 프로젝트, 계약, 거래처, 청구, 견적, 참여자, 직원 정보 등 핵심 비즈니스 데이터를 중앙에서 관리하며, 강력한 보안과 확장성을 제공합니다.

*   **Backend:** NestJS, TypeORM, PostgreSQL
*   **Frontend:** HTML, CSS, JavaScript (Vanilla JS)
*   **Database:** PostgreSQL

### **1.2. 시스템 아키텍처**
(생략)


### **1.3. 필수 설치 항목 (Prerequisites)**

로컬 개발 환경을 설정하기 위해 다음 소프트웨어가 설치되어 있어야 합니다.

*   [Node.js](https://nodejs.org/) (v18 이상 권장)
*   [PostgreSQL](https://www.postgresql.org/download/) (v16 이상 권장)
*   [Docker](https://www.docker.com/products/docker-desktop/) (선택 사항, PostgreSQL 실행용)
*   `git`

### **1.4. 코드 다운로드**

터미널에서 다음 명령어를 실행하여 소스 코드를 다운로드합니다.

```bash
git clone <repository_url>
cd flowith-management-system
