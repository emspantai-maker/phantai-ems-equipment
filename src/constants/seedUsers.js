/**
 * ข้อมูลผู้ใช้งานเริ่มต้นระบบ (Seed Users)
 * หน่วยกู้ชีพเทศบาลเมืองพันท้ายนรสิงห์
 */
export const DEFAULT_USERS = [
  // EMT (Emergency Medical Technician)
  {
    id: 'user-emt-312',
    username: 'phantai312',
    name: 'นายสมชาย กู้ชีพดี',
    employee_code: '312',
    position: 'EMT',
    role: 'USER',
    approved: true,
    first_login: true, // บังคับเปลี่ยนรหัสผ่านครั้งแรก
    password_hash: 'ems123456',
    active: true
  },
  {
    id: 'user-emt-325',
    username: 'phantai325',
    name: 'นายธีรภัทร ช่วยชีวิต',
    employee_code: '325',
    position: 'EMT',
    role: 'USER',
    approved: true,
    first_login: true,
    password_hash: 'ems123456',
    active: true
  },
  {
    id: 'user-emt-326',
    username: 'phantai326',
    name: 'นางสาวสุดารัตน์ พันท้าย',
    employee_code: '326',
    position: 'EMT',
    role: 'USER',
    approved: true,
    first_login: true,
    password_hash: 'ems123456',
    active: true
  },
  {
    id: 'user-emt-327',
    username: 'phantai327',
    name: 'นายอนุรักษ์ พร้อมเพรียง',
    employee_code: '327',
    position: 'EMT',
    role: 'USER',
    approved: true,
    first_login: true,
    password_hash: 'ems123456',
    active: true
  },

  // EMR (Emergency Medical Responder)
  {
    id: 'user-emr-122',
    username: 'phantai122',
    name: 'นายวรวุฒิ กล้าหาญ',
    employee_code: '122',
    position: 'EMR',
    role: 'USER',
    approved: true,
    first_login: true,
    password_hash: 'ems123456',
    active: true
  },
  {
    id: 'user-emr-134',
    username: 'phantai134',
    name: 'นายกิตติศักดิ์ ชำนาญทาง',
    employee_code: '134',
    position: 'EMR',
    role: 'USER',
    approved: true,
    first_login: true,
    password_hash: 'ems123456',
    active: true
  },
  {
    id: 'user-emr-136',
    username: 'phantai136',
    name: 'นางสาวนฤมล มั่นคง',
    employee_code: '136',
    position: 'EMR',
    role: 'USER',
    approved: true,
    first_login: true,
    password_hash: 'ems123456',
    active: true
  },
  {
    id: 'user-emr-137',
    username: 'phantai137',
    name: 'นายศราวุธ ว่องไว',
    employee_code: '137',
    position: 'EMR',
    role: 'USER',
    approved: true,
    first_login: true,
    password_hash: 'ems123456',
    active: true
  },

  // ADMIN
  {
    id: 'user-admin-01',
    username: 'ems.pantai@gmail.com',
    name: 'ผู้ดูแลระบบ กู้ชีพพันท้ายนรสิงห์',
    employee_code: 'ADMIN-1669',
    position: 'หัวหน้าชุดปฏิบัติการ',
    role: 'ADMIN',
    approved: true,
    first_login: false,
    password_hash: 'ems1669',
    active: true
  }
];
