-- ==============================================================================
-- ระบบตรวจสอบอุปกรณ์ประจำรถพยาบาล หน่วยกู้ชีพเทศบาลเมืองพันท้ายนรสิงห์
-- Supabase PostgreSQL Database Schema
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (ตารางข้อมูลผู้ใช้งาน)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    employee_code VARCHAR(50) NOT NULL,
    position VARCHAR(100) NOT NULL DEFAULT 'EMT', -- 'EMT', 'EMR', 'PARAMEDIC', 'DRIVER', 'ADMIN'
    role VARCHAR(50) NOT NULL DEFAULT 'USER', -- 'USER', 'ADMIN'
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    first_login BOOLEAN NOT NULL DEFAULT TRUE,
    phone VARCHAR(50),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. VEHICLES TABLE (ตารางข้อมูลรถพยาบาล)
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'AMB-01', 'AMB-02', 'AMB-03'
    vehicle_name VARCHAR(100) NOT NULL,       -- e.g. 'รถพยาบาลคันที่ 1'
    license_plate VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'กข9745', 'กค7080', 'กง3002'
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. EQUIPMENT TABLE (ตารางรายการอุปกรณ์ Master 40 รายการและเพิ่มเติม)
CREATE TABLE IF NOT EXISTS public.equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_no INT NOT NULL,               -- ลำดับที่ 1-40
    equipment_name VARCHAR(255) NOT NULL,    -- ชื่ออุปกรณ์
    category VARCHAR(100) NOT NULL DEFAULT 'GENERAL', -- 'VEHICLE', 'AIRWAY', 'IMMOBILIZATION', 'DIAGNOSTIC', 'MEDICATION', 'GENERAL'
    minimum_quantity INT NOT NULL DEFAULT 1, -- จำนวนขั้นต่ำ
    unit VARCHAR(50) NOT NULL DEFAULT 'ชิ้น', -- หน่วยนับ เช่น ชิ้น, คู่, ถัง, ชุด
    requirement TEXT,                        -- เกณฑ์ เช่น ตรวจทุกวัน, ไม่ต่ำกว่า 1/2 ถัง, พอใช้
    is_mandatory BOOLEAN NOT NULL DEFAULT FALSE,   -- ตรวจสอบเข้มงวด บังคับตรวจด้วยตนเอง (เช่น น้ำกลั่น)
    is_quantitative BOOLEAN NOT NULL DEFAULT FALSE,-- ต้องระบุตัวเลขค่าจริง (เช่น ออกซิเจน, DTX, Hard Collar)
    allow_bulk_ready BOOLEAN NOT NULL DEFAULT TRUE,-- อนุญาตให้เปลี่ยนเป็นพร้อมใช้งานด้วยปุ่มอัตโนมัติหรือไม่ (น้ำกลั่น/O2/น้ำมัน = FALSE)
    check_frequency VARCHAR(50) NOT NULL DEFAULT 'DAILY', -- 'DAILY', 'SHIFT'
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. INSPECTIONS TABLE (ตารางการตรวจเช็คประจำรอบ/เวร)
CREATE TABLE IF NOT EXISTS public.inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
    inspection_date DATE NOT NULL,          -- วันที่ตรวจ เช่น 2026-08-25
    inspection_month INT NOT NULL,          -- 1-12
    inspection_year INT NOT NULL,           -- ค.ศ. เช่น 2026
    shift VARCHAR(20) NOT NULL,             -- 'MORNING' (เวรเช้า), 'NIGHT' (เวรดึก)
    inspector_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    inspector_code VARCHAR(50) NOT NULL,    -- รหัสผู้ตรวจ เช่น '312', '325'
    inspector_name VARCHAR(255) NOT NULL,   -- ชื่อผู้ตรวจ ณ ขณะนั้น
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    overall_status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED', -- 'COMPLETED', 'DRAFT', 'HAS_ISSUES'
    total_items INT NOT NULL DEFAULT 40,
    ready_items INT NOT NULL DEFAULT 0,
    not_ready_items INT NOT NULL DEFAULT 0,
    unchecked_items INT NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- UNIQUE CONSTRAINT: 1 รถ ต่อ 1 วัน ต่อ 1 เวร มีได้เพียง 1 บันทึกเท่านั้น
    CONSTRAINT unique_vehicle_date_shift UNIQUE (vehicle_id, inspection_date, shift)
);

-- 5. INSPECTION_ITEMS TABLE (ตารางบันทึกผลการตรวจอุปกรณ์แต่ละรายการ)
CREATE TABLE IF NOT EXISTS public.inspection_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
    equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE RESTRICT,
    equipment_no INT NOT NULL,
    equipment_name VARCHAR(255) NOT NULL,
    minimum_quantity INT NOT NULL DEFAULT 1,
    available_quantity NUMERIC(10,2),       -- จำนวนที่ตรวจพบ หรือ ค่าตัวเลข (เช่น O2 psi)
    status VARCHAR(50) NOT NULL,             -- 'READY' (🟢 พร้อมใช้งาน), 'NOT_READY' (🔴 ไม่พร้อมใช้งาน), 'NOT_CHECKED' (⚪ ยังไม่ได้ตรวจ)
    reason TEXT,                            -- เหตุผลกรณีไม่พร้อมใช้งาน
    note TEXT,                              -- หมายเหตุเพิ่มเติม
    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. AUDIT_LOGS TABLE (ตารางบันทึกประวัติการเปลี่ยนแปลงระบบ Audit Trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    employee_code VARCHAR(50),
    action VARCHAR(50) NOT NULL,             -- 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'PASSWORD_CHANGE'
    table_name VARCHAR(100) NOT NULL,        -- 'inspections', 'inspection_items', 'vehicles', 'equipment', 'profiles'
    record_id VARCHAR(100),
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(100),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- DATABASE INDEXES FOR OPTIMAL PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_inspections_vehicle_id ON public.inspections(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_inspections_date ON public.inspections(inspection_date);
CREATE INDEX IF NOT EXISTS idx_inspections_month_year ON public.inspections(inspection_year, inspection_month);
CREATE INDEX IF NOT EXISTS idx_inspections_shift ON public.inspections(shift);
CREATE INDEX IF NOT EXISTS idx_inspections_inspector ON public.inspections(inspector_id);
CREATE INDEX IF NOT EXISTS idx_inspection_items_inspection_id ON public.inspection_items(inspection_id);
CREATE INDEX IF NOT EXISTS idx_inspection_items_equipment_id ON public.inspection_items(equipment_id);
CREATE INDEX IF NOT EXISTS idx_inspection_items_status ON public.inspection_items(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ==============================================================================
-- AUTO-UPDATE UPDATED_AT TRIGGER FUNCTION
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE OR REPLACE TRIGGER trg_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE OR REPLACE TRIGGER trg_equipment_updated_at BEFORE UPDATE ON public.equipment FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE OR REPLACE TRIGGER trg_inspections_updated_at BEFORE UPDATE ON public.inspections FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE OR REPLACE TRIGGER trg_inspection_items_updated_at BEFORE UPDATE ON public.inspection_items FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
