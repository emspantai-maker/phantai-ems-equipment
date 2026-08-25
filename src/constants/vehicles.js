/**
 * รายการรถพยาบาลเริ่มต้น 3 คัน
 * หน่วยกู้ชีพเทศบาลเมืองพันท้ายนรสิงห์
 */
export const DEFAULT_VEHICLES = [
  {
    id: 'veh-01',
    vehicle_code: 'AMB-01',
    vehicle_name: 'รถพยาบาลฉุกเฉิน คันที่ 1',
    license_plate: 'กข9745',
    description: 'Advance Life Support (ALS) ประจำเทศบาลเมืองพันท้ายนรสิงห์',
    active: true
  },
  {
    id: 'veh-02',
    vehicle_code: 'AMB-02',
    vehicle_name: 'รถพยาบาลฉุกเฉิน คันที่ 2',
    license_plate: 'กค7080',
    description: 'Basic Life Support (BLS) ประจำเทศบาลเมืองพันท้ายนรสิงห์',
    active: true
  },
  {
    id: 'veh-03',
    vehicle_code: 'AMB-03',
    vehicle_name: 'รถพยาบาลฉุกเฉิน คันที่ 3',
    license_plate: 'กง3002',
    description: 'First Responder / สำรอง ประจำเทศบาลเมืองพันท้ายนรสิงห์',
    active: true
  }
];

export const SHIFT_TYPES = [
  { code: 'MORNING', label: 'เวรเช้า', time_range: '08:00 - 20:00 น.', icon: 'Sun' },
  { code: 'NIGHT', label: 'เวรดึก', time_range: '20:00 - 08:00 น.', icon: 'Moon' }
];
