-- Seed job_titles (idempotent). Categories/subcategories may already exist without titles.

WITH taxonomy AS (
  SELECT *
  FROM (
    VALUES
      ('information_technology', 'software_development', 'Software Engineer', 1),
      ('information_technology', 'software_development', 'Full Stack Developer', 2),
      ('information_technology', 'infrastructure_cloud', 'Cloud Engineer', 1),
      ('accounting_finance', 'accounting', 'Accountant', 1),
      ('accounting_finance', 'payroll_ar_ap', 'Payroll Officer', 1),
      ('human_resources', 'recruitment', 'Recruiter', 1),
      ('human_resources', 'hr', 'HR Manager', 1),
      ('sales', 'business_development', 'Business Development Manager', 1),
      ('marketing', 'digital_marketing', 'SEO Specialist', 1),
      ('healthcare', 'nursing', 'Registered Nurse', 1),
      ('healthcare', 'allied_health', 'Physiotherapist', 1),
      ('education', 'schools', 'Teacher', 1),
      ('engineering', 'civil', 'Civil Engineer', 1),
      ('construction', 'trades', 'Electrician', 1),
      ('manufacturing', 'production', 'Machine Operator', 1),
      ('mining_resources', 'operations', 'Dump Truck Operator', 1),
      ('transport_logistics', 'warehousing', 'Forklift Operator', 1),
      ('hospitality_tourism', 'food_services', 'Chef', 1),
      ('retail', 'store_operations', 'Store Manager', 1),
      ('government_public_sector', 'administration', 'Policy Officer', 1),
      ('legal', 'legal_practice', 'Lawyer', 1),
      ('insurance', 'claims', 'Claims Officer', 1),
      ('real_estate_property', 'property', 'Property Manager', 1),
      ('customer_service', 'contact_centre', 'Customer Support Officer', 1),
      ('administration_office_support', 'administration', 'Administrator', 1),
      ('security_defence', 'security', 'Security Guard', 1),
      ('agriculture_farming', 'farming', 'Farm Manager', 1),
      ('energy_utilities', 'renewable_energy', 'Solar Technician', 1),
      ('creative_design', 'design', 'Graphic Designer', 1),
      ('telecommunications', 'technical', 'Telecom Technician', 1),
      ('science_research', 'research', 'Research Scientist', 1),
      ('community_services_non_profit', 'social_services', 'Social Worker', 1),
      ('aviation', 'flight_operations', 'Pilot', 1),
      ('maritime', 'deck', 'Captain', 1),
      ('executive_leadership', 'executive', 'CEO', 1)
  ) AS rows(category_code, subcategory_code, job_title_name, title_sort_order)
)
INSERT INTO public.job_titles (subcategory_id, name, sort_order)
SELECT
  js.id,
  t.job_title_name,
  t.title_sort_order
FROM taxonomy t
JOIN public.job_categories jc ON jc.code = t.category_code
JOIN public.job_subcategories js
  ON js.category_id = jc.id
 AND js.code = t.subcategory_code
ON CONFLICT (subcategory_id, name) DO UPDATE
  SET sort_order = EXCLUDED.sort_order;
