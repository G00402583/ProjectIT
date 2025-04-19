/*****************************************
 1. Supabase Configuration
*****************************************/
// Replace with your actual Supabase values
const SUPABASE_URL = "https://kqzevnsdurpptiaxszqq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxemV2bnNkdXJwcHRpYXhzenFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMjA4NDYsImV4cCI6MjA1OTU5Njg0Nn0.eM-M08VulR5HiwKs-t7y2xehqUwBJPW0dnKENxMvArg"; // truncated for brevity

// Create the Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Name of your table in Supabase
const TABLE_NAME = "program_choices";

/*****************************************
 2. Wizard Variables
*****************************************/
let selectedAge    = null;
let selectedBody   = null;
let selectedGender = null;
let selectedGoal   = null;
let selectedFitness = null;
let selectedInjury = null;
let selectedLocation = null;
let selectedTime   = null;

// Step sections
const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const step3 = document.getElementById("step3");
const step4 = document.getElementById("step4");
const step5 = document.getElementById("step5");
const step6 = document.getElementById("step6");
const step7 = document.getElementById("step7");
const step8 = document.getElementById("step8");
const step9 = document.getElementById("step9");

// Buttons
const btnNext1 = document.getElementById("btnNext1");
const btnNext2 = document.getElementById("btnNext2");
const btnNext3 = document.getElementById("btnNext3");
const btnNext4 = document.getElementById("btnNext4");
const btnNext5 = document.getElementById("btnNext5");
const btnNext6 = document.getElementById("btnNext6");
const btnNext7 = document.getElementById("btnNext7");
const btnNext8 = document.getElementById("btnNext8");

const btnBack1 = document.getElementById("btnBack1");
const btnBack2 = document.getElementById("btnBack2");
const btnBack3 = document.getElementById("btnBack3");
const btnBack4 = document.getElementById("btnBack4");
const btnBack5 = document.getElementById("btnBack5");
const btnBack6 = document.getElementById("btnBack6");
const btnBack7 = document.getElementById("btnBack7");
const btnBack8 = document.getElementById("btnBack8");

// Recommendation box
const recommendationBox = document.getElementById("recommendationBox");

/*****************************************
 3. Wizard Step Event Listeners
*****************************************/
// === STEP 1: Age selection
step1.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    step1.querySelectorAll(".card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");
    selectedAge = card.getAttribute("data-age");
    btnNext1.disabled = false;
  });
});
btnNext1.addEventListener("click", () => {
  step1.classList.remove("active");
  step2.classList.add("active");
});

// === STEP 2: Body type
step2.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    step2.querySelectorAll(".card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");
    selectedBody = card.getAttribute("data-body");
    btnNext2.disabled = false;
  });
});
btnNext2.addEventListener("click", () => {
  step2.classList.remove("active");
  step3.classList.add("active");
});
btnBack1.addEventListener("click", () => {
  step2.classList.remove("active");
  step1.classList.add("active");
});

// === STEP 3: Gender
step3.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    step3.querySelectorAll(".card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");
    selectedGender = card.getAttribute("data-gender");
    btnNext3.disabled = false;
  });
});
btnNext3.addEventListener("click", () => {
  step3.classList.remove("active");
  step4.classList.add("active");
});
btnBack2.addEventListener("click", () => {
  step3.classList.remove("active");
  step2.classList.add("active");
});

// === STEP 4: Primary Goal
step4.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    step4.querySelectorAll(".card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");
    selectedGoal = card.getAttribute("data-goal");
    btnNext4.disabled = false;
  });
});
btnNext4.addEventListener("click", () => {
  step4.classList.remove("active");
  step5.classList.add("active");
});
btnBack3.addEventListener("click", () => {
  step4.classList.remove("active");
  step3.classList.add("active");
});

// === STEP 5: Fitness Level
step5.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    step5.querySelectorAll(".card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");
    selectedFitness = card.getAttribute("data-fitness");
    btnNext5.disabled = false;
  });
});
btnNext5.addEventListener("click", () => {
  step5.classList.remove("active");
  step6.classList.add("active");
});
btnBack4.addEventListener("click", () => {
  step5.classList.remove("active");
  step4.classList.add("active");
});

// === STEP 6: Injury
step6.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    step6.querySelectorAll(".card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");
    selectedInjury = card.getAttribute("data-injury");
    btnNext6.disabled = false;
  });
});
btnNext6.addEventListener("click", () => {
  step6.classList.remove("active");
  step7.classList.add("active");
});
btnBack5.addEventListener("click", () => {
  step6.classList.remove("active");
  step5.classList.add("active");
});

// === STEP 7: Location
step7.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    step7.querySelectorAll(".card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");
    selectedLocation = card.getAttribute("data-location");
    btnNext7.disabled = false;
  });
});
btnNext7.addEventListener("click", () => {
  step7.classList.remove("active");
  step8.classList.add("active");
});
btnBack6.addEventListener("click", () => {
  step7.classList.remove("active");
  step6.classList.add("active");
});

// === STEP 8: Time Commitment
step8.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    step8.querySelectorAll(".card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");
    selectedTime = card.getAttribute("data-time");
    btnNext8.disabled = false;
  });
});
btnNext8.addEventListener("click", async () => {
  step8.classList.remove("active");
  step9.classList.add("active");

  // Show the recommendation
  recommendationBox.innerHTML = getRecommendation();

  // Then save to Supabase
  await saveToSupabase();
});
btnBack7.addEventListener("click", () => {
  step8.classList.remove("active");
  step7.classList.add("active");
});

// === FINAL STEP (STEP 9)
btnBack8.addEventListener("click", () => {
  step9.classList.remove("active");
  step8.classList.add("active");
});

/*****************************************
 4. Save to Supabase
*****************************************/
async function saveToSupabase() {
  const payload = {
    age: selectedAge,
    body_type: selectedBody,
    gender: selectedGender,
    goal: selectedGoal,
    fitness_level: selectedFitness,
    injury_status: selectedInjury,
    workout_location: selectedLocation,
    time_commitment: selectedTime,
    created_at: new Date().toISOString()
  };

  // Insert into your table
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([ payload ]);

  if (error) {
    console.error("Error inserting data:", error.message);
  } else {
    console.log("Data successfully inserted:", data);
  }
}

/*****************************************
 5. Recommendation Logic
*****************************************/
function getRecommendation() {
  return `
    <h3>Hello, ${selectedGender || 'friend'}!</h3>
    <p>A Balanced Fitness and Nutrition Program is perfect for your 
    <strong>${selectedAge}</strong> age range,
    <strong>${selectedBody}</strong> body type,
    with a goal of <strong>${selectedGoal}</strong>.<br>
    Since you're <strong>${selectedFitness}</strong>,
    working out in a <strong>${selectedLocation}</strong> setting, and have
    <strong>${selectedInjury === 'none' ? 'no injuries' : selectedInjury + ' injuries'}</strong>,
    we recommend dedicating <strong>${selectedTime}</strong> to your daily routine.</p>

    <p><strong>Tip:</strong> Check out our 
    <a href="shop.html">Nutrition E-book</a> and 
    <a href="courses.html">Workout Plan</a> for more details!</p>
  `;
}
