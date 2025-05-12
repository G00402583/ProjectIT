
/* ==============================================================
   1. Supabase client
   ==============================================================*/
   const SUPABASE_URL      = '#';
   const SUPABASE_ANON_KEY = '#';
   const TABLE_NAME        = 'program_choices';
   
   const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
   
   /* ==============================================================
      2. Wizard logic
      ==============================================================*/
   (async () => {
   
     /* ---------- 2.1  Identify the visitor ---------------------- */
     let firstName = '👨‍💻';
     let userId    = null;
   
     try {
       const { data: { session } } = await sb.auth.getSession();
       if (session) {
         userId = session.user.id;
   
         const { data: profile } = await sb
           .from('profiles')
           .select('first_name')
           .eq('id', userId)
           .single();
   
         firstName =
           profile?.first_name?.trim() ||
           session.user.user_metadata?.full_name?.split(' ')[0] ||
           session.user.email.split('@')[0];
       }
     } catch {/* ignore errors, keep "👨‍💻" */ }
   
     /* ---------- 2.2  Cache DOM elements ------------------------ */
     const steps    = Array.from({ length: 9 }, (_, i) => document.getElementById(`step${i + 1}`));
     const nextBtns = [1,2,3,4,5,6,7,8].map(n => document.getElementById(`btnNext${n}`));
     const backBtns = [1,2,3,4,5,6,7,8].map(n => document.getElementById(`btnBack${n}`));
     const recBox   = document.getElementById('recommendationBox');
   
     /* ---------- 2.3  State store ------------------------------- */
     const state = {
       age      : '', body   : '', gender : '',
       goal     : '', fitness: '', injury : '',
       location : '', time   : ''
     };
   
     /* ---------- 2.4  Utility functions ------------------------- */
     let currentIndex = 0;
     const showStep = idx => {
       steps.forEach((s, i) => s.classList.toggle('active', i === idx));
       currentIndex = idx;
     };
   
     const handleSelect = (card, key) => {
       card.parentElement
           .querySelectorAll('.card')
           .forEach(c => c.classList.remove('selected'));
       card.classList.add('selected');
   
       state[key] = card.dataset[key];
       nextBtns[currentIndex].disabled = false;
     };
   
     /* attach card-click listeners */
     const keys = ['age','body','gender','goal','fitness','injury','location','time'];
     keys.forEach((key, idx) => {
       steps[idx].querySelectorAll('.card')
         .forEach(card => card.addEventListener('click', () => handleSelect(card, key)));
     });
   
     /* ---------- 2.5  Next / Back navigation -------------------- */
     nextBtns.forEach(btn => btn.addEventListener('click', async () => {
       if (currentIndex < steps.length - 1) showStep(currentIndex + 1);
   
       /* Step-9 → build & save */
       if (currentIndex === steps.length - 1) {
         recBox.innerHTML = buildRecommendation();
         await saveToSupabase();
       }
     }));
   
     backBtns.forEach(btn => btn.addEventListener('click', () => {
       if (currentIndex > 0) showStep(currentIndex - 1);
     }));
   
     /* ---------- 2.6  Generate recommendation ------------------- */
     function buildRecommendation () {
   
       /* (A) Goal-specific program + tips */
       let program = 'Balanced Fitness & Nutrition Program';
       let tips    = [];
   
       switch (state.goal) {
         case 'muscle-gain':
           program = 'Muscle-Gain Mastery Program';
           tips = [
             '<a href="shop.html">Muscle-Gain eBook</a>',
             '<a href="courses.html">Beginner Course</a>'
           ];
           break;
         case 'weight-loss':
           program = 'FAST Fat-Loss Program';
           tips = [
             '<a href="shop.html">FAST Fat-Loss eBook</a>',
             '<a href="courses.html">HIIT Course</a>'
           ];
           break;
         case 'toning':
           program = 'Total-Tone Program';
           tips = ['<a href="shop.html">Train Efficiently eBook</a>'];
           break;
         default:
           program = 'Holistic Health Program';
           tips = ['<a href="shop.html">Energy-Exertion eBook</a>'];
       }
   
       /* (B) Grammar helpers */
       const fitnessTxt = {
         beginner    : 'a beginner',
         intermediate: 'an intermediate trainee',
         advanced    : 'an advanced athlete'
       }[state.fitness] || 'an athlete';
   
       const locationTxt = {
         gym     : 'the gym',
         home    : 'a home environment',
         outdoors: 'an outdoor setting'
       }[state.location] || 'your chosen space';
   
       const injuryTxt = {
         none : 'no injuries',
         minor: 'some minor injuries',
         major: 'major or chronic injuries'
       }[state.injury] || 'injuries';
   
       /* (C) Time-choice phrasing + micro-tip */
       const timeMap = {
         '30min':  {
           phrase: 'your planned 30-minute sessions',
           micro : 'Focus on compound moves to maximise every minute.'
         },
         '1hour':  {
           phrase: 'your 1-hour routine',
           micro : 'Split the hour into warm-up, strength, then a short finisher.'
         },
         '2hours': {
           phrase: 'your 2-hour daily block',
           micro : 'Separate strength and cardio to get the most out of that time.'
         }
       };
       const timeInfo = timeMap[state.time] || { phrase:`your ${state.time} sessions`, micro:'' };
   
       /* (D) Build the HTML */
       return `
         <h3>Hello, <span style="color:#7b4cf0;">${firstName}</span>!</h3>
   
         <p>${program} is perfect for your
            <strong>${state.age}</strong> age range and
            <strong>${state.body}</strong> body type${state.goal
              ? `, with a goal of <strong>${state.goal}</strong>` : ''}.
         </p>
   
         <p>Since you're <strong>${fitnessTxt}</strong>,
            training in <strong>${locationTxt}</strong> and have
            <strong>${injuryTxt}</strong>, <strong>${timeInfo.phrase}</strong> will set you up for success.</p>
   
         ${timeInfo.micro ? `<p>${timeInfo.micro}</p>` : ''}
   
         <p style="margin-top:1rem;"><strong>Tip:</strong> Check out
            ${tips.join(' and ')} for more details!</p>
       `;
     }
   
     /* ---------- 2.7  Persist to Supabase ----------------------- */
     async function saveToSupabase () {
       const payload = {
         user_id         : userId,
         age             : state.age,
         body_type       : state.body,
         gender          : state.gender,
         goal            : state.goal,
         fitness_level   : state.fitness,
         injury_status   : state.injury,
         workout_location: state.location,
         time_commitment : state.time,
         created_at      : new Date().toISOString()
       };
   
       const { error } = await sb.from(TABLE_NAME).insert([payload]);
       if (error) console.error('Supabase insert failed:', error.message);
     }
   
    
     showStep(0);
   
   })();   
   
