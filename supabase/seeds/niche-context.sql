-- Grandfield Media — Niche Master Registry: CONTEXT fill
-- Fills the rich "how to write for this niche" fields on registry.niches.
-- Pen name / publisher live on the PARENT only (sub-niches inherit).
-- Sub-niches carry ONLY their refinements; blank fields inherit the parent via
-- the getNicheContext() compiler. Dollar-quoted literals so apostrophes are safe.
-- Filled progressively — this file grows one niche at a time.

-- ===========================================================================
-- KIDS & CHILDREN'S EDUCATION  (kids-education) — flagship example
-- ===========================================================================
update registry.niches set
  pen_name       = $t$Emma Bright$t$,
  pen_name_bio   = $t$Emma Bright makes playful workbooks and activity books that help young children learn through fun. She designs every page to be simple and joyful for kids, and completely prep-free for the grown-ups helping them.$t$,
  publisher_name = $t$Grandfield Kids$t$,
  audience       = $t$Two audiences: the BUYER is a parent, grandparent, homeschooler, or teacher of a child aged roughly 3-10; the READER is the child. Write for the child, but make it obviously valuable and easy to use for the adult who buys and supervises it.$t$,
  buying_motivation = $t$Screen-free, productive learning that actually keeps a child engaged: school readiness, building confidence and core skills, and affordable, reusable/printable activities the grown-up can hand over with zero prep.$t$,
  voice_tone     = $t$Child-facing: warm, playful, and encouraging; short sentences; speak directly to the child ("Can you find...?", "Great job!"). Grown-up-facing notes: clear, calm, and reassuring. Never condescending to either.$t$,
  reading_level  = $t$Child-facing text at pre-reader to early-reader level (ages 3-10, split by sub-niche); grown-up instructions at general-adult level.$t$,
  compliance_rules = $t$Child-safety first. Content must be strictly age-appropriate: no violence, no scary or mature themes, no romance. Never request or collect any personal information from children. Require an adult-supervision note for any hands-on or physical activity. Use inclusive, stereotype-free names, characters, and scenarios; represent diverse families and abilities. Never use copyrighted or trademarked characters, brands, or franchises. Educational facts must be accurate and grade-appropriate. Do not assume a specific family structure, religion, or background.$t$,
  dos = $j$["Write child-facing text in short, simple sentences with familiar words", "Give one clear instruction at a time and use lots of positive encouragement", "Design for print: single-sided activity pages, generous white space, big friendly elements", "Repeat and reinforce concepts; build difficulty gradually", "Include a short 'For Grown-Ups' note explaining how to use the book", "Provide answer keys for any workbook or quiz content", "Use inclusive, diverse names and characters"]$j$::jsonb,
  donts = $j$["No scary, violent, or mature content of any kind", "No copyrighted or branded characters (no Disney, Pokemon, etc.)", "No complex words without a simple explanation", "No risky activities without a clear adult-supervision warning", "No gender, cultural, or ability stereotypes", "Never request or collect personal information from children", "Do not assume every reader has the same kind of family"]$j$::jsonb,
  keywords = $j$["kids activity book", "children's workbook", "preschool learning", "kindergarten prep", "homeschool printables", "early learning", "educational activities for kids", "coloring and activity book"]$j$::jsonb,
  context_notes = $t$The buyer and the reader are different people: sell to the adult, write to the child. Age band drives everything; sub-niches split by age and subject. This niche carries elevated child-safety compliance even though it is not a money/health YMYL niche.$t$
where slug = 'kids-education';

-- --- sub-niches: refinements only (inherit parent pen name, publisher, compliance) ---

update registry.niches set
  audience      = $t$Preschoolers and pre-K children ages 3-5, and the grown-ups introducing them to their very first learning activities.$t$,
  reading_level = $t$Pre-reader (ages 3-5): the child cannot read yet, so rely on pictures, colors, and adult read-aloud.$t$,
  voice_tone    = $t$Ultra-simple and gentle; almost all guidance is spoken by the adult. One idea per page.$t$,
  dos   = $j$["Use big shapes, thick tracing lines, and simple pictures", "Focus on colors, shapes, counting to 10, and letter recognition", "Write instructions for the adult to read aloud", "Keep child-facing text minimal or none"]$j$::jsonb,
  donts = $j$["No reading-dependent tasks", "No small, detailed elements that are hard for little hands", "No time pressure or scoring"]$j$::jsonb,
  keywords = $j$["preschool workbook", "pre-k activities", "ages 3-5 learning", "tracing book", "shapes and colors", "first learning book"]$j$::jsonb
where slug = 'kids-education-early-learning';

update registry.niches set
  audience      = $t$Emerging readers roughly ages 4-7 (pre-K to Grade 1) and the adults helping them learn to read.$t$,
  reading_level = $t$Early reader (Kindergarten-Grade 1): decodable words and common sight words.$t$,
  dos   = $j$["Teach letter sounds in context, not just letter names", "Use decodable words and high-frequency sight words", "Build from single sounds to blends to simple words", "Use lots of repetition and quick wins"]$j$::jsonb,
  donts = $j$["Do not introduce irregular spellings without support", "No long passages before the child is ready"]$j$::jsonb,
  keywords = $j$["phonics workbook", "learn to read", "sight words", "kindergarten reading", "letter sounds", "decodable readers"]$j$::jsonb
where slug = 'kids-education-reading-phonics';

update registry.niches set
  audience      = $t$Children roughly ages 5-10 (Kindergarten-Grade 4) practicing foundational math, and the adults supporting them.$t$,
  reading_level = $t$Early to mid elementary; keep any word problems short and simply worded.$t$,
  dos   = $j$["Group by skill and grade (counting, addition, subtraction, multiplication)", "Use visual math: pictures, number lines, grouping", "Provide clear answer keys", "Keep each worksheet to one skill per page"]$j$::jsonb,
  donts = $j$["No unexplained jumps in difficulty", "Do not bury the math in complex reading"]$j$::jsonb,
  keywords = $j$["math workbook", "kids math practice", "addition and subtraction", "times tables", "kindergarten math", "grade 1 math"]$j$::jsonb
where slug = 'kids-education-math';

update registry.niches set
  audience      = $t$Children roughly ages 3-8 who want fun, low-pressure activities, and the grown-ups buying screen-free entertainment with a learning edge.$t$,
  reading_level = $t$Mostly non-reading; picture-driven.$t$,
  voice_tone    = $t$Pure fun and playful; light or no instructions.$t$,
  dos   = $j$["Design single-sided pages so markers and crayons do not bleed through", "Mix mazes, dot-to-dots, spot-the-difference, and coloring", "Keep it low-text and self-explanatory", "Vary difficulty so siblings of different ages can share"]$j$::jsonb,
  donts = $j$["No double-sided activity pages", "No tiny intricate detail for the youngest ages", "No text-heavy instructions"]$j$::jsonb,
  keywords = $j$["kids coloring book", "activity book for kids", "mazes and puzzles", "dot to dot", "screen-free fun", "coloring and activities"]$j$::jsonb
where slug = 'kids-education-activity-books';

update registry.niches set
  audience      = $t$Curious kids roughly ages 5-10 exploring simple science, and the adults doing the activities alongside them.$t$,
  reading_level = $t$Early to mid elementary; explain every new term simply.$t$,
  compliance_rules = $t$Inherits the Kids niche child-safety rules PLUS elevated experiment safety: every hands-on experiment must state the required adult supervision, use safe household materials only (nothing toxic, sharp, hot, or choking-sized for the age), and include a clear safety note. Never include an experiment a child could do unsafely alone.$t$,
  dos   = $j$["Use safe, common household materials only", "Give step-by-step experiments with a clear 'ask a grown-up' safety note", "Explain the 'why' in simple, accurate terms", "Encourage observation and questions"]$j$::jsonb,
  donts = $j$["No dangerous materials (fire, chemicals, sharp or hot items)", "No experiment without a supervision note", "No inaccurate 'fun facts'"]$j$::jsonb,
  keywords = $j$["science for kids", "easy science experiments", "STEM activities", "kids science book", "home experiments", "nature science"]$j$::jsonb
where slug = 'kids-education-science';

-- ===========================================================================
-- BUSINESS & ENTREPRENEURSHIP (business-entrepreneurship)
-- ===========================================================================
update registry.niches set
  pen_name='Marcus Reed', publisher_name='Grandfield Press',
  pen_name_bio=$t$Marcus Reed writes practical, no-fluff guides for people building a business on their own terms, from first client to steady income. He focuses on clear systems anyone can follow, not hustle-culture hype.$t$,
  audience=$t$Aspiring and early-stage entrepreneurs, solopreneurs, freelancers, and side-hustlers, often starting with limited time and money and wanting a clear path to independent income.$t$,
  buying_motivation=$t$Confidence and a concrete, step-by-step path to make money independently, replacing guesswork and overwhelm with proven systems.$t$,
  voice_tone=$t$Direct, encouraging, practical peer. Plain English, concrete steps, real numbers and examples. Motivating but never hype-y.$t$,
  reading_level=$t$General adult; assume no prior business training.$t$,
  compliance_rules=$t$Not financial, legal, or tax advice. Keep any legal/tax/financial mentions to general education and a consult-a-professional pointer. No income guarantees or get-rich-quick promises.$t$,
  dos=$j$["Use real examples, templates, and dollar figures","Break every process into clear, doable steps","Assume no prior business knowledge","Address limited time and budget honestly","End each chapter with a concrete action"]$j$::jsonb,
  donts=$j$["No get-rich-quick or guaranteed-income claims","No legal/tax/financial advice beyond consult-a-pro","No jargon without a plain explanation","Do not assume the reader has capital or employees"]$j$::jsonb,
  keywords=$j$["small business","start a business","entrepreneurship","side hustle","solopreneur","business plan","online business","passive income"]$j$::jsonb,
  context_notes=$t$Umbrella niche; sub-niches (Freelancing, E-commerce, Startups, Small Business, Side Hustles) refine the audience and tactics.$t$
where slug='business-entrepreneurship';

update registry.niches set
  audience=$t$Solo service providers going independent (writers, designers, developers, consultants) wanting steady clients and confident pricing.$t$,
  dos=$j$["Give exact pricing and client-outreach scripts","Show how to find and keep good clients","Cover proposals, contracts, and invoicing basics","Address the feast-or-famine income problem"]$j$::jsonb,
  donts=$j$["No promises of specific income","Keep contract/tax details to general guidance"]$j$::jsonb,
  keywords=$j$["freelancing","freelance rates","finding clients","proposals","contracts","invoicing","freelance business"]$j$::jsonb
where slug='business-entrepreneurship-freelancing';

update registry.niches set
  audience=$t$First-time and growing online sellers (Etsy, Shopify, Amazon) wanting to launch and grow a store.$t$,
  dos=$j$["Cover product selection, listing, and pricing","Explain platforms (Etsy, Shopify, Amazon) plainly","Include marketing and fulfillment basics","Use real store examples"]$j$::jsonb,
  donts=$j$["No guaranteed-sales claims","Do not assume a big ad budget"]$j$::jsonb,
  keywords=$j$["ecommerce","online store","Etsy shop","Shopify","dropshipping","product listings","online selling"]$j$::jsonb
where slug='business-entrepreneurship-ecommerce';

update registry.niches set
  audience=$t$Early founders validating and launching a startup idea, often pre-revenue.$t$,
  dos=$j$["Cover idea validation, MVP, and first customers","Explain fundraising basics in plain terms","Focus on lean, low-cost testing"]$j$::jsonb,
  donts=$j$["No guaranteed funding or success claims","Keep legal/equity details to general guidance"]$j$::jsonb,
  keywords=$j$["startup","MVP","idea validation","lean startup","founder","fundraising basics","product-market fit"]$j$::jsonb
where slug='business-entrepreneurship-startups';

update registry.niches set
  audience=$t$Owners of small, established businesses wanting to run and grow them more smoothly.$t$,
  dos=$j$["Cover operations, hiring, and cash-flow basics","Provide checklists and simple systems","Focus on time-saving and delegation"]$j$::jsonb,
  donts=$j$["No legal/tax/HR advice beyond consult-a-pro","Do not assume a large team"]$j$::jsonb,
  keywords=$j$["small business management","operations","hiring","cash flow","business systems","business growth"]$j$::jsonb
where slug='business-entrepreneurship-small-business';

update registry.niches set
  audience=$t$Employed people wanting extra income on the side with limited hours.$t$,
  dos=$j$["Focus on low-startup, part-time income ideas","Be honest about realistic time and earnings","Show how to start this week"]$j$::jsonb,
  donts=$j$["No get-rich-quick claims","Do not assume the reader can quit their job"]$j$::jsonb,
  keywords=$j$["side hustle","extra income","make money on the side","part-time income","side business","passive income ideas"]$j$::jsonb
where slug='business-entrepreneurship-side-hustles';

-- ===========================================================================
-- CAREER & PROFESSIONAL DEVELOPMENT (career-professional)
-- ===========================================================================
update registry.niches set
  pen_name='Diane Carter', publisher_name='Grandfield Press',
  pen_name_bio=$t$Diane Carter writes clear, confidence-building guides for job seekers and professionals, from landing interviews to growing a career. She turns intimidating career steps into simple, repeatable playbooks.$t$,
  audience=$t$Job seekers and working professionals, new grads to mid-career, wanting to land roles, get promoted, or build skills.$t$,
  buying_motivation=$t$A clear edge and less anxiety in a high-stakes moment (job search, interview, promotion): knowing exactly what to do and say.$t$,
  voice_tone=$t$Encouraging, professional coach. Confident and reassuring; concrete scripts and examples.$t$,
  reading_level=$t$General adult professional.$t$,
  compliance_rules=$t$Not legal or HR advice; employment law varies by region, so keep to general guidance and consult-a-professional pointers. No guarantees of employment.$t$,
  dos=$j$["Give exact scripts, templates, and examples (resume lines, interview answers)","Address anxiety and confidence directly","Cover modern tools (LinkedIn, ATS, remote interviews)","Be specific by role or level where useful"]$j$::jsonb,
  donts=$j$["No guaranteed-job claims","No region-specific legal/HR advice","No stereotyping by age, gender, or background"]$j$::jsonb,
  keywords=$j$["job search","career development","interview prep","resume","LinkedIn","promotion","professional skills","career change"]$j$::jsonb,
  context_notes=$t$Sub-niches split by the specific career moment (interview, resume, job search, certification, leadership).$t$
where slug='career-professional';

update registry.niches set
  audience=$t$Candidates preparing for job interviews and nervous about what to say.$t$,
  dos=$j$["Give sample answers to common and behavioral questions","Cover the STAR method and mock-interview practice","Address nerves and body language","Include questions to ask the interviewer"]$j$::jsonb,
  donts=$j$["No scripted dishonesty or fabricated experience","No guaranteed-offer claims"]$j$::jsonb,
  keywords=$j$["interview questions","interview preparation","behavioral interview","STAR method","job interview tips","mock interview"]$j$::jsonb
where slug='career-professional-interview-prep';

update registry.niches set
  audience=$t$Job seekers writing or fixing resumes and cover letters, often facing ATS filters.$t$,
  dos=$j$["Provide fill-in templates and before/after examples","Explain ATS-friendly formatting","Show how to quantify achievements","Tailor to job descriptions"]$j$::jsonb,
  donts=$j$["No fabricated credentials or experience","Avoid region-specific legal advice"]$j$::jsonb,
  keywords=$j$["resume","cover letter","resume template","ATS resume","CV","resume writing"]$j$::jsonb
where slug='career-professional-resume';

update registry.niches set
  audience=$t$People running a job search and wanting a faster, organized approach.$t$,
  dos=$j$["Cover LinkedIn, networking, and application tracking","Give a weekly job-search plan","Address ghosting and follow-ups"]$j$::jsonb,
  donts=$j$["No guaranteed-timeline claims","No spammy mass-apply tactics"]$j$::jsonb,
  keywords=$j$["job search strategy","LinkedIn job search","networking","job applications","find a job","career networking"]$j$::jsonb
where slug='career-professional-job-search';

update registry.niches set
  audience=$t$Professionals preparing for a certification or exam to advance.$t$,
  dos=$j$["Provide study plans, practice questions, and summaries","Organize by exam objectives","Include test-day strategy"]$j$::jsonb,
  donts=$j$["Do not reproduce copyrighted exam questions","No guaranteed-pass claims"]$j$::jsonb,
  keywords=$j$["certification prep","exam study guide","practice questions","professional certification","test prep","study plan"]$j$::jsonb
where slug='career-professional-certifications';

update registry.niches set
  audience=$t$New and aspiring managers learning to lead teams.$t$,
  dos=$j$["Cover 1:1s, feedback, delegation, and difficult conversations","Give scripts and simple frameworks","Focus on first-time-manager pitfalls"]$j$::jsonb,
  donts=$j$["No HR/legal advice beyond consult-a-pro","No one-size-fits-all guarantees"]$j$::jsonb,
  keywords=$j$["leadership","management","new manager","team management","feedback","delegation","first-time manager"]$j$::jsonb
where slug='career-professional-leadership';

-- ===========================================================================
-- LEARNING & EDUCATION (learning-education)
-- ===========================================================================
update registry.niches set
  pen_name='Nathan Cole', publisher_name='Grandfield Press',
  pen_name_bio=$t$Nathan Cole writes approachable guides that help people learn faster and study smarter. He breaks research-backed learning methods into simple routines anyone can use.$t$,
  audience=$t$Students, self-learners, and lifelong learners of all ages wanting to learn more effectively, plus adults building new skills.$t$,
  buying_motivation=$t$Learn faster, remember more, and pass with less stress: a reliable system instead of cramming and frustration.$t$,
  voice_tone=$t$Clear, motivating teacher. Simple explanations, practical routines, evidence-based but jargon-free.$t$,
  reading_level=$t$General; teen to adult depending on sub-niche.$t$,
  compliance_rules=$t$Educational guidance only. Do not reproduce copyrighted textbook or exam content. No guaranteed-grade or outcome claims.$t$,
  dos=$j$["Give step-by-step study systems and routines","Use evidence-based methods (spaced repetition, active recall) in plain language","Include worksheets and schedules","Address motivation and procrastination"]$j$::jsonb,
  donts=$j$["No copyrighted exam or textbook reproduction","No guaranteed grades","No unexplained jargon"]$j$::jsonb,
  keywords=$j$["study skills","learn faster","study tips","memory techniques","exam prep","self-study","note taking","productivity for students"]$j$::jsonb,
  context_notes=$t$Sub-niches split by method or goal (study skills, language, test prep, course creation, note-taking).$t$
where slug='learning-education';

update registry.niches set
  audience=$t$Students (high school, college) wanting better study habits and grades.$t$,
  dos=$j$["Teach active recall, spaced repetition, and time management","Give study schedules and templates","Tackle procrastination and focus"]$j$::jsonb,
  donts=$j$["No guaranteed grades","Avoid one-method-fits-all claims"]$j$::jsonb,
  keywords=$j$["study skills","how to study","active recall","spaced repetition","study schedule","exam preparation"]$j$::jsonb
where slug='learning-education-study-skills';

update registry.niches set
  audience=$t$Self-learners studying a new language, beginner to intermediate.$t$,
  dos=$j$["Give daily practice routines and phrase lists","Focus on speaking and real usage early","Include spaced-repetition vocabulary methods"]$j$::jsonb,
  donts=$j$["No fluency-in-X-days guarantees","Do not assume access to a tutor"]$j$::jsonb,
  keywords=$j$["language learning","learn a language","vocabulary","language practice","speak a new language","beginner language"]$j$::jsonb
where slug='learning-education-language-learning';

update registry.niches set
  audience=$t$Test-takers preparing for standardized or school exams.$t$,
  dos=$j$["Organize by test sections and objectives","Provide practice sets and timing strategy","Include review schedules"]$j$::jsonb,
  donts=$j$["Do not reproduce copyrighted official test questions","No guaranteed-score claims"]$j$::jsonb,
  keywords=$j$["test prep","exam study guide","practice test","study guide","standardized test","exam strategy"]$j$::jsonb
where slug='learning-education-test-prep';

update registry.niches set
  audience=$t$Experts and educators wanting to build and sell an online course.$t$,
  dos=$j$["Cover course structure, recording, and platforms","Include planning templates and pricing basics","Focus on getting the first students"]$j$::jsonb,
  donts=$j$["No guaranteed-revenue claims","Do not assume expensive equipment"]$j$::jsonb,
  keywords=$j$["online course","course creation","teach online","Udemy","Teachable","course outline","sell a course"]$j$::jsonb
where slug='learning-education-course-creation';

update registry.niches set
  audience=$t$Students and professionals wanting better notes and recall.$t$,
  dos=$j$["Teach systems (Cornell, mind maps, Zettelkasten) simply","Show digital and paper methods","Connect notes to memory techniques"]$j$::jsonb,
  donts=$j$["No single-best-system dogma","Avoid tool-specific lock-in"]$j$::jsonb,
  keywords=$j$["note taking","note-taking methods","Cornell notes","mind maps","memory techniques","study notes"]$j$::jsonb
where slug='learning-education-note-taking';

-- ===========================================================================
-- HOME & LIFESTYLE (home-lifestyle)
-- ===========================================================================
update registry.niches set
  pen_name='Sophie Lane', publisher_name='Grandfield Home',
  pen_name_bio=$t$Sophie Lane writes warm, doable guides for a calmer, more organized home. She loves simple systems and budget-friendly ideas that fit real, busy lives.$t$,
  audience=$t$Busy adults, often parents and homeowners or renters, wanting an organized, pleasant home without big budgets or lots of time.$t$,
  buying_motivation=$t$A calmer, tidier, nicer home with less stress: simple systems and affordable ideas that actually stick.$t$,
  voice_tone=$t$Warm, friendly, encouraging friend. Practical, non-judgmental, budget-aware.$t$,
  reading_level=$t$General adult.$t$,
  compliance_rules=$t$General lifestyle guidance. For any DIY involving tools, electricity, or chemicals, include safety notes and consult-a-professional where appropriate.$t$,
  dos=$j$["Give simple, low-cost systems and routines","Include checklists, schedules, and printables","Respect small spaces and tight budgets","Be non-judgmental about mess and busy lives"]$j$::jsonb,
  donts=$j$["No expensive-product assumptions","No shaming tone","Include safety notes for any DIY hazard"]$j$::jsonb,
  keywords=$j$["home organization","declutter","cleaning routine","home management","budget decor","meal planning","tidy home","home hacks"]$j$::jsonb,
  context_notes=$t$Broad lifestyle umbrella; sub-niches split by task (organizing, cleaning, meals, gardening, decor).$t$
where slug='home-lifestyle';

update registry.niches set
  audience=$t$People overwhelmed by clutter wanting organized, functional spaces.$t$,
  dos=$j$["Give room-by-room systems and checklists","Focus on maintainable habits, not one-time purges","Use affordable storage ideas"]$j$::jsonb,
  donts=$j$["No pricey-product dependence","No perfectionism pressure"]$j$::jsonb,
  keywords=$j$["home organization","organizing tips","declutter home","storage ideas","organized home","room by room"]$j$::jsonb
where slug='home-lifestyle-organization';

update registry.niches set
  audience=$t$Busy people wanting efficient cleaning and decluttering routines.$t$,
  dos=$j$["Provide cleaning schedules and checklists","Give quick daily and weekly routines","Include decluttering methods (keep/donate/toss)"]$j$::jsonb,
  donts=$j$["Include safety notes for cleaning chemicals","No judgment about clutter"]$j$::jsonb,
  keywords=$j$["cleaning routine","declutter","cleaning schedule","deep cleaning","cleaning checklist","tidy up"]$j$::jsonb
where slug='home-lifestyle-decluttering';

update registry.niches set
  audience=$t$Busy households wanting to plan meals, save money, and reduce waste.$t$,
  dos=$j$["Give weekly meal-plan templates and grocery lists","Focus on budget, batch cooking, and simple recipes","Include dietary flexibility notes"]$j$::jsonb,
  donts=$j$["No specific medical or diet claims (that is the Health niche)","Do not assume expensive ingredients"]$j$::jsonb,
  keywords=$j$["meal planning","meal prep","weekly menu","grocery list","budget meals","family meals"]$j$::jsonb
where slug='home-lifestyle-meal-planning';

update registry.niches set
  audience=$t$Beginner home gardeners growing plants, vegetables, or flowers.$t$,
  dos=$j$["Give beginner-friendly, season-by-season guidance","Cover small-space and container gardening","Include planting calendars and checklists"]$j$::jsonb,
  donts=$j$["Include safety notes for tools and chemicals","Do not assume a large yard"]$j$::jsonb,
  keywords=$j$["gardening for beginners","home garden","container gardening","vegetable garden","planting guide","garden planner"]$j$::jsonb
where slug='home-lifestyle-gardening';

update registry.niches set
  audience=$t$Renters and homeowners wanting a stylish home on a budget.$t$,
  dos=$j$["Give affordable, renter-friendly decor ideas","Include DIY and thrift approaches","Focus on high-impact, low-cost changes"]$j$::jsonb,
  donts=$j$["No expensive-renovation assumptions","Include safety notes for any DIY"]$j$::jsonb,
  keywords=$j$["budget decor","home decor ideas","rental decor","DIY decor","affordable home","small space decor"]$j$::jsonb
where slug='home-lifestyle-budget-decor';

-- ===========================================================================
-- TECHNOLOGY & DIGITAL TOOLS (technology-tools)
-- ===========================================================================
update registry.niches set
  pen_name='Ryan Mitchell', publisher_name='Grandfield Tech',
  pen_name_bio=$t$Ryan Mitchell writes plain-English guides that help everyday people use technology and digital tools with confidence. He turns intimidating tech into simple, step-by-step wins.$t$,
  audience=$t$Non-technical and semi-technical adults wanting to use modern tools (AI, apps, no-code) productively without a computer-science background.$t$,
  buying_motivation=$t$Confidence and a shortcut: using powerful tools effectively without wading through jargon or trial-and-error.$t$,
  voice_tone=$t$Friendly, clear tech guide. Jargon-free, step-by-step, reassuring for beginners.$t$,
  reading_level=$t$General adult; assume non-technical unless the sub-niche says otherwise.$t$,
  compliance_rules=$t$Tech changes fast, so frame tool specifics as current-at-writing and teach transferable concepts. Respect privacy and security best practices. No hacking, piracy, or policy-violating tactics.$t$,
  dos=$j$["Explain in plain English with step-by-step instructions","Teach concepts that outlast specific tool versions","Use concrete examples and use-cases","Cover privacy and safety basics"]$j$::jsonb,
  donts=$j$["No jargon without explanation","No hacking, piracy, or ToS-violating methods","Avoid assuming expensive hardware"]$j$::jsonb,
  keywords=$j$["AI tools","productivity apps","no-code","digital tools","tech for beginners","automation","ChatGPT","digital products"]$j$::jsonb,
  context_notes=$t$Fast-moving niche; sub-niches split by tool type (AI, no-code, productivity, security, digital products).$t$
where slug='technology-tools';

update registry.niches set
  audience=$t$Everyday users and professionals wanting to use AI tools (ChatGPT and others) and write better prompts.$t$,
  dos=$j$["Give ready-to-use prompt templates and examples","Teach prompt principles, not just one tool","Show real workflows and use-cases"]$j$::jsonb,
  donts=$j$["No claims of AI infallibility","Note that AI can be wrong and outputs must be verified"]$j$::jsonb,
  keywords=$j$["AI tools","ChatGPT","prompts","prompt engineering","AI for productivity","AI prompts","generative AI"]$j$::jsonb
where slug='technology-tools-ai-prompts';

update registry.niches set
  audience=$t$Non-developers building apps, sites, or automations with no-code tools.$t$,
  dos=$j$["Cover popular no-code and automation tools plainly","Give buildable project walkthroughs","Teach automation thinking (triggers and actions)"]$j$::jsonb,
  donts=$j$["Do not assume coding knowledge","Avoid tool lock-in dogma"]$j$::jsonb,
  keywords=$j$["no-code","automation","Zapier","no code apps","workflow automation","build without code"]$j$::jsonb
where slug='technology-tools-no-code';

update registry.niches set
  audience=$t$People wanting to get more done with apps (Notion, task managers, calendars).$t$,
  dos=$j$["Give setup templates and systems, not just app tours","Focus on habits and tools together","Cover popular apps neutrally"]$j$::jsonb,
  donts=$j$["No single-app-solves-all claims","Do not assume paid tiers"]$j$::jsonb,
  keywords=$j$["productivity apps","Notion","task management","productivity system","time management apps","digital planner"]$j$::jsonb
where slug='technology-tools-productivity';

update registry.niches set
  audience=$t$Everyday users wanting to stay safe online: passwords, scams, privacy.$t$,
  dos=$j$["Teach passwords, 2FA, phishing, and privacy basics","Use plain language and real scam examples","Give an actionable safety checklist"]$j$::jsonb,
  donts=$j$["No offensive hacking content","No false sense of total security"]$j$::jsonb,
  keywords=$j$["cybersecurity","online safety","password security","phishing","privacy","internet security","2FA"]$j$::jsonb
where slug='technology-tools-cybersecurity';

update registry.niches set
  audience=$t$Creators wanting to make and sell digital products (templates, ebooks, printables).$t$,
  dos=$j$["Cover ideation, tools, and platforms (Gumroad, Etsy)","Include creation and launch checklists","Focus on first-sale momentum"]$j$::jsonb,
  donts=$j$["No guaranteed-income claims","Respect copyright and licensing of assets used"]$j$::jsonb,
  keywords=$j$["digital products","sell digital products","printables","templates","Gumroad","digital downloads","passive income"]$j$::jsonb
where slug='technology-tools-digital-products';

-- ===========================================================================
-- MONEY & FINANCE (money-finance) — YMYL
-- ===========================================================================
update registry.niches set
  pen_name='Laura Bennett', publisher_name='Grandfield Press',
  pen_name_bio=$t$Laura Bennett writes friendly, judgment-free guides that help people take control of their everyday money: budgeting, saving, and spending with confidence. She focuses on practical education, not financial advice.$t$,
  audience=$t$Everyday people wanting to manage money better (budgeters, savers, and those tackling debt), not investors seeking advice.$t$,
  buying_motivation=$t$Control and peace of mind about money: a simple system to budget, save, and stop living paycheck to paycheck.$t$,
  voice_tone=$t$Warm, non-judgmental, empowering coach. Simple, shame-free, practical.$t$,
  reading_level=$t$General adult.$t$,
  compliance_rules=$t$YMYL - EDUCATION ONLY. Scope strictly to budgeting, saving, debt management, and financial literacy. NEVER give regulated investment, securities, tax, or legal advice, and never make personalized financial recommendations. No guaranteed returns or outcomes. Always frame as general education and recommend a licensed professional for personal financial, tax, or investment decisions.$t$,
  dos=$j$["Focus on budgeting, saving, and debt-payoff systems","Use worksheets, trackers, and real dollar examples","Keep it shame-free and beginner-friendly","Add a clear this-is-education-not-advice note"]$j$::jsonb,
  donts=$j$["No investment, securities, tax, or legal advice","No personalized recommendations","No guaranteed-return or get-out-of-debt-fast claims","No specific stock, crypto, or product picks"]$j$::jsonb,
  keywords=$j$["budgeting","personal finance","save money","debt payoff","money management","budget planner","financial literacy","frugal living"]$j$::jsonb,
  context_notes=$t$YMYL niche - strictest B8 compliance. All sub-niches inherit the education-only scope. Avoid anything resembling regulated advice.$t$
where slug='money-finance';

update registry.niches set
  audience=$t$People wanting to build and stick to a budget.$t$,
  dos=$j$["Give budgeting methods (50/30/20, zero-based, envelope)","Include budget templates and trackers","Address irregular income"]$j$::jsonb,
  donts=$j$["No investment or tax advice","No debt-consolidation product recommendations"]$j$::jsonb,
  keywords=$j$["budgeting","budget planner","how to budget","monthly budget","zero based budget","budget template"]$j$::jsonb
where slug='money-finance-budgeting';

update registry.niches set
  audience=$t$People wanting to save more consistently: emergency funds and goals.$t$,
  dos=$j$["Cover emergency funds, savings goals, and automation","Give savings challenges and trackers","Keep it practical for low incomes"]$j$::jsonb,
  donts=$j$["No investment-return promises","No specific account or product endorsements as advice"]$j$::jsonb,
  keywords=$j$["saving money","emergency fund","savings challenge","how to save","money saving tips","savings goals"]$j$::jsonb
where slug='money-finance-saving';

update registry.niches set
  audience=$t$People working to pay off debt (credit cards, loans).$t$,
  dos=$j$["Explain snowball vs avalanche methods","Include payoff trackers and plans","Be encouraging and shame-free"]$j$::jsonb,
  donts=$j$["No debt-settlement or consolidation advice or product picks","No legal or credit-repair advice"]$j$::jsonb,
  keywords=$j$["debt payoff","get out of debt","debt snowball","pay off credit cards","debt free","debt tracker"]$j$::jsonb
where slug='money-finance-debt-payoff';

update registry.niches set
  audience=$t$People wanting to spend less and stretch their money.$t$,
  dos=$j$["Give practical money-saving habits by category","Focus on realistic, sustainable frugality","Include challenges and printables"]$j$::jsonb,
  donts=$j$["No extreme or unsafe frugality","No income or investment claims"]$j$::jsonb,
  keywords=$j$["frugal living","save money","spend less","money saving","budget lifestyle","frugal tips"]$j$::jsonb
where slug='money-finance-frugal-living';

update registry.niches set
  audience=$t$People (including young adults) learning money basics from the ground up.$t$,
  dos=$j$["Explain core concepts (interest, credit, high-level taxes) simply","Use everyday examples","Keep it strictly educational"]$j$::jsonb,
  donts=$j$["No personalized or regulated advice","No specific product recommendations"]$j$::jsonb,
  keywords=$j$["financial literacy","money basics","personal finance 101","understanding credit","money education","financial education"]$j$::jsonb
where slug='money-finance-financial-literacy';

-- ===========================================================================
-- RELATIONSHIPS & FAMILY (relationships-family)
-- ===========================================================================
update registry.niches set
  pen_name='Rachel Adams', publisher_name='Grandfield Press',
  pen_name_bio=$t$Rachel Adams writes warm, practical guides for stronger relationships and calmer family life. She offers gentle, real-world tools, not clinical therapy, for everyday connection.$t$,
  audience=$t$Parents, partners, and family members wanting better communication, connection, and smoother family life.$t$,
  buying_motivation=$t$More harmony and connection, less conflict and stress: practical tools to handle real family and relationship moments.$t$,
  voice_tone=$t$Warm, empathetic, supportive. Non-judgmental, encouraging, down-to-earth.$t$,
  reading_level=$t$General adult.$t$,
  compliance_rules=$t$Supportive general guidance, NOT therapy, counseling, or medical/psychological advice. For serious issues (abuse, mental illness, crisis), direct readers to qualified professionals and helplines. No diagnosing. Be inclusive of all family structures.$t$,
  dos=$j$["Give practical communication scripts and activities","Be inclusive of diverse families and relationships","Include gentle, doable exercises","Point to professionals for serious issues"]$j$::jsonb,
  donts=$j$["No therapy, counseling, or medical claims or diagnosing","No stereotyping or one-right-way-to-family","Do not trivialize abuse or crisis - refer to help"]$j$::jsonb,
  keywords=$j$["relationships","parenting","family","communication","marriage","family activities","connection","co-parenting"]$j$::jsonb,
  context_notes=$t$Emotionally sensitive niche; keep supportive and non-clinical. Sub-niches split by relationship (parenting, marriage, activities, co-parenting, organization).$t$
where slug='relationships-family';

update registry.niches set
  audience=$t$Parents wanting practical, positive parenting tools.$t$,
  dos=$j$["Give age-aware, positive-discipline strategies","Include scripts for common challenges","Be non-judgmental and flexible"]$j$::jsonb,
  donts=$j$["No medical or developmental diagnosing","No one-style-fits-all dogma; refer to pros for concerns"]$j$::jsonb,
  keywords=$j$["parenting","positive parenting","parenting tips","toddler","discipline","raising kids","parenting help"]$j$::jsonb
where slug='relationships-family-parenting';

update registry.niches set
  audience=$t$Couples wanting stronger communication and connection.$t$,
  dos=$j$["Give communication exercises and conversation starters","Cover conflict, appreciation, and quality time","Be inclusive of all couples"]$j$::jsonb,
  donts=$j$["No therapy claims","Refer to counseling for serious issues; do not handle abuse casually"]$j$::jsonb,
  keywords=$j$["marriage","couples communication","relationship advice","strengthen marriage","couples exercises","connection"]$j$::jsonb
where slug='relationships-family-marriage';

update registry.niches set
  audience=$t$Families wanting fun, screen-free activities and traditions together.$t$,
  dos=$j$["Provide activity ideas by age and season","Keep them low-cost and easy to set up","Encourage connection and traditions"]$j$::jsonb,
  donts=$j$["No unsafe activities without supervision notes","Do not assume a specific family setup"]$j$::jsonb,
  keywords=$j$["family activities","family fun","things to do with kids","family time","screen-free","family traditions"]$j$::jsonb
where slug='relationships-family-activities';

update registry.niches set
  audience=$t$Separated or divorced parents co-parenting cooperatively.$t$,
  dos=$j$["Give communication and scheduling tools","Focus on the child wellbeing and low conflict","Include templates (schedules, agreements as ideas)"]$j$::jsonb,
  donts=$j$["No legal advice - refer to professionals","No taking sides or blame framing"]$j$::jsonb,
  keywords=$j$["co-parenting","divorced parents","parenting plan","custody schedule","co-parenting communication","blended family"]$j$::jsonb
where slug='relationships-family-coparenting';

update registry.niches set
  audience=$t$Busy families wanting to organize schedules, chores, and routines.$t$,
  dos=$j$["Provide planners, chore charts, and routines","Focus on shared systems the whole family uses","Keep it realistic for busy homes"]$j$::jsonb,
  donts=$j$["No rigid perfectionism","Do not assume a two-parent household"]$j$::jsonb,
  keywords=$j$["family organization","family planner","chore chart","family schedule","household routines","busy family"]$j$::jsonb
where slug='relationships-family-organization';

-- ===========================================================================
-- HEALTH & WELLNESS (health-wellness) — YMYL
-- ===========================================================================
update registry.niches set
  pen_name='Hannah Ross', publisher_name='Grandfield Wellness',
  pen_name_bio=$t$Hannah Ross writes encouraging, practical guides for everyday wellness: movement, habits, and self-care. She focuses on general education and healthy routines, not medical advice.$t$,
  audience=$t$General adults wanting to feel better through fitness, healthy habits, and self-care, not patients seeking medical guidance.$t$,
  buying_motivation=$t$Feeling better, more energetic, and in control of healthy habits: a simple, sustainable routine without overwhelm.$t$,
  voice_tone=$t$Encouraging, motivating, non-judgmental wellness coach. Supportive, realistic, body-positive.$t$,
  reading_level=$t$General adult.$t$,
  compliance_rules=$t$YMYL - GENERAL WELLNESS EDUCATION ONLY. Scope to fitness, healthy habits, and self-care. NEVER give medical advice, diagnoses, treatment, or specific diet prescriptions. No cures, dosages, or medical claims. Include a clear disclaimer to consult a qualified healthcare professional before changing diet or exercise, especially with any condition, pregnancy, or medication. Be body-positive and avoid harmful or extreme practices.$t$,
  dos=$j$["Focus on general fitness, habits, sleep, and self-care","Include a consult-a-doctor disclaimer","Use trackers, planners, and gentle routines","Be body-positive and inclusive of all fitness levels"]$j$::jsonb,
  donts=$j$["No medical advice, diagnoses, or treatment claims","No specific diet prescriptions, cures, or dosages","No extreme or unsafe fitness or eating practices","No before/after weight-loss guarantees"]$j$::jsonb,
  keywords=$j$["wellness","fitness","healthy habits","self-care","exercise plan","wellness journal","mental wellness","meal prep"]$j$::jsonb,
  context_notes=$t$YMYL niche - strictest B8 compliance. All sub-niches inherit the education-only, no-medical-claims scope and the consult-a-professional disclaimer.$t$
where slug='health-wellness';

update registry.niches set
  audience=$t$Adults wanting to get active with structured, doable workouts.$t$,
  dos=$j$["Give beginner-friendly workout plans and trackers","Offer modifications for all levels","Include the consult-a-doctor disclaimer"]$j$::jsonb,
  donts=$j$["No extreme programs or overtraining","No medical or injury-treatment advice"]$j$::jsonb,
  keywords=$j$["fitness plan","workout planner","exercise routine","beginner workout","home workout","fitness tracker"]$j$::jsonb
where slug='health-wellness-fitness';

update registry.niches set
  audience=$t$Adults wanting everyday tools for stress, mood, and mindfulness.$t$,
  dos=$j$["Offer general habits: journaling, mindfulness, routines","Normalize seeking professional help","Keep it gentle and practical"]$j$::jsonb,
  donts=$j$["No therapy, diagnosis, or treatment claims","Refer to professionals and helplines for crisis or mental illness"]$j$::jsonb,
  keywords=$j$["mental wellness","stress relief","mindfulness","self-care","journaling","mental health habits","relaxation"]$j$::jsonb
where slug='health-wellness-mental-wellness';

update registry.niches set
  audience=$t$Adults wanting general healthy-eating habits and meal prep.$t$,
  dos=$j$["Focus on general balanced-eating habits and meal prep","Give planners and grocery lists","Include the consult-a-professional disclaimer"]$j$::jsonb,
  donts=$j$["No specific diet prescriptions, calorie targets, or medical nutrition therapy","No cure or weight-loss guarantees"]$j$::jsonb,
  keywords=$j$["healthy eating","meal prep","nutrition basics","meal planning","healthy recipes","balanced diet"]$j$::jsonb
where slug='health-wellness-nutrition';

update registry.niches set
  audience=$t$Adults wanting better sleep and healthier daily habits.$t$,
  dos=$j$["Give sleep-hygiene and habit-building routines","Include trackers and simple checklists","Keep advice general and evidence-informed"]$j$::jsonb,
  donts=$j$["No treatment for sleep disorders - refer to a doctor","No medication or supplement dosing"]$j$::jsonb,
  keywords=$j$["better sleep","sleep habits","healthy habits","habit tracker","sleep routine","morning routine"]$j$::jsonb
where slug='health-wellness-sleep-habits';

update registry.niches set
  audience=$t$Adults wanting reflective self-care and journaling practices.$t$,
  dos=$j$["Provide prompts, trackers, and gentle routines","Encourage reflection and small wins","Keep it supportive and pressure-free"]$j$::jsonb,
  donts=$j$["No therapy claims","Refer to professionals for mental-health concerns"]$j$::jsonb,
  keywords=$j$["self-care","journaling","self-care journal","wellness journal","gratitude","reflection prompts"]$j$::jsonb
where slug='health-wellness-self-care';

-- ===========================================================================
-- EVENTS & CELEBRATIONS (events-celebrations)
-- ===========================================================================
update registry.niches set
  pen_name='Grace Parker', publisher_name='Grandfield Press',
  pen_name_bio=$t$Grace Parker writes cheerful, practical guides and planners for celebrations big and small. She loves turning event stress into organized, joyful, budget-friendly plans.$t$,
  audience=$t$People planning events and celebrations (weddings, parties, holidays, showers), often DIY and budget-conscious.$t$,
  buying_motivation=$t$A beautiful, well-run event without the overwhelm: organized checklists, timelines, and budget control that reduce stress.$t$,
  voice_tone=$t$Cheerful, organized, reassuring planner-friend. Encouraging and practical.$t$,
  reading_level=$t$General adult.$t$,
  compliance_rules=$t$General planning guidance. Include safety notes for anything involving candles, food handling, alcohol, or large gatherings where relevant. No liability for vendor or venue outcomes.$t$,
  dos=$j$["Provide checklists, timelines, and budget trackers","Offer DIY and budget-friendly options","Cover planning end to end (guests, food, decor)","Include printables and templates"]$j$::jsonb,
  donts=$j$["No expensive-vendor assumptions","Include safety notes (candles, food, alcohol)","No cultural or religious stereotyping of traditions"]$j$::jsonb,
  keywords=$j$["event planning","party planning","wedding planner","birthday party","holiday planning","celebration","party checklist","event planner"]$j$::jsonb,
  context_notes=$t$Sub-niches split by event type (weddings, birthdays, holidays, baby showers, corporate).$t$
where slug='events-celebrations';

update registry.niches set
  audience=$t$Couples and planners organizing a wedding, often on a budget.$t$,
  dos=$j$["Give timelines, budgets, and vendor checklists","Cover DIY and cost-saving options","Include guest, seating, and day-of planners"]$j$::jsonb,
  donts=$j$["No assumptions about the couple religion or culture","No pricey-vendor dependence"]$j$::jsonb,
  keywords=$j$["wedding planning","wedding planner","wedding checklist","wedding budget","wedding timeline","DIY wedding"]$j$::jsonb
where slug='events-celebrations-weddings';

update registry.niches set
  audience=$t$Parents and hosts planning birthday parties for kids or adults.$t$,
  dos=$j$["Provide themed checklists and timelines","Include budget and DIY decor ideas","Cover invites, games, and food"]$j$::jsonb,
  donts=$j$["Include safety notes for kids activities and food","No expensive-venue assumptions"]$j$::jsonb,
  keywords=$j$["birthday party","party planning","kids birthday","party ideas","party checklist","birthday planner"]$j$::jsonb
where slug='events-celebrations-birthdays';

update registry.niches set
  audience=$t$People planning holidays and seasonal gatherings.$t$,
  dos=$j$["Give holiday prep checklists and timelines","Cover budgeting, hosting, and gifting","Offer make-ahead and stress-reduction tips"]$j$::jsonb,
  donts=$j$["Be inclusive of many holidays; do not assume one tradition","Include food and candle safety notes"]$j$::jsonb,
  keywords=$j$["holiday planning","holiday checklist","hosting","seasonal","holiday prep","gift planning"]$j$::jsonb
where slug='events-celebrations-holidays';

update registry.niches set
  audience=$t$Hosts planning baby showers and related celebrations.$t$,
  dos=$j$["Provide themes, games, checklists, and timelines","Include budget and DIY options","Cover invites, food, and favors"]$j$::jsonb,
  donts=$j$["Be sensitive and inclusive (no assumptions about the family)","No expensive assumptions"]$j$::jsonb,
  keywords=$j$["baby shower","baby shower ideas","shower games","baby shower checklist","party planning","shower themes"]$j$::jsonb
where slug='events-celebrations-baby-showers';

update registry.niches set
  audience=$t$Professionals organizing corporate events, parties, or team gatherings.$t$,
  dos=$j$["Give planning timelines, budgets, and vendor checklists","Cover logistics, catering, and AV","Include team-friendly and hybrid options"]$j$::jsonb,
  donts=$j$["No assumptions about company size or budget","Include safety and liability notes for large events"]$j$::jsonb,
  keywords=$j$["corporate event","event planning","team event","company party","conference planning","event checklist"]$j$::jsonb
where slug='events-celebrations-corporate';

-- ===========================================================================
-- SAP INTEGRATION (sap-integration) — srini.pro, technical B2B
-- Pen name is a PLACEHOLDER: srini.pro is Srini's personal brand; set his real
-- professional author name/bio before producing under this niche.
-- ===========================================================================
update registry.niches set
  pen_name='Srini', publisher_name='srini.pro',
  pen_name_bio=$t$(PLACEHOLDER - set Srini's real professional bio.) Practitioner guides for SAP integration professionals, cutting through complexity with real-world patterns, gotchas, and step-by-step implementation guidance.$t$,
  audience=$t$SAP integration professionals - developers, consultants, and architects - working with SAP middleware and cloud integration, from those upskilling to experienced practitioners.$t$,
  buying_motivation=$t$Practical, real-world implementation knowledge that saves days of trial-and-error: patterns, gotchas, and step-by-step guidance not found in dry official docs.$t$,
  voice_tone=$t$Expert practitioner peer. Precise, technical, no fluff; assumes professional context. Clear on the why and the gotchas.$t$,
  reading_level=$t$Technical professional (B2B); assumes an SAP/IT background.$t$,
  compliance_rules=$t$Technical accuracy is paramount - SAP products evolve, so frame version-specific details as current-at-writing and note releases. Respect SAP trademarks (use nominatively, no implied endorsement or affiliation). Do not reproduce SAP copyrighted documentation or licensed content; teach concepts with original examples. Never share licensed software or credentials.$t$,
  dos=$j$["Use precise, correct SAP terminology and current product names","Give real implementation steps, config/code patterns, and gotchas","Note SAP version/release applicability","Include real-world scenarios and diagrams-in-words"]$j$::jsonb,
  donts=$j$["No reproduction of SAP copyrighted docs","No implied SAP endorsement or affiliation","No outdated product names without noting deprecation","Do not oversimplify to the point of being wrong"]$j$::jsonb,
  keywords=$j$["SAP integration","SAP PI/PO","SAP Integration Suite","SAP BTP","SAP CPI","middleware","API management","iFlow"]$j$::jsonb,
  context_notes=$t$srini.pro personal/technical brand - B2B, expert audience, NOT consumer. Pen name is a placeholder; set Srini's real professional identity. Different economics: fewer, higher-value technical readers.$t$
where slug='sap-integration';

update registry.niches set
  audience=$t$Developers and consultants working with SAP Process Orchestration / PI (on-prem middleware), including those migrating off it.$t$,
  dos=$j$["Cover ESR/ID objects, adapters, mappings, and monitoring","Give real scenario examples and troubleshooting","Address the migration-to-Integration-Suite context"]$j$::jsonb,
  donts=$j$["Do not present PO as SAP's strategic future (note the shift to Integration Suite)","No copyrighted SAP doc reproduction"]$j$::jsonb,
  keywords=$j$["SAP PO","SAP PI","Process Orchestration","ESR","adapters","message mapping","PI monitoring"]$j$::jsonb
where slug='sap-integration-po';

update registry.niches set
  audience=$t$Professionals building integrations on SAP Integration Suite (Cloud Integration/CPI, API Management).$t$,
  dos=$j$["Cover iFlows, adapters, mappings, and API Management","Give real Cloud Integration patterns and error handling","Note capabilities and current features"]$j$::jsonb,
  donts=$j$["Note version and feature currency","No reproduction of SAP licensed content"]$j$::jsonb,
  keywords=$j$["SAP Integration Suite","SAP CPI","Cloud Integration","iFlow","API Management","integration flows","Groovy scripting"]$j$::jsonb
where slug='sap-integration-suite';

update registry.niches set
  audience=$t$Developers and architects working on SAP Business Technology Platform (services, extensions, integration).$t$,
  dos=$j$["Explain BTP services, environments (Cloud Foundry/Kyma), and setup","Give practical extension and integration scenarios","Cover security and connectivity basics"]$j$::jsonb,
  donts=$j$["Note fast-changing BTP services/pricing as current-at-writing","No licensed content reproduction"]$j$::jsonb,
  keywords=$j$["SAP BTP","Business Technology Platform","Cloud Foundry","Kyma","BTP services","SAP extensions","BTP integration"]$j$::jsonb
where slug='sap-integration-btp';

update registry.niches set
  audience=$t$SAP professionals exploring AI on SAP (AI Core, Generative AI Hub, Joule, AI in integration).$t$,
  dos=$j$["Cover SAP AI Core, Generative AI Hub, and Joule at a practical level","Give real use-cases for AI in SAP landscapes","Explain integrating AI services with SAP data"]$j$::jsonb,
  donts=$j$["Flag this as fast-evolving; mark features current-at-writing","No overpromising AI capabilities","No licensed content reproduction"]$j$::jsonb,
  keywords=$j$["SAP AI","SAP AI Core","Generative AI Hub","SAP Joule","AI in SAP","SAP machine learning","AI integration"]$j$::jsonb
where slug='sap-integration-ai';
