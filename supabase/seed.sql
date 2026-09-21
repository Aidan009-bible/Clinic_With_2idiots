insert into demo_users (username, password, password_hint, role, screens)
values
  ('admin', 'admin123', 'admin123', 'admin', array['Dashboard', 'Users', 'Medicine', 'Reports', 'Settings']),
  ('doctor1', 'doctor123', 'doctor123', 'doctor1', array['Queue', 'Patient History', 'Diagnosis', 'Prescription']),
  ('doctor2', 'doctor123', 'doctor123', 'doctor2', array['Queue', 'Patient History', 'Diagnosis', 'Prescription']),
  ('reception', 'reception123', 'reception123', 'reception', array['Patient Registration', 'Visit Queue', 'Counter', 'Receipt Preview'])
on conflict (username) do update
set
  password = excluded.password,
  password_hint = excluded.password_hint,
  role = excluded.role,
  screens = excluded.screens;

insert into patients (id, patient_code, name, age, phone, last_visit, tags)
values
  ('pat-001', 'P-24001', 'Daw Su Su Hlaing', 34, '09-4200-11001', '2026-06-09', array['Diabetes follow-up', 'Returning']),
  ('pat-002', 'P-24002', 'U Aung Min', 51, '09-4200-11002', '2026-06-02', array['Hypertension', 'Needs lab review']),
  ('pat-003', 'P-24003', 'Ma Thiri Zaw', 27, '09-4200-11003', '2026-05-28', array['First visit'])
on conflict (id) do update
set
  patient_code = excluded.patient_code,
  name = excluded.name,
  age = excluded.age,
  phone = excluded.phone,
  last_visit = excluded.last_visit,
  tags = excluded.tags;

insert into visits (id, patient_code, patient_name, doctor, status, waiting_minutes, symptoms, diagnosis, notes, prescription)
values
  (
    'visit-001',
    'P-24001',
    'Daw Su Su Hlaing',
    'doctor1',
    'With Doctor',
    12,
    array['Dizziness', 'High sugar reading'],
    'Type 2 diabetes with dehydration',
    'Monitor sugar this week and increase fluids.',
    '[{"medicine":"Metformin 500 mg","dosage":"1 tablet after breakfast","quantity":30},{"medicine":"ORS Sachet","dosage":"1 sachet twice daily","quantity":10}]'::jsonb
  ),
  (
    'visit-002',
    'P-24002',
    'U Aung Min',
    'doctor2',
    'Waiting',
    24,
    array['Headache', 'Blood pressure review'],
    '',
    '',
    '[]'::jsonb
  ),
  (
    'visit-003',
    'P-24003',
    'Ma Thiri Zaw',
    'doctor1',
    'Prescription Ready',
    6,
    array['Sore throat', 'Mild fever'],
    'Upper respiratory tract infection',
    'Return in 3 days if fever persists.',
    '[{"medicine":"Amoxicillin 500 mg","dosage":"1 capsule three times daily","quantity":9}]'::jsonb
  )
on conflict (id) do update
set
  patient_code = excluded.patient_code,
  patient_name = excluded.patient_name,
  doctor = excluded.doctor,
  status = excluded.status,
  waiting_minutes = excluded.waiting_minutes,
  symptoms = excluded.symptoms,
  diagnosis = excluded.diagnosis,
  notes = excluded.notes,
  prescription = excluded.prescription;

insert into medicines (id, name, stock, unit, expiry, low_stock)
values
  ('med-001', 'Metformin 500 mg', 118, 'tabs', '2027-03-30', false),
  ('med-002', 'Amlodipine 5 mg', 18, 'tabs', '2026-09-12', true),
  ('med-003', 'Amoxicillin 500 mg', 9, 'caps', '2026-07-05', true),
  ('med-004', 'ORS Sachet', 45, 'packs', '2027-01-14', false)
on conflict (id) do update
set
  name = excluded.name,
  stock = excluded.stock,
  unit = excluded.unit,
  expiry = excluded.expiry,
  low_stock = excluded.low_stock;

insert into reports_summary (sort_order, label, value, detail)
values
  (1, 'Today patients', '18', '3 waiting, 1 with doctor, 2 at counter, 12 completed'),
  (2, 'Medicine issued', '42 items', 'Top issue: Metformin 500 mg'),
  (3, 'Low stock alerts', '2', 'Amlodipine 5 mg and Amoxicillin 500 mg need restock review'),
  (4, 'Visit history', '147 visits', 'Last 30 days across demo patients only')
on conflict do nothing;
