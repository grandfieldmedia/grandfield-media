-- Grandfield Media — Niche Master Registry seed data
-- Populates registry.niches with the 10 commerce niches (slugs = site folder names)
-- + 5 sub-niches each, plus the srini-pro brand niche "SAP Integration" + its 4 sub-niches.
-- grandfieldmedia is intentionally excluded (it is the company brand, not a niche).
-- Idempotent: parent slugs are aligned first, then every insert is ON CONFLICT DO NOTHING.
-- Context fields (audience/voice/keywords/pen_name…) are left blank on purpose — Srini's
-- creative input, entered later. This seed only establishes the niche/sub-niche TREE.

-- 1) Align two parent slugs to their site-folder names (no-op once renamed) --------------
update registry.niches set slug = 'technology-tools' where slug = 'technology-digital-tools';
update registry.niches set slug = 'kids-education'   where slug = 'kids-childrens-education';

-- 2) srini-pro brand niche (SAP Integration) as an 11th top-level niche ------------------
insert into registry.niches (slug, name, sort_order) values
  ('sap-integration', 'SAP Integration', 11)
on conflict (slug) do nothing;

-- 3) Sub-niches: 5 per commerce niche + 4 under SAP Integration --------------------------
with parent as (
  select id, slug from registry.niches where parent_id is null
),
subs(parent_slug, slug, name, sort_order) as (
  values
  -- Business & Entrepreneurship
  ('business-entrepreneurship','business-entrepreneurship-freelancing','Freelancing',1),
  ('business-entrepreneurship','business-entrepreneurship-ecommerce','E-commerce',2),
  ('business-entrepreneurship','business-entrepreneurship-startups','Startups',3),
  ('business-entrepreneurship','business-entrepreneurship-small-business','Small Business Management',4),
  ('business-entrepreneurship','business-entrepreneurship-side-hustles','Side Hustles',5),
  -- Career & Professional Development
  ('career-professional','career-professional-interview-prep','Interview Prep',1),
  ('career-professional','career-professional-resume','Resume & Cover Letters',2),
  ('career-professional','career-professional-job-search','Job Search Strategy',3),
  ('career-professional','career-professional-certifications','Professional Certifications',4),
  ('career-professional','career-professional-leadership','Leadership & Management',5),
  -- Learning & Education
  ('learning-education','learning-education-study-skills','Study Skills',1),
  ('learning-education','learning-education-language-learning','Language Learning',2),
  ('learning-education','learning-education-test-prep','Test Prep',3),
  ('learning-education','learning-education-course-creation','Online Course Creation',4),
  ('learning-education','learning-education-note-taking','Note-Taking & Memory',5),
  -- Home & Lifestyle
  ('home-lifestyle','home-lifestyle-organization','Home Organization',1),
  ('home-lifestyle','home-lifestyle-decluttering','Decluttering & Cleaning',2),
  ('home-lifestyle','home-lifestyle-meal-planning','Meal Planning',3),
  ('home-lifestyle','home-lifestyle-gardening','Gardening',4),
  ('home-lifestyle','home-lifestyle-budget-decor','Budget Home Decor',5),
  -- Technology & Digital Tools
  ('technology-tools','technology-tools-ai-prompts','AI Tools & Prompts',1),
  ('technology-tools','technology-tools-no-code','No-Code & Automation',2),
  ('technology-tools','technology-tools-productivity','Productivity Apps',3),
  ('technology-tools','technology-tools-cybersecurity','Cybersecurity Basics',4),
  ('technology-tools','technology-tools-digital-products','Digital Product Creation',5),
  -- Money & Finance (YMYL — subs inherit parent compliance)
  ('money-finance','money-finance-budgeting','Budgeting',1),
  ('money-finance','money-finance-saving','Saving Strategies',2),
  ('money-finance','money-finance-debt-payoff','Debt Payoff',3),
  ('money-finance','money-finance-frugal-living','Frugal Living',4),
  ('money-finance','money-finance-financial-literacy','Financial Literacy',5),
  -- Relationships & Family
  ('relationships-family','relationships-family-parenting','Parenting',1),
  ('relationships-family','relationships-family-marriage','Marriage & Communication',2),
  ('relationships-family','relationships-family-activities','Family Activities',3),
  ('relationships-family','relationships-family-coparenting','Co-Parenting',4),
  ('relationships-family','relationships-family-organization','Family Organization',5),
  -- Health & Wellness (YMYL — subs inherit parent compliance)
  ('health-wellness','health-wellness-fitness','Fitness Planning',1),
  ('health-wellness','health-wellness-mental-wellness','Mental Wellness',2),
  ('health-wellness','health-wellness-nutrition','Nutrition & Meal Prep',3),
  ('health-wellness','health-wellness-sleep-habits','Sleep & Habits',4),
  ('health-wellness','health-wellness-self-care','Self-Care Journaling',5),
  -- Events & Celebrations
  ('events-celebrations','events-celebrations-weddings','Wedding Planning',1),
  ('events-celebrations','events-celebrations-birthdays','Birthday Parties',2),
  ('events-celebrations','events-celebrations-holidays','Holiday Planning',3),
  ('events-celebrations','events-celebrations-baby-showers','Baby Showers',4),
  ('events-celebrations','events-celebrations-corporate','Corporate Events',5),
  -- Kids & Children's Education
  ('kids-education','kids-education-early-learning','Early Learning (Ages 3-5)',1),
  ('kids-education','kids-education-reading-phonics','Reading & Phonics',2),
  ('kids-education','kids-education-math','Math Practice',3),
  ('kids-education','kids-education-activity-books','Activity & Coloring Books',4),
  ('kids-education','kids-education-science','Science for Kids',5),
  -- SAP Integration (srini-pro)
  ('sap-integration','sap-integration-po','SAP PO',1),
  ('sap-integration','sap-integration-suite','SAP Integration Suite',2),
  ('sap-integration','sap-integration-btp','SAP BTP',3),
  ('sap-integration','sap-integration-ai','SAP AI',4)
)
insert into registry.niches (parent_id, slug, name, sort_order)
select parent.id, subs.slug, subs.name, subs.sort_order
from subs join parent on parent.slug = subs.parent_slug
on conflict (slug) do nothing;
