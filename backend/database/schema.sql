-- projectId 생성을 위한 시퀀스 및 함수
CREATE SEQUENCE public.project_id_seq INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 99999 CACHE 1;

CREATE OR REPLACE FUNCTION public.generate_project_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.project_id := 'P' || to_char(NOW(), 'YYYY') || '-' || lpad(nextval('public.project_id_seq')::text, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updatedAt 자동 갱신을 위한 공용 함수
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. 사용자 및 직원 테이블
CREATE TABLE public.users (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    roles JSONB DEFAULT '["user"]' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.employees (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT UNIQUE REFERENCES public.users(id) ON DELETE SET NULL,
    employee_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(50),
    position VARCHAR(100),
    department VARCHAR(100),
    hire_date DATE NOT NULL,
    termination_date DATE,
    resident_registration_number TEXT, -- 애플리케이션 레벨에서 암호화되어 저장
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. 거래처 및 프로젝트 관련 테이블
CREATE TABLE public.clients (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(100) NOT NULL UNIQUE,
    contact_person VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    registration_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.projects (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    project_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    client_id BIGINT REFERENCES public.clients(id) ON DELETE RESTRICT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'IN_PROGRESS' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TRIGGER before_project_insert BEFORE INSERT ON public.projects FOR EACH ROW EXECUTE FUNCTION public.generate_project_id();

CREATE TABLE public.contracts (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    project_id BIGINT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    contract_date DATE NOT NULL,
    contract_amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'KRW' NOT NULL,
    content TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.contract_revisions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    contract_id BIGINT NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    revision_number INT NOT NULL,
    revision_date DATE NOT NULL,
    reason TEXT NOT NULL,
    revised_amount NUMERIC(15, 2),
    revised_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (contract_id, revision_number)
);

CREATE TABLE public.invoices (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    contract_id BIGINT NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    invoice_number VARCHAR(30) UNIQUE NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    supply_amount NUMERIC(15, 2) NOT NULL,
    tax_amount NUMERIC(15, 2) NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT' NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.quotations (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    project_id BIGINT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    quotation_number VARCHAR(30) UNIQUE NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    total_amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'KRW' NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT' NOT NULL,
    content JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.project_participants (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    project_id BIGINT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    employee_id BIGINT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (project_id, employee_id)
);

-- 3. 직원 상세 정보 테이블
CREATE TABLE public.licenses (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    employee_id BIGINT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    license_name VARCHAR(255) NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    license_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.equipment (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    employee_id BIGINT REFERENCES public.employees(id) ON DELETE SET NULL,
    equipment_name VARCHAR(255) NOT NULL,
    serial_number VARCHAR(100) UNIQUE,
    purchase_date DATE,
    warranty_expiry_date DATE,
    status VARCHAR(50) DEFAULT 'IN_USE' NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.trainings (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    employee_id BIGINT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    course_name VARCHAR(255) NOT NULL,
    institution VARCHAR(255),
    completion_date DATE NOT NULL,
    valid_until_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.qualifications (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    employee_id BIGINT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    qualification_name VARCHAR(255) NOT NULL,
    description TEXT,
    achieved_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.individual_performances (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    employee_id BIGINT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    project_id BIGINT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    reviewer_id BIGINT REFERENCES public.employees(id) ON DELETE SET NULL,
    review_date DATE NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    strengths TEXT,
    areas_for_improvement TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (employee_id, project_id, review_date)
);

-- 모든 테이블에 updatedAt 트리거 적용
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contract_revisions_updated_at BEFORE UPDATE ON public.contract_revisions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_project_participants_updated_at BEFORE UPDATE ON public.project_participants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_licenses_updated_at BEFORE UPDATE ON public.licenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON public.equipment FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trainings_updated_at BEFORE UPDATE ON public.trainings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_qualifications_updated_at BEFORE UPDATE ON public.qualifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_individual_performances_updated_at BEFORE UPDATE ON public.individual_performances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
